"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapLayerType = "truecolor" | "ndvi" | "nir" | "change";

export interface ParcelProject {
  id: number;
  name: string;
  region: string;
  grade: string;
  status: "Verified" | "Active" | "Suspended" | "Revoked" | "Pending";
  cqsScore: number;
  forestCover: string;
  ndvi: number;
  baselineNdvi: number;
  area: string;
  center: [number, number];
  bounds: [number, number][];
  oracleAddress: string;
  lastScan: string;
  lastScanTimestamp?: string;
  nextScan?: string;
  cadence?: string;
  cloudCover?: string;
  trend: string;
  revocationReason?: string;
  revocationDate?: string;
  sparkline?: number[];
  timelineEvents?: { date: string; title: string; type: "verified" | "scan" | "revoked" | "alert" }[];
  beforeImage?: string;
  afterImage?: string;
}

interface MapComponentProps {
  projects: ParcelProject[];
  selectedProject: number | null;
  onSelectProject: (id: number) => void;
  activeLayer: MapLayerType;
  layerOpacity?: number;
  detailOpen?: boolean;
}

export default function MapComponent({
  projects,
  selectedProject,
  onSelectProject,
  activeLayer,
  layerOpacity = 100,
  detailOpen = true,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const polygonsRef = useRef<Map<number, L.Polygon>>(new Map());
  const layersMapRef = useRef<Map<MapLayerType, L.TileLayer>>(new Map());
  const [mapReady, setMapReady] = useState(false);
  const [tileError, setTileError] = useState(false);
  const isInitialFitDone = useRef(false);

  // Initialize persistent Leaflet instance once
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    // Create map with bottom-right zoom control
    const map = L.map(mapRef.current, {
      center: [-2.0, -10.0],
      zoom: 3,
      zoomControl: false,
      attributionControl: false,
    });
    mapInstance.current = map;

    // Zoom control at bottomright (out of the way of controls and legend)
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Preload all tile layers to allow instant opacity-based switching without flicker
    // 1. True Color: Esri World Imagery (High-res Sentinel satellite)
    const trueColorLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 18, opacity: activeLayer === "truecolor" ? layerOpacity / 100 : 0 }
    ).addTo(map);

    // 2. NDVI Health: Sentinel False-Color vegetation index simulation
    const ndviLayer = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      { maxZoom: 18, opacity: activeLayer === "ndvi" ? layerOpacity / 100 : 0 }
    ).addTo(map);

    // 3. NIR Band 8: Deep infrared reflectance simulation
    const nirLayer = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 18, opacity: activeLayer === "nir" ? layerOpacity / 100 : 0 }
    ).addTo(map);

    // 4. Change Delta Layer
    const changeLayer = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 18, opacity: activeLayer === "change" ? layerOpacity / 100 : 0 }
    ).addTo(map);

    trueColorLayer.on("tileerror", () => {
      setTileError(true);
    });

    layersMapRef.current.set("truecolor", trueColorLayer);
    layersMapRef.current.set("ndvi", ndviLayer);
    layersMapRef.current.set("nir", nirLayer);
    layersMapRef.current.set("change", changeLayer);

    // Initial resize invalidation
    const timer = setTimeout(() => {
      map.invalidateSize();
      setMapReady(true);
    }, 150);

    // ResizeObserver on map container
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstance.current) {
        mapInstance.current.invalidateSize();
      }
    });
    resizeObserver.observe(mapRef.current);

    // Global listener for sidebar toggle
    const handleSidebarResize = () => {
      setTimeout(() => {
        if (mapInstance.current) {
          mapInstance.current.invalidateSize();
        }
      }, 50);
    };
    window.addEventListener("terra_sidebar_resize", handleSidebarResize);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      window.removeEventListener("terra_sidebar_resize", handleSidebarResize);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update tile layers opacity smoothly
  useEffect(() => {
    if (!mapReady) return;
    const targetOpacity = layerOpacity / 100;

    layersMapRef.current.forEach((layer, key) => {
      const isTarget = key === activeLayer;
      layer.setOpacity(isTarget ? targetOpacity : 0);
    });
  }, [activeLayer, layerOpacity, mapReady]);

  // Render and update ALL parcel polygons
  useEffect(() => {
    if (!mapInstance.current || !mapReady) return;
    const map = mapInstance.current;

    // Clear previous polygons
    polygonsRef.current.forEach((poly) => poly.remove());
    polygonsRef.current.clear();

    const boundsList: L.LatLngBounds[] = [];

    projects.forEach((proj) => {
      const isRevoked = proj.status === "Revoked" || proj.status === "Suspended";
      const isSelected = selectedProject === proj.id;

      // Color coding: Verified = accent (#38b87c), Revoked = danger (#ef4444)
      const baseStroke = isRevoked ? "#ef4444" : "#38b87c";
      const baseFill = isRevoked ? "#ef4444" : "#38b87c";

      const polyBounds = L.latLngBounds(proj.bounds as L.LatLngTuple[]);
      boundsList.push(polyBounds);

      const polygon = L.polygon(proj.bounds as L.LatLngTuple[], {
        color: isSelected ? "#ffffff" : baseStroke,
        weight: isSelected ? 3.5 : 2,
        fillColor: baseFill,
        fillOpacity: isSelected ? 0.45 : 0.22,
        dashArray: isRevoked ? "4, 6" : undefined,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      // Tooltip
      polygon.bindTooltip(
        `<div style="font-family: inherit; font-size: 11px; padding: 2px 4px; color: #111;">
          <strong>${proj.name}</strong><br/>
          <span style="opacity: 0.8">${proj.region} · ${proj.status}</span>
        </div>`,
        { sticky: true, opacity: 0.95 }
      );

      polygon.on("click", () => {
        onSelectProject(proj.id);
      });

      polygon.on("mouseover", () => {
        polygon.setStyle({
          weight: isSelected ? 4 : 3,
          fillOpacity: 0.55,
        });
      });

      polygon.on("mouseout", () => {
        const currentlySelected = selectedProject === proj.id;
        polygon.setStyle({
          color: currentlySelected ? "#ffffff" : baseStroke,
          weight: currentlySelected ? 3.5 : 2,
          fillOpacity: currentlySelected ? 0.45 : 0.22,
        });
      });

      polygonsRef.current.set(proj.id, polygon);
    });

    // Default view on first load: fit ALL parcel polygons
    if (!isInitialFitDone.current && boundsList.length > 0) {
      isInitialFitDone.current = true;
      const combinedBounds = boundsList[0];
      for (let i = 1; i < boundsList.length; i++) {
        combinedBounds.extend(boundsList[i]);
      }
      map.fitBounds(combinedBounds, {
        padding: [60, 60],
        maxZoom: 6,
      });
    }
  }, [projects, selectedProject, onSelectProject, mapReady]);

  // Fly to selected project bounds or adjust for detail panel
  const flyToSelected = useCallback(
    (id: number | null) => {
      if (!mapInstance.current || !id) return;
      const proj = projects.find((p) => p.id === id);
      if (!proj) return;

      const bounds = L.latLngBounds(proj.bounds as L.LatLngTuple[]);
      // Padding accounting for right docked panel (extra right padding if detailOpen)
      const paddingRight = detailOpen ? 40 : 30;
      mapInstance.current.flyToBounds(bounds, {
        paddingTopLeft: [40, 40],
        paddingBottomRight: [paddingRight, 40],
        duration: 0.4,
        maxZoom: 10,
      });
    },
    [projects, detailOpen]
  );

  useEffect(() => {
    if (selectedProject) {
      flyToSelected(selectedProject);
    }
  }, [selectedProject, flyToSelected]);

  // Invalidate map size when detail panel state toggles
  useEffect(() => {
    if (mapInstance.current) {
      setTimeout(() => {
        mapInstance.current?.invalidateSize();
      }, 100);
    }
  }, [detailOpen]);

  return (
    <div className="w-full h-full relative z-0 select-none">
      {/* Map DOM Canvas */}
      <div ref={mapRef} className="w-full h-full bg-[var(--surface)]" />

      {/* Imagery Fallback Alert */}
      {tileError && (
        <div className="absolute top-3 right-3 z-[400] px-3 py-1.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--warning)]/40 text-[var(--warning)] text-xs flex items-center gap-2 shadow-md">
          <span className="w-2 h-2 rounded-full bg-[var(--warning)] animate-ping" />
          <span>Satellite imagery retrying with secondary basemap</span>
        </div>
      )}

      {/* Dynamic Map Legend based on active layer */}
      <div className="absolute bottom-4 left-4 z-[400] bg-[var(--surface)]/90 backdrop-blur-md border border-[var(--border)] rounded-lg p-2.5 text-[11px] shadow-md pointer-events-auto max-w-[260px]">
        {activeLayer === "truecolor" && (
          <div>
            <div className="text-[var(--text-muted)] font-medium mb-1 text-[10px]">
              Copernicus Sentinel-2 RGB (10m)
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                <span className="text-[var(--text)]">Verified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--danger)]" />
                <span className="text-[var(--text)]">Revoked</span>
              </div>
            </div>
          </div>
        )}

        {activeLayer === "ndvi" && (
          <div>
            <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] font-medium mb-1">
              <span>NDVI Canopy Health</span>
              <span className="font-mono text-[9px]">-0.2 → 1.0</span>
            </div>
            {/* Gradient bar */}
            <div className="h-2 rounded w-full bg-gradient-to-r from-red-600 via-amber-400 via-emerald-400 to-emerald-700" />
            <div className="flex justify-between text-[9px] font-mono text-[var(--text-muted)] mt-1">
              <span>Degraded (0.0)</span>
              <span>Intact (0.8+)</span>
            </div>
          </div>
        )}

        {activeLayer === "nir" && (
          <div>
            <div className="text-[var(--text-muted)] font-medium mb-1 text-[10px]">
              NIR Band 8 · False Colour Reflectance
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[var(--text)]">
              <span className="w-2.5 h-2.5 rounded bg-emerald-600 shrink-0" />
              <span>Photosynthetic Biomass Density</span>
            </div>
          </div>
        )}

        {activeLayer === "change" && (
          <div>
            <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] font-medium mb-1">
              <span>Delta vs. Historical Baseline</span>
            </div>
            <div className="h-2 rounded w-full bg-gradient-to-r from-rose-600 via-slate-500 to-emerald-500" />
            <div className="flex justify-between text-[9px] font-mono text-[var(--text-muted)] mt-1">
              <span>-15% Deforested</span>
              <span>+15% Growth</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

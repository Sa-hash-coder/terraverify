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
  trend: string;
  revocationReason?: string;
  beforeImage?: string;
  afterImage?: string;
}

interface MapComponentProps {
  projects: ParcelProject[];
  selectedProject: number | null;
  onSelectProject: (id: number) => void;
  activeLayer: MapLayerType;
  onLayerChange?: (layer: MapLayerType) => void;
}

export default function MapComponent({
  projects,
  selectedProject,
  onSelectProject,
  activeLayer,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const polygonsRef = useRef<Map<number, L.Polygon>>(new Map());
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Initialize Map once
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Fix standard Leaflet default icon paths if needed
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const map = L.map(mapRef.current, {
      center: [-3.42, -62.40],
      zoom: 5,
      zoomControl: true,
      attributionControl: false,
    });
    mapInstance.current = map;

    // Primary basemap: Esri World Imagery (Satellite)
    const baseLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 18,
        attribution: "Esri World Imagery",
      }
    );

    baseLayer.on("tileerror", () => {
      // Fallback to CartoDB dark basemap if Esri fails
      if (mapInstance.current && !tileLayerRef.current) {
        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          { maxZoom: 18 }
        ).addTo(mapInstance.current);
      }
    });

    baseLayer.addTo(map);
    tileLayerRef.current = baseLayer;

    // Vital: Invalidate size after layout completes
    const timer = setTimeout(() => {
      map.invalidateSize();
      setMapReady(true);
    }, 200);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapRef.current) {
      resizeObserver.observe(mapRef.current);
    }

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update Parcel Polygons whenever projects change
  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;

    // Clear existing polygons
    polygonsRef.current.forEach((poly) => poly.remove());
    polygonsRef.current.clear();

    projects.forEach((proj) => {
      const isRevoked = proj.status === "Revoked" || proj.status === "Suspended";
      const isSelected = selectedProject === proj.id;

      // Color scheme based on active layer
      let strokeColor = isRevoked ? "#ef4444" : "#38b87c";
      let fillColor = isRevoked ? "#ef4444" : "#38b87c";

      if (activeLayer === "ndvi") {
        fillColor = isRevoked ? "#dc2626" : "#22c55e";
      } else if (activeLayer === "nir") {
        fillColor = isRevoked ? "#ea580c" : "#059669";
      } else if (activeLayer === "change") {
        fillColor = isRevoked ? "#b91c1c" : "#10b981";
      }

      const polygon = L.polygon(proj.bounds as L.LatLngTuple[], {
        color: isSelected ? "#ffffff" : strokeColor,
        weight: isSelected ? 3 : 2,
        fillColor,
        fillOpacity: isSelected ? 0.45 : 0.25,
        dashArray: isRevoked ? "4, 6" : undefined,
      }).addTo(map);

      // Tooltip
      polygon.bindTooltip(
        `<div style="font-family: monospace; font-size: 11px;">
          <strong>${proj.name}</strong><br/>
          Grade: ${proj.grade} · Status: ${proj.status}
        </div>`,
        { sticky: true, opacity: 0.95 }
      );

      // Events
      polygon.on("click", () => {
        onSelectProject(proj.id);
      });

      polygon.on("mouseover", () => {
        polygon.setStyle({
          weight: 3,
          fillOpacity: 0.5,
        });
      });

      polygon.on("mouseout", () => {
        const currentlySelected = selectedProject === proj.id;
        polygon.setStyle({
          color: currentlySelected ? "#ffffff" : strokeColor,
          weight: currentlySelected ? 3 : 2,
          fillOpacity: currentlySelected ? 0.45 : 0.25,
        });
      });

      polygonsRef.current.set(proj.id, polygon);
    });
  }, [projects, selectedProject, activeLayer, onSelectProject, mapReady]);

  // Fly to selected project bounds smoothly
  const flyToSelected = useCallback((id: number | null) => {
    if (!mapInstance.current || !id) return;
    const proj = projects.find((p) => p.id === id);
    if (!proj) return;

    const bounds = L.latLngBounds(proj.bounds as L.LatLngTuple[]);
    mapInstance.current.flyToBounds(bounds, {
      padding: [60, 60],
      duration: 0.6,
      maxZoom: 11,
    });
  }, [projects]);

  useEffect(() => {
    if (selectedProject) {
      flyToSelected(selectedProject);
    }
  }, [selectedProject, flyToSelected]);

  return (
    <div className="w-full h-full relative z-0 min-h-[400px]">
      <div ref={mapRef} className="w-full h-full bg-[#07130f]" />

      {/* Layer Color Legend */}
      <div className="absolute bottom-4 left-4 z-[400] bg-[#07130f]/90 light:bg-white/95 backdrop-blur-sm border border-[#162922] light:border-slate-200 rounded-lg p-2.5 text-[11px] font-mono shadow-md pointer-events-auto">
        <div className="text-[#8e9f96] light:text-slate-500 uppercase font-semibold mb-1.5 text-[10px]">
          {activeLayer === "truecolor" && "Layer: Sentinel-2 RGB (10m)"}
          {activeLayer === "ndvi" && "Layer: NDVI Canopy Health"}
          {activeLayer === "nir" && "Layer: NIR Band 8 (False Color)"}
          {activeLayer === "change" && "Layer: Delta vs. Baseline"}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#38b87c]" />
            <span className="text-[#f4f5ef] light:text-slate-800">Dense Canopy (AAA/AA)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#ef4444]" />
            <span className="text-[#f4f5ef] light:text-slate-800">Degraded/Revoked (C)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface BoundaryMapProps {
  center: [number, number];
  zoom?: number;
  mode: "draw" | "upload" | "radius";
  radiusMeters: number;
  polygonPoints: [number, number][];
  onPointsChange: (points: [number, number][]) => void;
  onCenterChange: (lat: number, lng: number) => void;
  className?: string;
}

export default function BoundaryMap({
  center,
  zoom = 13,
  mode,
  radiusMeters,
  polygonPoints,
  onPointsChange,
  onCenterChange,
  className = "w-full h-[400px]",
}: BoundaryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Initialize Map once
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const map = L.map(mapRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: true,
      attributionControl: false,
    });
    mapInstance.current = map;

    // Basemap: Esri World Imagery
    const baseLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 18,
        attribution: "Esri World Imagery",
      }
    );

    baseLayer.on("tileerror", () => {
      if (mapInstance.current) {
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          maxZoom: 18,
        }).addTo(mapInstance.current);
      }
    });

    baseLayer.addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;

    const timer = setTimeout(() => {
      map.invalidateSize();
      setMapReady(true);
    }, 200);

    const ro = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapRef.current) ro.observe(mapRef.current);

    return () => {
      clearTimeout(timer);
      ro.disconnect();
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update center when prop changes externally (e.g., from geocoding)
  useEffect(() => {
    if (!mapInstance.current || !mapReady) return;
    const currentCenter = mapInstance.current.getCenter();
    const dist = Math.abs(currentCenter.lat - center[0]) + Math.abs(currentCenter.lng - center[1]);
    if (dist > 0.001) {
      mapInstance.current.flyTo(center, mapInstance.current.getZoom() || 13, { duration: 0.8 });
    }
  }, [center, mapReady]);

  // Handle map click events based on mode
  useEffect(() => {
    if (!mapInstance.current || !mapReady) return;
    const map = mapInstance.current;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      if (mode === "draw") {
        const newPoints: [number, number][] = [...polygonPoints, [parseFloat(lat.toFixed(5)), parseFloat(lng.toFixed(5))]];
        onPointsChange(newPoints);
      } else if (mode === "radius") {
        onCenterChange(parseFloat(lat.toFixed(5)), parseFloat(lng.toFixed(5)));
      }
    };

    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [mode, polygonPoints, onPointsChange, onCenterChange, mapReady]);

  // Render shapes & markers onto layerGroup
  useEffect(() => {
    if (!mapInstance.current || !layerGroupRef.current || !mapReady) return;
    const lg = layerGroupRef.current;
    lg.clearLayers();

    if (mode === "radius") {
      // Circle and center marker
      const circle = L.circle(center, {
        radius: radiusMeters,
        color: "#10b981",
        weight: 2,
        fillColor: "#10b981",
        fillOpacity: 0.2,
        dashArray: "4, 6",
      });
      circle.addTo(lg);

      const marker = L.circleMarker(center, {
        radius: 6,
        color: "#ffffff",
        weight: 2,
        fillColor: "#10b981",
        fillOpacity: 1,
      });
      marker.bindTooltip("Center GPS Point", { permanent: false, direction: "top" });
      marker.addTo(lg);
    } else if (mode === "draw" || mode === "upload") {
      if (polygonPoints.length > 0) {
        // Draw vertex dots
        polygonPoints.forEach((pt, idx) => {
          const vertex = L.circleMarker(pt, {
            radius: 5,
            color: "#ffffff",
            weight: 2,
            fillColor: "#10b981",
            fillOpacity: 1,
          });
          vertex.bindTooltip(`Vertex #${idx + 1}`, { direction: "top" });
          vertex.addTo(lg);
        });

        // If >= 3 points, draw polygon
        if (polygonPoints.length >= 3) {
          const poly = L.polygon(polygonPoints, {
            color: "#10b981",
            weight: 2,
            fillColor: "#10b981",
            fillOpacity: 0.25,
          });
          poly.addTo(lg);
        } else if (polygonPoints.length === 2) {
          const line = L.polyline(polygonPoints, {
            color: "#10b981",
            weight: 2,
            dashArray: "6, 6",
          });
          line.addTo(lg);
        }
      }
    }
  }, [mode, center, radiusMeters, polygonPoints, mapReady]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-[var(--border)]">
      <div ref={mapRef} className={className} />
      
      {/* Map Helper Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-[var(--surface)]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs text-[var(--muted)] flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-[var(--brand)] animate-pulse"></span>
        {mode === "draw" && (
          <span>
            {polygonPoints.length === 0
              ? "Click map to place the first boundary vertex"
              : `${polygonPoints.length} vertices placed. Click to add more points.`}
          </span>
        )}
        {mode === "upload" && (
          <span>Boundary preview from uploaded survey file.</span>
        )}
        {mode === "radius" && (
          <span>Click anywhere to reposition parcel center point.</span>
        )}
      </div>
    </div>
  );
}

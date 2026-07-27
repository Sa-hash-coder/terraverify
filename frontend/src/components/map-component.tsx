"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapComponentProps {
  selectedProject: number | null;
  onSelectProject: (id: number) => void;
}

export default function MapComponent({ selectedProject, onSelectProject }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Initialize map centered at Amazon coordinates by default
    const map = L.map(mapRef.current).setView([-3.42, -62.40], 5);
    mapInstance.current = map;

    // Load satellite tiles for free from Esri World Imagery (fully free, no key needed)
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
    }).addTo(map);

    // Amazon Polygon (Green)
    const amazonCoords: L.LatLngTuple[] = [
      [-3.5, -62.5],
      [-3.5, -62.3],
      [-3.3, -62.3],
      [-3.3, -62.5]
    ];
    const amazonPolygon = L.polygon(amazonCoords, {
      color: "#10b981",
      fillColor: "#10b981",
      fillOpacity: 0.2,
      weight: 3
    }).addTo(map);
    amazonPolygon.bindPopup("<b>Amazon Block 7</b><br/>Status: Verified (AAA)");
    amazonPolygon.on("click", () => {
      onSelectProject(1);
    });

    // Borneo Polygon (Red/Orange)
    const borneoCoords: L.LatLngTuple[] = [
      [-1.3, 114.0],
      [-1.3, 114.2],
      [-1.1, 114.2],
      [-1.1, 114.0]
    ];
    const borneoPolygon = L.polygon(borneoCoords, {
      color: "#ef4444",
      fillColor: "#ef4444",
      fillOpacity: 0.2,
      weight: 3
    }).addTo(map);
    borneoPolygon.bindPopup("<b>Borneo Peatlands</b><br/>Status: Revoked (C)");
    borneoPolygon.on("click", () => {
      onSelectProject(2);
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [onSelectProject]);

  // Sync map center when selected project changes in the sidebar
  useEffect(() => {
    if (!mapInstance.current) return;
    if (selectedProject === 1) {
      mapInstance.current.setView([-3.42, -62.40], 6);
    } else if (selectedProject === 2) {
      mapInstance.current.setView([-1.25, 114.12], 6);
    }
  }, [selectedProject]);

  return (
    <div className="w-full h-full relative z-0">
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: "100%" }} />
    </div>
  );
}

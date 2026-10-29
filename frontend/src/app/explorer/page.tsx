"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import dynamic from "next/dynamic";
import {
  Search,
  RefreshCw,
  ExternalLink,
  X,
  TrendingDown,
  TrendingUp,
  MapPin,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Layers,
  ChevronRight,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  PanelLeftClose,
  PanelLeftOpen,
  Eye,
  RotateCcw,
  Sparkles,
  Satellite
} from "lucide-react";
import PageShell from "../../components/layout/page-shell";
import {
  StatusBadge,
  GradeBadge,
  AddressChip,
  Skeleton
} from "../../components/shared/design-system";
import { ParcelProject, MapLayerType } from "../../components/map-component";

// Dynamically load Map with Leaflet (SSR disabled)
const MapComponent = dynamic(() => import("../../components/map-component"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#080c10] flex items-center justify-center text-sm font-mono text-slate-400 animate-pulse">
      <div className="flex items-center gap-3 bg-[#111923] px-6 py-3.5 rounded-2xl border border-slate-800 shadow-xl">
        <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
        <span className="text-white font-sans font-medium">Initializing Sentinel-2 Telemetry Engine...</span>
      </div>
    </div>
  ),
});

// Rich parcel telemetry data matching Sentinel-2 specifications
const DEFAULT_PROJECTS: ParcelProject[] = [
  {
    id: 1,
    name: "Amazon Reforestation Block 7",
    region: "Amazonas, Brazil",
    grade: "AAA",
    status: "Verified",
    cqsScore: 94,
    forestCover: "84.5%",
    ndvi: 0.845,
    baselineNdvi: 0.820,
    area: "12,500 ha",
    center: [-3.42, -62.40],
    bounds: [
      [-3.52, -62.52],
      [-3.52, -62.28],
      [-3.32, -62.28],
      [-3.32, -62.52],
    ],
    oracleAddress: "Efnm4SRpWogLYYMXnrrwbJ1i7WFbM343rtoASXkxwkoC",
    lastScan: "2 hours ago",
    lastScanTimestamp: "2026-10-09 17:20:00 UTC",
    nextScan: "In 3 days (Orbit 122)",
    cadence: "Every 3-5 days",
    cloudCover: "0.8%",
    trend: "+0.2%",
    sparkline: [0.81, 0.815, 0.822, 0.82, 0.825, 0.83, 0.835, 0.838, 0.84, 0.842, 0.844, 0.845],
    timelineEvents: [
      { date: "Oct 9, 2026", title: "Automated Sentinel-2 L2A pass completed", type: "scan" },
      { date: "Oct 4, 2026", title: "Canopy stability verified (NDVI 0.844)", type: "verified" },
      { date: "Sep 29, 2026", title: "Oracle Token-2022 hook renewed on Solana", type: "verified" },
      { date: "Sep 15, 2026", title: "Project boundary deed validated on-chain", type: "verified" },
    ],
    beforeImage: "/amazon.png",
    afterImage: "/amazon.png",
  },
  {
    id: 2,
    name: "Congo Basin Conservation",
    region: "Équateur, DRC",
    grade: "AA",
    status: "Verified",
    cqsScore: 88,
    forestCover: "88.0%",
    ndvi: 0.812,
    baselineNdvi: 0.810,
    area: "45,000 ha",
    center: [-0.50, 22.80],
    bounds: [
      [-0.65, 22.65],
      [-0.65, 22.95],
      [-0.35, 22.95],
      [-0.35, 22.65],
    ],
    oracleAddress: "7Vz9WJ4iHqKzYn5R8aL3pQ2vM1sX9tD6eC4bN7fG2hJ1",
    lastScan: "5 hours ago",
    lastScanTimestamp: "2026-10-09 14:15:00 UTC",
    nextScan: "In 2 days (Orbit 089)",
    cadence: "Every 3-5 days",
    cloudCover: "2.1%",
    trend: "+0.1%",
    sparkline: [0.805, 0.808, 0.81, 0.809, 0.811, 0.813, 0.812, 0.814, 0.811, 0.813, 0.812, 0.812],
    timelineEvents: [
      { date: "Oct 9, 2026", title: "Multispectral NIR analysis ingested", type: "scan" },
      { date: "Oct 5, 2026", title: "Dense equatorial canopy confirmed", type: "verified" },
      { date: "Sep 30, 2026", title: "Biomass density audit completed", type: "verified" },
    ],
    beforeImage: "/satellite_hero.jpg",
    afterImage: "/satellite_hero.jpg",
  },
  {
    id: 3,
    name: "Borneo Peatland Deforestation",
    region: "Central Kalimantan, Indonesia",
    grade: "C",
    status: "Revoked",
    cqsScore: 48,
    forestCover: "62.1%",
    ndvi: 0.584,
    baselineNdvi: 0.790,
    area: "8,200 ha",
    center: [-2.15, 113.85],
    bounds: [
      [-2.25, 113.75],
      [-2.25, 113.95],
      [-2.05, 113.95],
      [-2.05, 113.75],
    ],
    oracleAddress: "9pL3vM1sX9tD6eC4bN7fG2hJ17Vz9WJ4iHqKzYn5R8aL",
    lastScan: "30 mins ago",
    lastScanTimestamp: "2026-10-09 18:50:00 UTC",
    nextScan: "Monitoring daily (High Risk)",
    cadence: "Daily emergency task",
    cloudCover: "0.4%",
    trend: "-5.4%",
    revocationReason: "Canopy fell to 62.1%, 5.4 points below threshold. Agricultural clearance detected via radar change alerts.",
    revocationDate: "October 7, 2026",
    sparkline: [0.78, 0.77, 0.75, 0.73, 0.71, 0.68, 0.66, 0.64, 0.62, 0.60, 0.59, 0.584],
    timelineEvents: [
      { date: "Oct 9, 2026", title: "Telemetry confirm: 240ha burn scar persists", type: "alert" },
      { date: "Oct 7, 2026", title: "Permanent Revocation: Transfer Hook triggered", type: "revoked" },
      { date: "Oct 6, 2026", title: "Sentinel-2 detected sudden canopy drop", type: "alert" },
    ],
    beforeImage: "/amazon.png",
    afterImage: "/borneo.png",
  },
];

export default function ExplorerPage() {
  const [projects, setProjects] = useState<ParcelProject[]>(DEFAULT_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(2);
  const [activeTab, setActiveTab] = useState<"projects" | "layers">("projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "verified" | "revoked">("all");
  const [sortBy, setSortBy] = useState<"grade" | "canopy" | "scan">("grade");
  const [activeLayer, setActiveLayer] = useState<MapLayerType>("truecolor");
  const [layerOpacity, setLayerOpacity] = useState<number>(100);
  const [scanDate, setScanDate] = useState<string>("latest");
  const [detailOpen, setDetailOpen] = useState(true);
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [fitAllTrigger, setFitAllTrigger] = useState(0);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("19:44");
  const [, startTransition] = useTransition();

  // Polling telemetry status
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch("/api/telemetry");
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.projects)) {
            setProjects((prev) =>
              prev.map((p) => {
                const match = data.projects.find((tp: any) =>
                  tp.id === `PRJ-00${p.id}` ||
                  tp.id === String(p.id) ||
                  p.name.toLowerCase().includes(tp.name?.toLowerCase() || "") ||
                  (p.id === 1 && tp.id === "PRJ-001") ||
                  (p.id === 3 && tp.id === "PRJ-003")
                );
                if (match) {
                  const isRevoked = match.status === "Suspended" || match.status === "Revoked";
                  return {
                    ...p,
                    status: isRevoked ? "Revoked" : "Verified",
                    grade: match.cqs || p.grade,
                    cqsScore: match.cqsScore ?? p.cqsScore,
                    forestCover: match.forestCover || p.forestCover,
                    trend: match.trend || p.trend,
                    lastScan: match.lastScan || "Just now",
                  };
                }
                return p;
              })
            );
            setLastSyncedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
          }
        }
      } catch {}
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || projects[0],
    [projects, selectedProjectId]
  );

  // Filter and sort parcels
  const filteredProjects = useMemo(() => {
    let result = projects.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.region.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "verified"
          ? p.status === "Verified" || p.status === "Active"
          : p.status === "Revoked" || p.status === "Suspended";

      return matchesSearch && matchesStatus;
    });

    if (sortBy === "canopy") {
      result.sort((a, b) => parseFloat(b.forestCover) - parseFloat(a.forestCover));
    } else if (sortBy === "grade") {
      const rank: Record<string, number> = { AAA: 5, AA: 4, A: 3, B: 2, C: 1 };
      result.sort((a, b) => (rank[b.grade] || 0) - (rank[a.grade] || 0));
    }

    return result;
  }, [projects, searchQuery, statusFilter, sortBy]);

  const layerOptions: { id: MapLayerType; name: string; tag: string; desc: string }[] = [
    {
      id: "truecolor",
      name: "True Colour (RGB)",
      tag: "Natural",
      desc: "Copernicus Sentinel-2 10m high-resolution optical spectrum imagery.",
    },
    {
      id: "ndvi",
      name: "NDVI Vegetation Health",
      tag: "Biomass",
      desc: "Photosynthetic vigor index calculated from Red (B4) and NIR (B8) reflectance.",
    },
    {
      id: "nir",
      name: "NIR Band 8 (Infrared)",
      tag: "Moisture",
      desc: "Near-infrared band highlights dense cellular leaf structure and moisture levels.",
    },
    {
      id: "change",
      name: "Canopy Change Detection",
      tag: "Alerts",
      desc: "Differential comparison identifying loss vs. registered historical baseline.",
    },
  ];

  return (
    <PageShell fullWidth noScroll className="bg-[#f4f6f3]">
      <div className="flex-1 flex flex-col md:flex-row h-full min-h-0 w-full overflow-hidden relative bg-[#f4f6f3]">

        {/* ================================================================= */}
        {/* 1. LEFT CONSOLE PANEL (Collapsible, Light Eco Theme matching Image 1) */}
        {/* ================================================================= */}
        {consoleOpen ? (
          <aside className="w-full md:w-[370px] md:min-w-[370px] md:max-w-[370px] h-auto md:h-full flex flex-col shrink-0 bg-[#f4f6f3] border-r border-[#dbe3d8] z-20 shadow-xs transition-all duration-200">
            {/* Top Bar: Brand, Sentinel-2 badge, Sync & Collapse Button */}
            <div className="p-4 border-b border-[#dbe3d8] flex items-center justify-between bg-[#f4f6f3]">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-[#111e16] tracking-tight">
                    Forest Explorer
                  </h1>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#e2ede4] text-[#24633d] font-mono font-bold border border-[#c6ded0]">
                    Sentinel-2
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#5c7366] mt-1 font-sans">
                  <span className="w-2 h-2 rounded-full bg-[#2d6a4f] animate-pulse" />
                  <span>Live telemetry · synced <span className="font-mono text-[#111e16] font-semibold">{lastSyncedTime}</span></span>
                </div>
              </div>

              <button
                onClick={() => setConsoleOpen(false)}
                className="p-2 rounded-xl border border-[#dbe3d8] bg-white text-[#5c7366] hover:text-[#111e16] hover:bg-[#ebf0e9] transition-colors cursor-pointer shadow-2xs"
                title="Collapse sidebar for full map"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs: Forests vs Layers */}
            <div className="p-3 border-b border-[#dbe3d8] bg-[#f4f6f3]">
              <div className="grid grid-cols-2 p-1 rounded-xl bg-[#e6ebe3] border border-[#d6ded2]">
                <button
                  onClick={() => setActiveTab("projects")}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === "projects"
                      ? "bg-[#2d6a4f] text-white font-bold shadow-xs"
                      : "text-[#5c7366] hover:text-[#111e16]"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Monitored Forests ({projects.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab("layers")}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === "layers"
                      ? "bg-[#2d6a4f] text-white font-bold shadow-xs"
                      : "text-[#5c7366] hover:text-[#111e16]"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Satellite Layers</span>
                </button>
              </div>
            </div>

            {/* TAB 1: MONITORED FORESTS LIST */}
            {activeTab === "projects" && (
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Search Bar & Filter Strip */}
                <div className="p-3.5 border-b border-[#dbe3d8] space-y-3 bg-[#f4f6f3]">
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#7d9385] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        startTransition(() => setSearchQuery(val));
                      }}
                      placeholder="Search forest or region..."
                      className="w-full bg-white border border-[#d6ded2] rounded-xl pl-10 pr-9 py-2.5 text-xs text-[#111e16] placeholder-[#7d9385] focus:outline-none focus:border-[#2d6a4f] shadow-2xs transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7d9385] hover:text-[#111e16]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filter Pill Row & Sort */}
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <div className="flex items-center gap-1.5">
                      {(["all", "verified", "revoked"] as const).map((filter) => {
                        const isActive = statusFilter === filter;
                        return (
                          <button
                            key={filter}
                            onClick={() => startTransition(() => setStatusFilter(filter))}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                              isActive
                                ? "bg-[#2d6a4f] text-white font-bold shadow-xs"
                                : "bg-white text-[#5c7366] hover:text-[#111e16] border border-[#d6ded2] hover:bg-[#f0f4ee]"
                            }`}
                          >
                            {filter === "all" ? "All" : filter === "verified" ? "Verified" : "Revoked"}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#5c7366] bg-white border border-[#d6ded2] rounded-lg px-2.5 py-1 shadow-2xs">
                      <ArrowUpDown className="w-3.5 h-3.5 text-[#5c7366]" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as "grade" | "canopy" | "scan")}
                        className="bg-transparent text-xs text-[#111e16] focus:outline-none cursor-pointer font-medium"
                      >
                        <option value="grade">Grade</option>
                        <option value="canopy">Canopy %</option>
                        <option value="scan">Recency</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Forest Cards List */}
                <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 bg-[#f4f6f3]">
                  {filteredProjects.length === 0 ? (
                    <div className="py-12 text-center text-sm text-[#5c7366]">
                      No forest projects found matching your filters.
                    </div>
                  ) : (
                    filteredProjects.map((proj) => {
                      const isSelected = selectedProjectId === proj.id;
                      const isRevoked = proj.status === "Revoked" || proj.status === "Suspended";

                      return (
                        <div
                          key={proj.id}
                          onClick={() => {
                            setSelectedProjectId(proj.id);
                            setDetailOpen(true);
                          }}
                          className={`p-4 rounded-2xl transition-all cursor-pointer text-left relative ${
                            isSelected
                              ? "bg-white border-2 border-[#2d6a4f] shadow-md ring-2 ring-[#2d6a4f]/15 text-[#111e16]"
                              : "bg-white border border-[#dbe3d8] hover:border-[#b4c7b0] hover:shadow-xs text-[#111e16]"
                          }`}
                        >
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-[#111e16] truncate">
                                {proj.name}
                              </h3>
                              <div className="flex items-center gap-1.5 text-xs text-[#5c7366] mt-0.5">
                                <MapPin className="w-3.5 h-3.5 shrink-0 text-[#2d6a4f]" />
                                <span className="truncate">{proj.region}</span>
                              </div>
                            </div>
                            <div className="shrink-0 flex items-center gap-1.5">
                              <span
                                className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold border ${
                                  isRevoked
                                    ? "bg-[#fce8e8] text-[#c92a2a] border-[#f5c2c2]"
                                    : "bg-[#e6f4ea] text-[#1e6b3b] border-[#cbe4d2]"
                                }`}
                              >
                                {proj.grade} ({proj.cqsScore})
                              </span>
                            </div>
                          </div>

                          {/* Card Metrics Row */}
                          <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-[#f0f4ee] border border-[#e1e8de] text-xs mt-3">
                            <div>
                              <div className="text-[11px] text-[#5c7366]">NDVI Index</div>
                              <div className="font-mono font-bold text-[#111e16] mt-0.5">{proj.ndvi.toFixed(3)}</div>
                            </div>

                            <div>
                              <div className="text-[11px] text-[#5c7366]">Canopy</div>
                              <div className="font-mono font-bold text-[#111e16] mt-0.5">{proj.forestCover}</div>
                            </div>

                            <div>
                              <div className="text-[11px] text-[#5c7366]">Status</div>
                              <div className="flex items-center gap-1 mt-0.5 font-medium">
                                <span className={`w-2 h-2 rounded-full ${isRevoked ? "bg-red-500" : "bg-[#2d6a4f]"}`} />
                                <span className={isRevoked ? "text-red-600 font-semibold" : "text-[#1e6b3b] font-semibold"}>
                                  {proj.status}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Bottom Row */}
                          <div className="flex items-center justify-between text-xs text-[#5c7366] pt-2.5 mt-1 font-mono">
                            <span>Area: {proj.area}</span>
                            <span className="text-[#2d6a4f] font-sans font-medium flex items-center gap-1">
                              Inspect Data <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: SATELLITE LAYERS & CONTROLS */}
            {activeTab === "layers" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-[#f4f6f3]">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#5c7366] mb-3">
                    Available Copernicus Bands
                  </h3>
                  <div className="space-y-2.5">
                    {layerOptions.map((layer) => {
                      const isSelected = activeLayer === layer.id;
                      return (
                        <div
                          key={layer.id}
                          onClick={() => setActiveLayer(layer.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                            isSelected
                              ? "bg-white border-2 border-[#2d6a4f] shadow-md ring-2 ring-[#2d6a4f]/15"
                              : "bg-white border-[#dbe3d8] hover:border-[#b4c7b0]"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold text-[#111e16]">
                              {layer.name}
                            </span>
                            <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md font-semibold ${
                              isSelected ? "bg-[#2d6a4f] text-white font-bold" : "bg-[#e6ebe3] text-[#5c7366]"
                            }`}>
                              {layer.tag}
                            </span>
                          </div>
                          <p className="text-xs text-[#5c7366] leading-relaxed">
                            {layer.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Layer Opacity Slider */}
                <div className="p-4 rounded-2xl bg-white border border-[#dbe3d8] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#111e16] flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#2d6a4f]" />
                      Layer Opacity
                    </span>
                    <span className="font-mono text-sm font-bold text-[#2d6a4f]">
                      {layerOpacity}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={layerOpacity}
                    onChange={(e) => setLayerOpacity(Number(e.target.value))}
                    className="w-full accent-[#2d6a4f] h-2 bg-[#e6ebe3] rounded-lg cursor-pointer"
                  />
                </div>

                {/* Sentinel-2 Orbit Pass Selector */}
                <div className="p-4 rounded-2xl bg-white border border-[#dbe3d8] space-y-2.5">
                  <div className="text-xs font-bold text-[#111e16] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#2d6a4f]" />
                    <span>Orbital Pass Revisit</span>
                  </div>
                  <select
                    value={scanDate}
                    onChange={(e) => setScanDate(e.target.value)}
                    className="w-full bg-[#f0f4ee] border border-[#e1e8de] rounded-xl px-3.5 py-2.5 text-xs text-[#111e16] font-medium cursor-pointer focus:outline-none focus:border-[#2d6a4f]"
                  >
                    <option value="latest">Latest Sentinel-2 L2A Orbit (Oct 9, 2026)</option>
                    <option value="prev1">Prior Orbital Pass (Oct 4, 2026)</option>
                    <option value="baseline">Historical Verified Baseline (Jan 2024)</option>
                  </select>
                </div>
              </div>
            )}
          </aside>
        ) : (
          /* Collapsed Console Button */
          <button
            onClick={() => setConsoleOpen(true)}
            className="absolute top-5 left-5 z-[500] px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-[#d6ded2] text-xs text-[#111e16] hover:border-[#2d6a4f] shadow-xl flex items-center gap-2 cursor-pointer font-bold transition-all"
          >
            <PanelLeftOpen className="w-4 h-4 text-[#2d6a4f]" />
            <span>Open Forest Console</span>
          </button>
        )}

        {/* ================================================================= */}
        {/* 2. MAIN MAP CANVAS (Expansive, Full Viewport, Satellite View)       */}
        {/* ================================================================= */}
        <div className="flex-1 min-w-0 h-full relative overflow-hidden bg-[#d9e2d5]">
          <MapComponent
            projects={projects}
            selectedProject={selectedProjectId}
            onSelectProject={(id) => {
              setSelectedProjectId(id);
              setDetailOpen(true);
            }}
            activeLayer={activeLayer}
            layerOpacity={layerOpacity}
            detailOpen={detailOpen}
            fitAllTrigger={fitAllTrigger}
          />

          {/* Floating Quick Layer Switcher Bar (White Pill Bar matching Image 1) */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] flex items-center gap-1.5 p-1 rounded-2xl bg-white/95 backdrop-blur-md border border-[#d6ded2] shadow-lg max-w-[95vw] overflow-x-auto">
            {layerOptions.map((l) => {
              const isSelected = activeLayer === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => setActiveLayer(l.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#2d6a4f] text-white font-bold shadow-xs"
                      : "text-[#4a5f53] hover:text-[#111e16] hover:bg-[#edf2ea]"
                  }`}
                >
                  {l.name.split(" ")[0]}
                </button>
              );
            })}

            <div className="w-[1px] h-4 bg-[#d6ded2] mx-1 shrink-0" />

            {/* Reset Map View Button */}
            <button
              onClick={() => setFitAllTrigger((t) => t + 1)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#4a5f53] hover:text-[#2d6a4f] hover:bg-[#edf2ea] transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="Fit all forest parcels into view"
            >
              <span>Fit All</span>
            </button>
          </div>

          {/* Floating Verified Legend Pill (Bottom-Left on Map, matching Image 1) */}
          {activeLayer === "truecolor" && (
            <div className="absolute bottom-6 left-6 z-[400] flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0e2418]/90 text-white backdrop-blur-md border border-[#1b4332] text-xs font-semibold shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#38b87c] animate-pulse" />
              <span>Verified Forest</span>
            </div>
          )}

          {/* Floating Inspect Button if detail panel is closed */}
          {!detailOpen && selectedProject && (
            <button
              onClick={() => setDetailOpen(true)}
              className="absolute top-4 right-4 z-[400] px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-[#d6ded2] text-xs text-[#111e16] hover:border-[#2d6a4f] shadow-lg flex items-center gap-2 cursor-pointer font-bold transition-all"
            >
              <Eye className="w-4 h-4 text-[#2d6a4f]" />
              <span>Inspect {selectedProject.name.split(" ")[0]} Data</span>
            </button>
          )}
        </div>

        {/* ================================================================= */}
        {/* 3. RIGHT DETAIL INSPECTOR (Clean Eco-Light Theme matching Image 1)  */}
        {/* ================================================================= */}
        {detailOpen && selectedProject && (
          <aside className="w-full md:w-[380px] md:min-w-[380px] md:max-w-[380px] h-auto md:h-full flex flex-col shrink-0 bg-white border-l border-[#dbe3d8] z-20 shadow-xl transition-all duration-200">
            {/* Header: Title, Region, Badges & Close Button */}
            <div className="p-5 border-b border-[#dbe3d8] bg-[#f8faf7] flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold border ${
                      selectedProject.status === "Revoked"
                        ? "bg-[#fce8e8] text-[#c92a2a] border-[#f5c2c2]"
                        : "bg-[#e6f4ea] text-[#1e6b3b] border-[#cbe4d2]"
                    }`}
                  >
                    {selectedProject.grade} ({selectedProject.cqsScore})
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold border flex items-center gap-1.5 ${
                      selectedProject.status === "Revoked"
                        ? "bg-[#fce8e8] text-[#c92a2a] border-[#f5c2c2]"
                        : "bg-[#e6f4ea] text-[#1e6b3b] border-[#cbe4d2]"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedProject.status === "Revoked" ? "bg-red-500" : "bg-[#2d6a4f]"}`} />
                    <span>{selectedProject.status}</span>
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#111e16] leading-snug">
                  {selectedProject.name}
                </h2>
                <p className="text-xs text-[#5c7366] mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#2d6a4f] shrink-0" />
                  <span>{selectedProject.region} · {selectedProject.area}</span>
                </p>
              </div>

              <button
                onClick={() => setDetailOpen(false)}
                className="p-1.5 rounded-xl border border-[#dbe3d8] bg-white text-[#5c7366] hover:text-[#111e16] hover:bg-[#ebf0e9] transition-colors cursor-pointer shadow-2xs"
                title="Close telemetry inspector"
                aria-label="Close telemetry inspector"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content Body with 2x2 Grid and Stats */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white">
              {/* PRIMARY STAT GRID (2x2 matching Image 1) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-[#f0f4ee] border border-[#e1e8de]">
                  <div className="text-xs text-[#5c7366] font-medium">NDVI Index</div>
                  <div className="font-mono text-2xl font-bold text-[#111e16] mt-1">
                    {selectedProject.ndvi.toFixed(3)}
                  </div>
                  <div className="text-xs font-mono text-[#5c7366] mt-1">
                    Baseline: {selectedProject.baselineNdvi.toFixed(3)} (
                    <span className={selectedProject.ndvi >= selectedProject.baselineNdvi ? "text-[#2d6a4f] font-semibold" : "text-rose-600 font-semibold"}>
                      {(selectedProject.ndvi - selectedProject.baselineNdvi > 0 ? "+" : "")}
                      {(selectedProject.ndvi - selectedProject.baselineNdvi).toFixed(3)}
                    </span>)
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#f0f4ee] border border-[#e1e8de]">
                  <div className="text-xs text-[#5c7366] font-medium">Canopy Cover</div>
                  <div className="font-mono text-2xl font-bold text-[#111e16] mt-1">
                    {selectedProject.forestCover}
                  </div>
                  <div className="text-xs font-mono text-[#5c7366] mt-1">
                    Area: {selectedProject.area}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#f0f4ee] border border-[#e1e8de]">
                  <div className="text-xs text-[#5c7366] font-medium">Canopy Quality</div>
                  <div className="font-mono text-2xl font-bold text-[#111e16] mt-1">
                    {selectedProject.cqsScore} <span className="text-xs font-normal text-[#5c7366]">/ 100</span>
                  </div>
                  <div className="text-xs font-mono text-[#2d6a4f] mt-1 flex items-center gap-1 font-semibold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Trend: {selectedProject.trend}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#f0f4ee] border border-[#e1e8de]">
                  <div className="text-xs text-[#5c7366] font-medium">Cloud Obscurity</div>
                  <div className="font-mono text-2xl font-bold text-[#111e16] mt-1">
                    {selectedProject.cloudCover}
                  </div>
                  <div className="text-xs font-mono text-[#5c7366] mt-1">
                    Sentinel-2 LZA scene
                  </div>
                </div>
              </div>

              {/* 90-DAY NDVI SPARKLINE CHART matching Image 1 */}
              {selectedProject.sparkline && (
                <div className="p-4 rounded-2xl bg-white border border-[#dbe3d8] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#111e16]">90-Day NDVI Stability Trend</span>
                    <span className="font-mono text-xs text-[#2d6a4f] font-semibold">
                      Baseline: {selectedProject.baselineNdvi}
                    </span>
                  </div>

                  <div className="h-20 w-full relative pt-2">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 300 70">
                      <defs>
                        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2d6a4f" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#2d6a4f" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Baseline threshold line */}
                      <line
                        x1="0"
                        y1="40"
                        x2="300"
                        y2="40"
                        stroke="#b8cbb4"
                        strokeDasharray="4 4"
                        strokeWidth="1.5"
                      />
                      {/* Gradient area under sparkline */}
                      <polygon
                        fill="url(#trendGradient)"
                        points={`0,68 ${selectedProject.sparkline
                          .map((val, idx) => {
                            const x = (idx / (selectedProject.sparkline!.length - 1)) * 300;
                            const y = 65 - ((val - 0.55) / 0.35) * 60;
                            return `${x},${y}`;
                          })
                          .join(" ")} 300,68`}
                      />
                      {/* Sparkline curve */}
                      <polyline
                        fill="none"
                        stroke={selectedProject.status === "Revoked" ? "#dc2626" : "#2d6a4f"}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={selectedProject.sparkline
                          .map((val, idx) => {
                            const x = (idx / (selectedProject.sparkline!.length - 1)) * 300;
                            const y = 65 - ((val - 0.55) / 0.35) * 60;
                            return `${x},${y}`;
                          })
                          .join(" ")}
                      />
                    </svg>
                  </div>
                  <div className="flex justify-between text-xs font-mono text-[#5c7366]">
                    <span>90 days ago</span>
                    <span>Latest scan</span>
                  </div>
                </div>
              )}

              {/* TRANSFERS PERMITTED / BLOCKED BANNER matching Image 1 */}
              {selectedProject.status === "Revoked" || selectedProject.status === "Suspended" ? (
                <div className="p-4 rounded-2xl bg-[#fce8e8] border border-[#f5c2c2] text-xs space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-[#842029]">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-[#c92a2a]" />
                    <span>Transfers Blocked on Solana</span>
                  </div>
                  <p className="text-xs text-[#842029] leading-relaxed font-normal">
                    {selectedProject.revocationReason}
                  </p>
                  {selectedProject.revocationDate && (
                    <div className="text-xs font-mono text-[#c92a2a] font-medium">
                      Permanently revoked on {selectedProject.revocationDate}
                    </div>
                  )}

                  {/* Satellite Comparison Slider for Revoked Projects */}
                  <div className="pt-2">
                    <div className="text-xs font-bold text-[#111e16] mb-2 flex items-center justify-between">
                      <span>Satellite Degradation Comparison</span>
                      <span className="font-mono text-xs text-[#c92a2a]">Split View</span>
                    </div>
                    <div className="relative h-32 rounded-xl overflow-hidden border border-[#f5c2c2] select-none shadow-md">
                      <img
                        src={selectedProject.afterImage || "/borneo.png"}
                        alt="Degraded state"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div
                        className="absolute inset-0 overflow-hidden"
                        style={{ width: `${sliderPosition}%` }}
                      >
                        <img
                          src={selectedProject.beforeImage || "/amazon.png"}
                          alt="Baseline state"
                          className="absolute inset-0 w-full h-full object-cover max-w-none"
                          style={{ width: "340px" }}
                        />
                      </div>
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
                        style={{ left: `${sliderPosition}%` }}
                      />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sliderPosition}
                        onChange={(e) => setSliderPosition(Number(e.target.value))}
                        className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-10"
                        aria-label="Comparison slider"
                      />
                      <div className="absolute bottom-2 left-2 text-xs font-mono bg-black/85 px-2 py-0.5 rounded-md text-white font-semibold">
                        Baseline 2024
                      </div>
                      <div className="absolute bottom-2 right-2 text-xs font-mono bg-black/85 px-2 py-0.5 rounded-md text-rose-300 font-semibold">
                        Deforested
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#e8f3ea] border border-[#c6e1cb] text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-[#1b4332]">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#24633d]" />
                    <span>Transfers Permitted</span>
                  </div>
                  <p className="text-xs text-[#2d503d] leading-relaxed">
                    Automated Token-2022 Transfer Hook active. Multispectral biomass satisfies all permanence and additionality thresholds.
                  </p>
                </div>
              )}

              {/* ORACLE ACCOUNT & CADENCE INFO */}
              <div className="p-4 rounded-2xl bg-[#f0f4ee] border border-[#e1e8de] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#111e16]">Solana Oracle Account</span>
                  <span className="text-[#2d6a4f] font-mono text-xs font-semibold">Devnet</span>
                </div>
                <AddressChip address={selectedProject.oracleAddress} />

                {/* Scan Cadence Info */}
                <div className="pt-2 border-t border-[#e1e8de] space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#5c7366]">
                    <span>Last Scan:</span>
                    <span className="font-mono text-[#111e16] font-semibold">{selectedProject.lastScan}</span>
                  </div>
                  {selectedProject.nextScan && (
                    <div className="flex justify-between text-[#5c7366]">
                      <span>Next Orbit:</span>
                      <span className="font-mono text-[#111e16] font-semibold">{selectedProject.nextScan}</span>
                    </div>
                  )}
                  {selectedProject.cadence && (
                    <div className="flex justify-between text-[#5c7366]">
                      <span>Cadence:</span>
                      <span className="font-mono text-[#111e16]">{selectedProject.cadence}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* TIMELINE OF ORACLE EVENTS */}
              {selectedProject.timelineEvents && (
                <div className="p-4 rounded-2xl bg-[#f0f4ee] border border-[#e1e8de] space-y-3">
                  <div className="text-xs font-bold text-[#111e16]">
                    Attestation Event History
                  </div>
                  <div className="space-y-3 text-xs">
                    {selectedProject.timelineEvents.map((evt, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                          evt.type === "revoked" || evt.type === "alert"
                            ? "bg-rose-500"
                            : "bg-[#2d6a4f]"
                        }`} />
                        <div>
                          <div className="font-medium text-[#111e16]">{evt.title}</div>
                          <div className="text-xs font-mono text-[#5c7366] mt-0.5">{evt.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SOLANA EXPLORER PINNED BUTTON */}
              <a
                href={`https://explorer.solana.com/address/${selectedProject.oracleAddress}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-[#2d6a4f] hover:bg-[#23563f] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>View Oracle Account on Solana Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </aside>
        )}
      </div>
    </PageShell>
  );
}

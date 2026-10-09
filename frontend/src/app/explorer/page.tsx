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
    <div className="w-full h-full bg-[#0c1611] flex items-center justify-center text-sm font-mono text-[var(--text-muted)] animate-pulse">
      <div className="flex items-center gap-3 bg-[#122119] px-6 py-3.5 rounded-2xl border border-[var(--border)] shadow-xl">
        <RefreshCw className="w-5 h-5 animate-spin text-[var(--accent)]" />
        <span className="text-[var(--text)] font-sans font-medium">Initializing Sentinel-2 Telemetry Engine...</span>
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
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(1);
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
        const res = await fetch("/api/telemetry?parcel=amazon-block-7");
        if (res.ok) {
          const data = await res.json();
          if (data && data.ndvi) {
            setProjects((prev) =>
              prev.map((p) => {
                if (p.id === 1) {
                  return {
                    ...p,
                    ndvi: data.ndvi ?? p.ndvi,
                    cqsScore: data.cqsScore ?? p.cqsScore,
                    forestCover: data.forestCover ? `${data.forestCover}%` : p.forestCover,
                    lastScan: "Just now",
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
    const interval = setInterval(fetchTelemetry, 8000);
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
    <PageShell fullWidth noScroll>
      <div className="flex-1 flex flex-col md:flex-row h-full min-h-0 w-full overflow-hidden relative">

        {/* ================================================================= */}
        {/* 1. LEFT CONSOLE PANEL (Collapsible, Spacious, Pachama-style)       */}
        {/* ================================================================= */}
        {consoleOpen ? (
          <aside className="w-full md:w-[360px] md:min-w-[360px] md:max-w-[360px] h-auto md:h-full flex flex-col shrink-0 bg-[#0c1611] border-r border-[var(--border)] z-20 shadow-2xl transition-all duration-200">
            {/* Top Bar: Brand, Sync & Collapse Button */}
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[#0e1a14]">
              <div>
                <h1 className="text-base font-bold text-[var(--text)] tracking-tight flex items-center gap-2">
                  <span>Forest Explorer</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-mono font-medium border border-[var(--accent)]/30">
                    Sentinel-2
                  </span>
                </h1>
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mt-1 font-sans">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                  <span>Live telemetry · synced <span className="font-mono text-[var(--text)]">{lastSyncedTime}</span></span>
                </div>
              </div>

              <button
                onClick={() => setConsoleOpen(false)}
                className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[#15251c] transition-colors cursor-pointer"
                title="Collapse sidebar for full map"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs: Forests vs Layers */}
            <div className="p-3 border-b border-[var(--border)] bg-[#09110d]">
              <div className="grid grid-cols-2 p-1 rounded-xl bg-[#122119] border border-[var(--border)]">
                <button
                  onClick={() => setActiveTab("projects")}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === "projects"
                      ? "bg-[var(--accent)] text-[#060b08] shadow-sm font-bold"
                      : "text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Monitored Forests ({projects.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab("layers")}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === "layers"
                      ? "bg-[var(--accent)] text-[#060b08] shadow-sm font-bold"
                      : "text-[var(--text-muted)] hover:text-[var(--text)]"
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
                <div className="p-3.5 border-b border-[var(--border)] space-y-3 bg-[#0c1611]">
                  <div className="relative">
                    <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        startTransition(() => setSearchQuery(val));
                      }}
                      placeholder="Search forest or region..."
                      className="w-full bg-[#122119] border border-[var(--border)] rounded-xl pl-10 pr-9 py-2.5 text-xs text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
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
                                ? "bg-[var(--accent)] text-[#060b08] shadow-xs"
                                : "bg-[#122119] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]"
                            }`}
                          >
                            {filter === "all" ? "All" : filter === "verified" ? "Verified" : "Revoked"}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as "grade" | "canopy" | "scan")}
                        className="bg-transparent text-xs text-[var(--text)] focus:outline-none cursor-pointer font-medium"
                      >
                        <option value="grade" className="bg-[#0c1611]">Grade</option>
                        <option value="canopy" className="bg-[#0c1611]">Canopy %</option>
                        <option value="scan" className="bg-[#0c1611]">Recency</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Forest Cards List */}
                <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
                  {filteredProjects.length === 0 ? (
                    <div className="py-12 text-center text-sm text-[var(--text-muted)]">
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
                          className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative ${
                            isSelected
                              ? "bg-[#15251c] border-[var(--accent)] shadow-lg ring-1 ring-[var(--accent)]/40"
                              : "bg-[#0f1b14] border-[var(--border)] hover:bg-[#132219] hover:border-[var(--border-hover)]"
                          }`}
                        >
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-[var(--text)] truncate">
                                {proj.name}
                              </h3>
                              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mt-0.5">
                                <MapPin className="w-3.5 h-3.5 shrink-0 text-[var(--accent)]" />
                                <span className="truncate">{proj.region}</span>
                              </div>
                            </div>
                            <div className="shrink-0 flex items-center gap-1.5">
                              <GradeBadge grade={proj.grade} score={proj.cqsScore} />
                            </div>
                          </div>

                          {/* Card Metrics Row */}
                          <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-[#0a130e] border border-[var(--border-subtle)] text-xs mt-3">
                            <div>
                              <div className="text-[11px] text-[var(--text-muted)]">NDVI Index</div>
                              <div className="font-mono font-bold text-[var(--text)] mt-0.5">{proj.ndvi.toFixed(3)}</div>
                            </div>

                            <div>
                              <div className="text-[11px] text-[var(--text-muted)]">Canopy</div>
                              <div className="font-mono font-bold text-[var(--text)] mt-0.5">{proj.forestCover}</div>
                            </div>

                            <div>
                              <div className="text-[11px] text-[var(--text-muted)]">Status</div>
                              <div className="flex items-center gap-1 mt-0.5 font-medium">
                                <span className={`w-2 h-2 rounded-full ${isRevoked ? "bg-[var(--danger)]" : "bg-[var(--accent)]"}`} />
                                <span className={isRevoked ? "text-[var(--danger)]" : "text-[var(--accent)]"}>
                                  {proj.status}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Bottom Row */}
                          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-2.5 mt-1 font-mono">
                            <span>Area: {proj.area}</span>
                            <span className="text-[var(--accent)] font-sans font-medium flex items-center gap-1">
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
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                    Select Sentinel-2 Spectral Layer
                  </h3>

                  <div className="space-y-2.5">
                    {layerOptions.map((layer) => {
                      const isSelected = activeLayer === layer.id;
                      return (
                        <div
                          key={layer.id}
                          onClick={() => setActiveLayer(layer.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#15251c] border-[var(--accent)] ring-1 ring-[var(--accent)]/40 shadow-md"
                              : "bg-[#0f1b14] border-[var(--border)] hover:bg-[#132219]"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-bold text-[var(--text)]">
                              {layer.name}
                            </span>
                            <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md font-semibold ${
                              isSelected ? "bg-[var(--accent)] text-[#060b08]" : "bg-[#122119] text-[var(--text-muted)]"
                            }`}>
                              {layer.tag}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                            {layer.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Layer Opacity Slider */}
                <div className="p-4 rounded-2xl bg-[#0f1b14] border border-[var(--border)] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[var(--text)] flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[var(--accent)]" />
                      Layer Opacity
                    </span>
                    <span className="font-mono text-sm font-bold text-[var(--accent)]">
                      {layerOpacity}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={layerOpacity}
                    onChange={(e) => setLayerOpacity(Number(e.target.value))}
                    className="w-full accent-[var(--accent)] h-2 bg-[#122119] rounded-lg cursor-pointer"
                  />
                </div>

                {/* Sentinel-2 Orbit Pass Selector */}
                <div className="p-4 rounded-2xl bg-[#0f1b14] border border-[var(--border)] space-y-2.5">
                  <div className="text-xs font-bold text-[var(--text)] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[var(--accent)]" />
                    <span>Orbital Pass Revisit</span>
                  </div>
                  <select
                    value={scanDate}
                    onChange={(e) => setScanDate(e.target.value)}
                    className="w-full bg-[#122119] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text)] font-medium cursor-pointer focus:outline-none focus:border-[var(--accent)]"
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
            className="absolute top-5 left-5 z-[500] px-4 py-2.5 rounded-2xl bg-[#0c1611]/95 backdrop-blur-xl border border-[var(--border)] text-xs text-[var(--text)] hover:border-[var(--accent)] shadow-2xl flex items-center gap-2 cursor-pointer font-bold transition-all"
          >
            <PanelLeftOpen className="w-4 h-4 text-[var(--accent)]" />
            <span>Open Forest Console</span>
          </button>
        )}

        {/* ================================================================= */}
        {/* 2. MAIN MAP CANVAS (Expansive, Full Viewport, Hero Feature)        */}
        {/* ================================================================= */}
        <div className="flex-1 min-w-0 h-full relative overflow-hidden bg-[#060b08]">
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

          {/* Floating Quick Layer Switcher Bar (Pachama / Sentinel Hub style directly on map) */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 z-[400] flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#0c1611]/92 backdrop-blur-xl border border-[var(--border)] shadow-2xl max-w-[95vw] overflow-x-auto">
            {layerOptions.map((l) => {
              const isSelected = activeLayer === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => setActiveLayer(l.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[var(--accent)] text-[#060b08] font-bold shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[#15251c]"
                  }`}
                >
                  {l.name.split(" ")[0]}
                </button>
              );
            })}

            <div className="w-[1px] h-4 bg-[var(--border)] mx-1 shrink-0" />

            {/* Reset Map View Button */}
            <button
              onClick={() => setFitAllTrigger((t) => t + 1)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--text)] hover:bg-[#15251c] transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="Fit all forest parcels into view"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Fit All</span>
            </button>
          </div>

          {/* Floating Inspect Button if detail panel is closed */}
          {!detailOpen && selectedProject && (
            <button
              onClick={() => setDetailOpen(true)}
              className="absolute top-5 right-5 z-[400] px-4 py-2.5 rounded-2xl bg-[#0c1611]/95 backdrop-blur-xl border border-[var(--border)] text-xs text-[var(--text)] hover:border-[var(--accent)] shadow-2xl flex items-center gap-2 cursor-pointer font-bold transition-all"
            >
              <Eye className="w-4 h-4 text-[var(--accent)]" />
              <span>Inspect {selectedProject.name.split(" ")[0]} Data</span>
            </button>
          )}
        </div>

        {/* ================================================================= */}
        {/* 3. RIGHT DETAIL INSPECTOR (Spacious, Legible, Docked Drawer)      */}
        {/* ================================================================= */}
        {detailOpen && selectedProject && (
          <aside className="w-full md:w-[380px] md:min-w-[380px] md:max-w-[380px] h-auto md:h-full flex flex-col shrink-0 bg-[#0c1611] border-l border-[var(--border)] z-20 shadow-2xl transition-all duration-200">
            {/* Header: Title, Region, Badges & Close Button */}
            <div className="p-5 border-b border-[var(--border)] bg-[#0e1a14] flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <GradeBadge grade={selectedProject.grade} score={selectedProject.cqsScore} />
                  <StatusBadge status={selectedProject.status} />
                </div>
                <h2 className="text-base font-bold text-[var(--text)] leading-snug">
                  {selectedProject.name}
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[var(--accent)] shrink-0" />
                  <span>{selectedProject.region} · {selectedProject.area}</span>
                </p>
              </div>

              <button
                onClick={() => setDetailOpen(false)}
                className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[#15251c] transition-colors cursor-pointer"
                title="Close telemetry inspector"
                aria-label="Close telemetry inspector"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content Body with Large Readable Typography */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* PRIMARY STAT GRID (Large, bold, high contrast numbers) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#0f1b14] border border-[var(--border)]">
                  <div className="text-xs text-[var(--text-muted)] font-medium">NDVI Index</div>
                  <div className="font-mono text-2xl font-bold text-[var(--text)] mt-1">
                    {selectedProject.ndvi.toFixed(3)}
                  </div>
                  <div className="text-xs font-mono text-[var(--text-muted)] mt-1">
                    Baseline: {selectedProject.baselineNdvi.toFixed(3)} (
                    <span className={selectedProject.ndvi >= selectedProject.baselineNdvi ? "text-[var(--accent)] font-semibold" : "text-[var(--danger)] font-semibold"}>
                      {(selectedProject.ndvi - selectedProject.baselineNdvi > 0 ? "+" : "")}
                      {(selectedProject.ndvi - selectedProject.baselineNdvi).toFixed(3)}
                    </span>)
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0f1b14] border border-[var(--border)]">
                  <div className="text-xs text-[var(--text-muted)] font-medium">Canopy Cover</div>
                  <div className="font-mono text-2xl font-bold text-[var(--text)] mt-1">
                    {selectedProject.forestCover}
                  </div>
                  <div className="text-xs font-mono text-[var(--text-muted)] mt-1">
                    Area: {selectedProject.area}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0f1b14] border border-[var(--border)]">
                  <div className="text-xs text-[var(--text-muted)] font-medium">Canopy Quality</div>
                  <div className="font-mono text-2xl font-bold text-[var(--text)] mt-1">
                    {selectedProject.cqsScore} <span className="text-xs font-normal text-[var(--text-muted)]">/ 100</span>
                  </div>
                  <div className="text-xs font-mono text-[var(--accent)] mt-1 flex items-center gap-1 font-semibold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Trend: {selectedProject.trend}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0f1b14] border border-[var(--border)]">
                  <div className="text-xs text-[var(--text-muted)] font-medium">Cloud Obscurity</div>
                  <div className="font-mono text-2xl font-bold text-[var(--text)] mt-1">
                    {selectedProject.cloudCover}
                  </div>
                  <div className="text-xs font-mono text-[var(--text-muted)] mt-1">
                    Sentinel-2 L2A scene
                  </div>
                </div>
              </div>

              {/* 90-DAY NDVI SPARKLINE CHART */}
              {selectedProject.sparkline && (
                <div className="p-4 rounded-2xl bg-[#0f1b14] border border-[var(--border)] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[var(--text)]">90-Day NDVI Stability Trend</span>
                    <span className="font-mono text-xs text-[var(--accent)] font-semibold">
                      Baseline: {selectedProject.baselineNdvi}
                    </span>
                  </div>

                  <div className="h-20 w-full relative pt-2">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 300 70">
                      {/* Baseline threshold line */}
                      <line
                        x1="0"
                        y1="40"
                        x2="300"
                        y2="40"
                        stroke="rgba(245, 158, 11, 0.45)"
                        strokeDasharray="4 4"
                        strokeWidth="1.5"
                      />
                      {/* Sparkline curve */}
                      <polyline
                        fill="none"
                        stroke={selectedProject.status === "Revoked" ? "#ef4444" : "#10b981"}
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
                  <div className="flex justify-between text-xs font-mono text-[var(--text-muted)]">
                    <span>90 days ago</span>
                    <span>Latest scan</span>
                  </div>
                </div>
              )}

              {/* SOLANA TRANSFER HOOK STATUS BANNER */}
              {selectedProject.status === "Revoked" || selectedProject.status === "Suspended" ? (
                <div className="p-4 rounded-2xl bg-[var(--danger-subtle)] border border-[var(--danger)]/30 text-xs space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-[var(--danger)]">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Transfers Blocked on Solana</span>
                  </div>
                  <p className="text-xs text-[var(--text)] leading-relaxed font-normal">
                    {selectedProject.revocationReason}
                  </p>
                  {selectedProject.revocationDate && (
                    <div className="text-xs font-mono text-[var(--danger)] font-medium">
                      Permanently revoked on {selectedProject.revocationDate}
                    </div>
                  )}

                  {/* Satellite Comparison Slider for Revoked Projects */}
                  <div className="pt-2">
                    <div className="text-xs font-bold text-[var(--text)] mb-2 flex items-center justify-between">
                      <span>Satellite Degradation Comparison</span>
                      <span className="font-mono text-xs text-[var(--danger)]">Split View</span>
                    </div>
                    <div className="relative h-32 rounded-xl overflow-hidden border border-[var(--danger)]/40 select-none shadow-md">
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
                <div className="p-4 rounded-2xl bg-[var(--accent-subtle)] border border-[var(--accent)]/30 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-[var(--accent)]">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Transfers Permitted on Solana</span>
                  </div>
                  <p className="text-xs text-[var(--text)] leading-relaxed">
                    Automated Token-2022 Transfer Hook active. Multispectral biomass satisfies all permanence and additionality thresholds.
                  </p>
                </div>
              )}

              {/* ORACLE ACCOUNT & ATTESTATION TIMELINE */}
              <div className="p-4 rounded-2xl bg-[#0f1b14] border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--text)]">Solana Oracle Account</span>
                  <span className="text-[var(--accent)] font-mono text-xs font-semibold">Devnet</span>
                </div>
                <AddressChip address={selectedProject.oracleAddress} />

                {/* Scan Cadence Info */}
                <div className="pt-2 border-t border-[var(--border-subtle)] space-y-1.5 text-xs">
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>Last Scan:</span>
                    <span className="font-mono text-[var(--text)] font-semibold">{selectedProject.lastScan}</span>
                  </div>
                  {selectedProject.nextScan && (
                    <div className="flex justify-between text-[var(--text-muted)]">
                      <span>Next Orbit:</span>
                      <span className="font-mono text-[var(--text)] font-semibold">{selectedProject.nextScan}</span>
                    </div>
                  )}
                  {selectedProject.cadence && (
                    <div className="flex justify-between text-[var(--text-muted)]">
                      <span>Cadence:</span>
                      <span className="font-mono text-[var(--text)]">{selectedProject.cadence}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* TIMELINE OF ORACLE EVENTS */}
              {selectedProject.timelineEvents && (
                <div className="p-4 rounded-2xl bg-[#0f1b14] border border-[var(--border)] space-y-3">
                  <div className="text-xs font-bold text-[var(--text)]">
                    Attestation Event History
                  </div>
                  <div className="space-y-3 text-xs">
                    {selectedProject.timelineEvents.map((evt, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                          evt.type === "revoked" || evt.type === "alert"
                            ? "bg-[var(--danger)]"
                            : "bg-[var(--accent)]"
                        }`} />
                        <div>
                          <div className="font-medium text-[var(--text)]">{evt.title}</div>
                          <div className="text-xs font-mono text-[var(--text-muted)] mt-0.5">{evt.date}</div>
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
                className="w-full py-3 rounded-xl bg-[var(--accent)] hover:opacity-95 text-[#060b08] font-bold text-xs transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-lg"
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

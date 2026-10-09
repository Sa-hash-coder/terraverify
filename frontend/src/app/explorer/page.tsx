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
  ArrowUpDown
} from "lucide-react";
import PageShell from "../../components/layout/page-shell";
import {
  StatusBadge,
  GradeBadge,
  AddressChip,
  Skeleton,
  EmptyState
} from "../../components/shared/design-system";
import { ParcelProject, MapLayerType } from "../../components/map-component";

// Dynamically load Map with Leaflet
const MapComponent = dynamic(() => import("../../components/map-component"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[var(--surface)] flex items-center justify-center text-xs font-mono text-[var(--text-muted)] animate-pulse">
      <div className="flex items-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-[var(--accent)]" />
        <span>Initializing Satellite Telemetry Engine...</span>
      </div>
    </div>
  ),
});

// Rich parcel data matching Sentinel-2 specifications
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
      { date: "Oct 9, 2026", title: "Automated Sentinel-2 L2A scan completed", type: "scan" },
      { date: "Oct 4, 2026", title: "Canopy stability verified (NDVI 0.844)", type: "verified" },
      { date: "Sep 29, 2026", title: "Oracle Token-2022 hook renewed", type: "verified" },
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
    oracleAddress: "9B2aRt55wQpxNMJ928YzpQ111111111111111111111",
    lastScan: "5 hours ago",
    lastScanTimestamp: "2026-10-09 14:15:00 UTC",
    nextScan: "In 2 days (Orbit 089)",
    cadence: "Every 3-5 days",
    cloudCover: "1.4%",
    trend: "0.0%",
    sparkline: [0.81, 0.808, 0.812, 0.811, 0.809, 0.814, 0.812, 0.815, 0.811, 0.813, 0.812, 0.812],
    timelineEvents: [
      { date: "Oct 9, 2026", title: "Multispectral NIR scan evaluated intact", type: "scan" },
      { date: "Oct 1, 2026", title: "Biomass density audit confirmed Grade AA", type: "verified" },
      { date: "Sep 20, 2026", title: "Oracle attestation signed on Solana", type: "verified" },
    ],
    beforeImage: "/amazon.png",
    afterImage: "/amazon.png",
  },
  {
    id: 3,
    name: "Borneo Peatland Protection",
    region: "Central Kalimantan, Indonesia",
    grade: "C",
    status: "Revoked",
    cqsScore: 42,
    forestCover: "62.1%",
    ndvi: 0.584,
    baselineNdvi: 0.790,
    area: "8,200 ha",
    center: [-1.25, 114.12],
    bounds: [
      [-1.38, 113.98],
      [-1.38, 114.25],
      [-1.12, 114.25],
      [-1.12, 113.98],
    ],
    oracleAddress: "7aZk9LpPeN4392Mka14441111111111111111111111",
    lastScan: "12 hours ago",
    lastScanTimestamp: "2026-10-09 07:45:00 UTC",
    nextScan: "Under enforcement hold",
    cadence: "Every 3-5 days",
    cloudCover: "0.4%",
    trend: "-5.4%",
    revocationReason:
      "Canopy fell to 62.1%, 5.4 points below the 80% baseline threshold. Ground degradation and commercial clearing identified via Band 8 Near-Infrared telemetry.",
    revocationDate: "October 8, 2026",
    sparkline: [0.79, 0.785, 0.77, 0.75, 0.73, 0.70, 0.67, 0.64, 0.61, 0.59, 0.585, 0.584],
    timelineEvents: [
      { date: "Oct 8, 2026", title: "Transfer hook triggered: Trading halted", type: "revoked" },
      { date: "Oct 8, 2026", title: "Grade downgraded from AA to C", type: "alert" },
      { date: "Oct 2, 2026", title: "Anomaly detected in Band 8 reflectance", type: "alert" },
      { date: "Sep 15, 2026", title: "Baseline telemetry active", type: "verified" },
    ],
    beforeImage: "/amazon.png",
    afterImage: "/borneo.png",
  },
];

export default function ExplorerPage() {
  const [projects, setProjects] = useState<ParcelProject[]>(DEFAULT_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(1);
  const [activeLayer, setActiveLayer] = useState<MapLayerType>("truecolor");
  const [layerOpacity, setLayerOpacity] = useState(100);
  const [scanDate, setScanDate] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "verified" | "revoked">("all");
  const [sortBy, setSortBy] = useState<"grade" | "canopy" | "scan">("grade");
  const [detailOpen, setDetailOpen] = useState(true);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("19:44");
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isPending, startTransition] = useTransition();

  // Poll live telemetry API without changing contract
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch("/api/telemetry");
        if (res.ok) {
          const data = await res.json();
          if (data.projects) {
            setProjects((prev) =>
              prev.map((proj) => {
                const match = data.projects.find(
                  (p: { id: string; name: string }) =>
                    p.name.toLowerCase() === proj.name.toLowerCase() ||
                    (p.id === "PRJ-001" && proj.id === 1) ||
                    (p.id === "PRJ-002" && proj.id === 2) ||
                    (p.id === "PRJ-003" && proj.id === 3)
                );
                if (match) {
                  return {
                    ...proj,
                    forestCover: match.forestCover || proj.forestCover,
                    status: match.status === "Suspended" ? "Revoked" : match.status || proj.status,
                    cqsScore: match.cqsScore ?? proj.cqsScore,
                    trend: match.trend || proj.trend,
                    lastScan: match.lastScan || proj.lastScan,
                  };
                }
                return proj;
              })
            );
            setLastSyncedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
          }
        }
      } catch {}
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 6000);
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

  const layerOptions: { id: MapLayerType; name: string; desc: string }[] = [
    { id: "truecolor", name: "True colour", desc: "Sentinel-2 RGB 10m natural reflectance" },
    { id: "ndvi", name: "NDVI health", desc: "Multispectral photosynthetic canopy index" },
    { id: "nir", name: "NIR band 8", desc: "Near-infrared vegetation density mapping" },
    { id: "change", name: "Change detection", desc: "Delta comparison vs verified historical baseline" },
  ];

  return (
    <PageShell fullWidth noScroll>
      <div className="flex-1 flex flex-col md:flex-row h-full min-h-0 w-full overflow-hidden select-none-selection">
        {/* ================================================================= */}
        {/* 1. Explorer Control Panel (Docked Left, 320px, Hairline Dividers) */}
        {/* ================================================================= */}
        <aside className="w-full md:w-80 md:min-w-[320px] md:max-w-[320px] h-auto md:h-full flex flex-col shrink-0 bg-[var(--surface)] border-r border-[var(--border)] overflow-y-auto">
          {/* Header Row: Title & Sync Status */}
          <div className="p-3.5 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text)] tracking-tight">
              Explorer
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              <span>Telemetry active · synced <span className="font-mono">{lastSyncedTime}</span></span>
            </div>
          </div>

          {/* Search Input (Debounced / Controlled) */}
          <div className="p-3 border-b border-[var(--border)]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  startTransition(() => {
                    setSearchQuery(val);
                  });
                }}
                placeholder="Search parcel or region..."
                className="w-full bg-[var(--surface-raised)] border border-[var(--border)] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Status Filter as Segmented Control with Sliding Indicator (Fixes dark block bug) */}
          <div className="p-3 border-b border-[var(--border)] space-y-2">
            <div className="grid grid-cols-3 p-1 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)]">
              {(["all", "verified", "revoked"] as const).map((filter) => {
                const isActive = statusFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => {
                      startTransition(() => {
                        setStatusFilter(filter);
                      });
                    }}
                    className={`py-1 text-xs font-medium rounded-md transition-all cursor-pointer text-center ${
                      isActive
                        ? "bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold border border-[var(--accent)]/30 shadow-xs"
                        : "text-[var(--text-muted)] hover:text-[var(--text)]"
                    }`}
                  >
                    {filter === "all" ? "All" : filter === "verified" ? "Verified" : "Revoked"}
                  </button>
                );
              })}
            </div>

            {/* Count & Sort menu */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[var(--text-muted)]">
                {filteredProjects.length} parcel{filteredProjects.length === 1 ? "" : "s"}
              </span>

              <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                <ArrowUpDown className="w-3 h-3" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "grade" | "canopy" | "scan")}
                  className="bg-transparent text-xs text-[var(--text)] focus:outline-none cursor-pointer"
                >
                  <option value="grade" className="bg-[var(--surface)]">Sort: Grade</option>
                  <option value="canopy" className="bg-[var(--surface)]">Sort: Canopy %</option>
                  <option value="scan" className="bg-[var(--surface)]">Sort: Recency</option>
                </select>
              </div>
            </div>
          </div>

          {/* Compact Parcel List Rows (Hairline Dividers, Left Accent Bar on Select) */}
          <div className="flex-1 divide-y divide-[var(--border-subtle)] overflow-y-auto">
            {filteredProjects.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--text-muted)]">
                No parcels match the current filters.
              </div>
            ) : (
              filteredProjects.map((proj) => {
                const isSelected = selectedProjectId === proj.id;
                const isRevoked = proj.status === "Revoked" || proj.status === "Suspended";

                return (
                  <button
                    key={proj.id}
                    onClick={() => {
                      setSelectedProjectId(proj.id);
                      setDetailOpen(true);
                    }}
                    className={`w-full p-3 text-left transition-colors flex flex-col gap-1.5 cursor-pointer relative ${
                      isSelected
                        ? "bg-[var(--surface-raised)] border-l-2 border-[var(--accent)]"
                        : "hover:bg-[var(--surface-raised)]/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[var(--text)] truncate">
                          {proj.name}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{proj.region}</span>
                        </div>
                      </div>
                      <GradeBadge grade={proj.grade} />
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-[var(--text)]">{proj.forestCover}</span>
                        <div className="flex items-center gap-0.5">
                          {isRevoked ? (
                            <TrendingDown className="w-3 h-3 text-[var(--danger)]" />
                          ) : (
                            <TrendingUp className="w-3 h-3 text-[var(--accent)]" />
                          )}
                          <span className={isRevoked ? "text-[var(--danger)]" : "text-[var(--accent)]"}>
                            {proj.trend}
                          </span>
                        </div>
                      </div>

                      {/* Small Status dot (no full pink background) */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isRevoked ? "bg-[var(--danger)]" : "bg-[var(--accent)]"
                          }`}
                        />
                        <span className="text-[10px] text-[var(--text-muted)] font-mono">
                          {proj.status}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Map Layer Switcher Section (Radio List in Control Panel) */}
          <div className="p-3.5 border-t border-[var(--border)] bg-[var(--surface-raised)]/40 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--text)] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Map Layer</span>
              </span>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">
                Opacity: {layerOpacity}%
              </span>
            </div>

            {/* Radio List */}
            <div className="space-y-1.5">
              {layerOptions.map((opt) => {
                const isActive = activeLayer === opt.id;
                return (
                  <label
                    key={opt.id}
                    onClick={() => setActiveLayer(opt.id)}
                    className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                      isActive
                        ? "bg-[var(--accent-subtle)] border-[var(--accent)]/40 text-[var(--text)]"
                        : "border-transparent hover:bg-[var(--surface-raised)] text-[var(--text-muted)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="mapLayer"
                      checked={isActive}
                      onChange={() => setActiveLayer(opt.id)}
                      className="mt-0.5 accent-[var(--accent)]"
                    />
                    <div className="flex flex-col">
                      <span className={`font-medium ${isActive ? "text-[var(--text)]" : ""}`}>
                        {opt.name}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] leading-tight">
                        {opt.desc}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Opacity Slider */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                <span>Overlay Opacity</span>
                <span>{layerOpacity}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={layerOpacity}
                onChange={(e) => setLayerOpacity(Number(e.target.value))}
                className="w-full accent-[var(--accent)] h-1 bg-[var(--surface-raised)] rounded-lg cursor-pointer"
              />
            </div>

            {/* Scan-Date Selector */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--border-subtle)]">
              <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Pass:</span>
              </span>
              <select
                value={scanDate}
                onChange={(e) => setScanDate(e.target.value)}
                className="bg-[var(--surface-raised)] border border-[var(--border)] rounded px-2 py-0.5 text-xs text-[var(--text)] cursor-pointer"
              >
                <option value="latest">Latest Sentinel-2 L2A</option>
                <option value="prev1">7 days prior pass</option>
                <option value="baseline">Historical Baseline (2024)</option>
              </select>
            </div>
          </div>
        </aside>

        {/* ================================================================= */}
        {/* 2. Map Canvas (Fills the Rest, Height 100%, Min-h-0)               */}
        {/* ================================================================= */}
        <div className="flex-1 min-w-0 h-[450px] md:h-full relative overflow-hidden bg-[var(--surface)]">
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
          />

          {/* Re-open Detail Panel Button if collapsed */}
          {!detailOpen && selectedProject && (
            <button
              onClick={() => setDetailOpen(true)}
              className="absolute top-4 right-4 z-[400] px-3 py-1.5 rounded-lg bg-[var(--surface)]/90 backdrop-blur-md border border-[var(--border)] text-xs text-[var(--text)] hover:border-[var(--accent)] transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <span>Inspect Telemetry</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* ================================================================= */}
        {/* 3. Detail Panel (Docked Right, 360px, Hairline Dividers)          */}
        {/* ================================================================= */}
        {detailOpen && selectedProject && (
          <aside className="w-full md:w-[360px] md:min-w-[360px] md:max-w-[360px] h-auto md:h-full flex flex-col shrink-0 bg-[var(--surface)] border-l border-[var(--border)] overflow-hidden transition-all duration-200">
            {/* Header: Project Name, Region, Grade & Status */}
            <div className="p-4 border-b border-[var(--border)] flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <GradeBadge grade={selectedProject.grade} score={selectedProject.cqsScore} />
                  <StatusBadge status={selectedProject.status} />
                </div>
                <h3 className="text-sm font-bold text-[var(--text)] leading-snug">
                  {selectedProject.name}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {selectedProject.region} · {selectedProject.area}
                </p>
              </div>

              <button
                onClick={() => setDetailOpen(false)}
                className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)] transition-colors cursor-pointer"
                title="Collapse details panel"
                aria-label="Collapse details panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Revocation Warning Banner (for Revoked parcels) */}
              {(selectedProject.status === "Revoked" || selectedProject.status === "Suspended") && (
                <div className="p-3 rounded-lg bg-[var(--danger-subtle)] border border-[var(--danger)]/30 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-semibold text-[var(--danger)]">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Transfer Hook: Transfers Blocked</span>
                  </div>
                  <p className="text-[11px] text-[var(--text)] leading-relaxed font-normal">
                    {selectedProject.revocationReason}
                  </p>
                  {selectedProject.revocationDate && (
                    <div className="text-[10px] font-mono text-[var(--text-muted)]">
                      Halted on {selectedProject.revocationDate}
                    </div>
                  )}

                  {/* Satellite Comparison Slider */}
                  <div className="pt-2">
                    <div className="text-[10px] font-mono uppercase text-[var(--danger)] mb-1 font-semibold">
                      Before / After Canopy Slider
                    </div>
                    <div className="relative h-28 rounded overflow-hidden border border-[var(--danger)]/30 select-none">
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
                          style={{ width: "360px" }}
                        />
                      </div>
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-white shadow"
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
                      <div className="absolute bottom-1 left-2 text-[9px] font-mono bg-black/80 px-1 rounded text-white">
                        Baseline
                      </div>
                      <div className="absolute bottom-1 right-2 text-[9px] font-mono bg-black/80 px-1 rounded text-rose-300">
                        Degraded
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stat Grid (Normal UI sans labels, Mono numbers) */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)]">
                  <div className="text-[11px] text-[var(--text-muted)] font-normal">
                    NDVI Index
                  </div>
                  <div className="font-mono text-base font-bold text-[var(--text)] mt-0.5">
                    {selectedProject.ndvi.toFixed(3)}
                  </div>
                  <div className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5">
                    Baseline: {selectedProject.baselineNdvi.toFixed(3)} (
                    <span className={selectedProject.ndvi >= selectedProject.baselineNdvi ? "text-[var(--accent)]" : "text-[var(--danger)]"}>
                      {(selectedProject.ndvi - selectedProject.baselineNdvi > 0 ? "+" : "")}
                      {(selectedProject.ndvi - selectedProject.baselineNdvi).toFixed(3)}
                    </span>)
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)]">
                  <div className="text-[11px] text-[var(--text-muted)] font-normal">
                    Canopy Quality
                  </div>
                  <div className="font-mono text-base font-bold text-[var(--text)] mt-0.5">
                    {selectedProject.cqsScore} / 100
                  </div>
                  <div className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5">
                    Trend: {selectedProject.trend}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)]">
                  <div className="text-[11px] text-[var(--text-muted)] font-normal">
                    Canopy Cover
                  </div>
                  <div className="font-mono text-base font-bold text-[var(--text)] mt-0.5">
                    {selectedProject.forestCover}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    Area: {selectedProject.area}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)]">
                  <div className="text-[11px] text-[var(--text-muted)] font-normal">
                    Cloud Cover
                  </div>
                  <div className="font-mono text-base font-bold text-[var(--text)] mt-0.5">
                    {selectedProject.cloudCover || "< 1.5%"}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    Clear scene pass
                  </div>
                </div>
              </div>

              {/* 30/90-Day NDVI Sparkline vs Baseline Threshold */}
              <div className="p-3 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[var(--text)]">90-Day NDVI Stability</span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    Baseline: {selectedProject.baselineNdvi.toFixed(2)}
                  </span>
                </div>
                {/* SVG Sparkline */}
                <div className="h-12 w-full relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                    {/* Baseline Dashed Line */}
                    <line
                      x1="0"
                      y1="22"
                      x2="100"
                      y2="22"
                      stroke="var(--text-muted)"
                      strokeWidth="0.8"
                      strokeDasharray="2,2"
                      opacity="0.6"
                    />
                    {/* Sparkline Path */}
                    {selectedProject.sparkline && (
                      <polyline
                        fill="none"
                        stroke={selectedProject.status === "Revoked" ? "var(--danger)" : "var(--accent)"}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={selectedProject.sparkline
                          .map((val, idx) => {
                            const x = (idx / (selectedProject.sparkline!.length - 1)) * 100;
                            // Map 0.5 -> 38, 0.9 -> 4
                            const y = 38 - ((val - 0.5) / 0.4) * 34;
                            return `${x},${Math.max(4, Math.min(38, y))}`;
                          })
                          .join(" ")}
                      />
                    )}
                  </svg>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)]">
                  <span>90d ago</span>
                  <span>Latest pass</span>
                </div>
              </div>

              {/* Scan Cadence & Hook Policy Details */}
              <div className="space-y-2 text-xs divide-y divide-[var(--border-subtle)]">
                <div className="flex justify-between py-1.5 items-center">
                  <span className="text-[var(--text-muted)]">Last scan</span>
                  <span
                    className="text-[var(--text)] font-mono cursor-help"
                    title={selectedProject.lastScanTimestamp || "Satellite pass verified"}
                  >
                    {selectedProject.lastScan}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 items-center">
                  <span className="text-[var(--text-muted)]">Next scan</span>
                  <span className="text-[var(--text)] font-mono text-[11px]">
                    {selectedProject.nextScan || "In 3 days"}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 items-center">
                  <span className="text-[var(--text-muted)]">Cadence</span>
                  <span className="text-[var(--text)] font-mono text-[11px]">
                    {selectedProject.cadence || "Every 3-5 days"}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 items-center">
                  <span className="text-[var(--text-muted)]">Transfer hook</span>
                  <span
                    className={`font-semibold ${
                      selectedProject.status === "Revoked"
                        ? "text-[var(--danger)]"
                        : "text-[var(--accent)]"
                    }`}
                  >
                    {selectedProject.status === "Revoked"
                      ? "Transfers blocked"
                      : "Transfers permitted"}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 items-center">
                  <span className="text-[var(--text-muted)]">Oracle account</span>
                  <AddressChip address={selectedProject.oracleAddress} />
                </div>
              </div>

              {/* Recent Oracle Events Timeline */}
              <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                <div className="text-xs font-semibold text-[var(--text)]">
                  Oracle Attestation Timeline
                </div>
                <div className="space-y-2 pl-2 border-l border-[var(--border)] text-xs">
                  {selectedProject.timelineEvents?.map((evt, idx) => (
                    <div key={idx} className="relative pl-3">
                      <span
                        className={`w-1.5 h-1.5 rounded-full absolute -left-[15px] top-1.5 ${
                          evt.type === "revoked"
                            ? "bg-[var(--danger)]"
                            : evt.type === "alert"
                            ? "bg-[var(--warning)]"
                            : "bg-[var(--accent)]"
                        }`}
                      />
                      <div className="text-[10px] font-mono text-[var(--text-muted)]">
                        {evt.date}
                      </div>
                      <div className="text-xs text-[var(--text)]">
                        {evt.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pinned Footer Button: View Oracle on Solana Explorer */}
            <div className="p-3 border-t border-[var(--border)] bg-[var(--surface)]">
              <a
                href={`https://explorer.solana.com/address/${selectedProject.oracleAddress}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-lg bg-[var(--accent)] hover:opacity-90 text-[var(--bg-app)] font-semibold text-xs transition-opacity flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>View oracle on Solana Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </aside>
        )}
      </div>
    </PageShell>
  );
}

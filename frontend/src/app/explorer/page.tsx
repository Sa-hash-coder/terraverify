"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import dynamic from "next/dynamic";
import { 
  Search, 
  Layers, 
  RefreshCw, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink,
  X,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  MapPin,
  Calendar,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";
import PageShell from "../../components/layout/page-shell";
import { 
  PageHeader, 
  Panel, 
  StatusBadge, 
  GradeBadge, 
  AddressChip, 
  Skeleton, 
  EmptyState,
  SegmentedControl
} from "../../components/shared/design-system";
import { ParcelProject, MapLayerType } from "../../components/map-component";

// Dynamically load Map with Leaflet
const MapComponent = dynamic(() => import("../../components/map-component"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] bg-[#07130f] flex items-center justify-center text-xs font-mono text-[#8e9f96]">
      <div className="flex items-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-[#38b87c]" />
        <span>Loading Satellite Canvas...</span>
      </div>
    </div>
  ),
});

// Baseline project definitions with exact GPS polygons
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
    lastScan: "2 hours ago (Sentinel-2 L2A)",
    trend: "+0.2%",
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
    lastScan: "5 hours ago (Sentinel-2 L2A)",
    trend: "0.0%",
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
    lastScan: "12 hours ago (Sentinel-2 L2A)",
    trend: "-5.4%",
    revocationReason:
      "Canopy fell to 62.1%, 5.4 points below the 80%-of-baseline threshold. Ground degradation and commercial clearing identified via Band 8 Near-Infrared telemetry.",
    beforeImage: "/amazon.png",
    afterImage: "/borneo.png",
  },
];

export default function ExplorerPage() {
  const [projects, setProjects] = useState<ParcelProject[]>(DEFAULT_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(1);
  const [activeLayer, setActiveLayer] = useState<MapLayerType>("truecolor");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "verified" | "revoked">("all");
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("Just now");
  const [isPending, startTransition] = useTransition();
  const [sliderPosition, setSliderPosition] = useState(50);

  // Poll live telemetry API
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
      } catch {
        // fail silently
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 6000);
    return () => clearInterval(interval);
  }, []);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || projects[0],
    [projects, selectedProjectId]
  );

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.region.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "verified"
          ? p.status === "Verified" || p.status === "Active"
          : p.status === "Revoked" || p.status === "Suspended";
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  return (
    <PageShell>
      <PageHeader
        title="Satellite Telemetry Explorer"
        description="Select a project to see its latest satellite readings and oracle status."
        actions={
          <div className="flex items-center gap-2 text-xs font-mono text-[#8e9f96]">
            <span className="w-2 h-2 rounded-full bg-[#38b87c] animate-pulse" />
            <span>Telemetry active · Synced {lastSyncedTime}</span>
          </div>
        }
      />

      {/* Main Split Layout: Compact List (Left) + Interactive Map & Drawer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Compact Project List & Filters (4 Columns) */}
        <div className="lg:col-span-4 space-y-4">
          <Panel className="p-4 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#718078] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by name or region..."
                className="w-full bg-[#07130f] light:bg-slate-50 border border-[#162922] light:border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#f4f5ef] light:text-slate-900 placeholder-[#718078] focus:outline-none focus:border-[#38b87c]"
              />
            </div>

            {/* Status Filter Segment */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex gap-1">
                {(["all", "verified", "revoked"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                      statusFilter === filter
                        ? "bg-[#162922] light:bg-slate-200 text-[#f4f5ef] light:text-slate-900 font-semibold"
                        : "text-[#8e9f96] hover:text-[#f4f5ef]"
                    }`}
                  >
                    {filter === "all" ? "All" : filter === "verified" ? "Verified" : "Revoked"}
                  </button>
                ))}
              </div>
              <span className="text-[11px] font-mono text-[#718078]">
                {filteredProjects.length} parcel{filteredProjects.length === 1 ? "" : "s"}
              </span>
            </div>
          </Panel>

          {/* Compact Project Rows */}
          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredProjects.length === 0 ? (
              <EmptyState
                title="No parcels match filters"
                description="Try clearing your search query or switching status filters."
              />
            ) : (
              filteredProjects.map((project) => {
                const isSelected = selectedProject?.id === project.id;
                const isRevoked = project.status === "Revoked" || project.status === "Suspended";

                return (
                  <div
                    key={project.id}
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      setDrawerOpen(true);
                    }}
                    className={`p-3.5 rounded-xl border transition-all text-left cursor-pointer ${
                      isSelected
                        ? "bg-[#10241b] border-[#38b87c]/60 light:bg-emerald-50 light:border-emerald-300 shadow-sm"
                        : isRevoked
                        ? "bg-[#0d1714] border-[#291313] hover:border-red-500/40 light:bg-white"
                        : "bg-[#0d1714] border-[#162922] hover:border-[#162922]/80 light:bg-white light:border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <h2 className="text-xs font-bold text-[#f4f5ef] light:text-slate-900 leading-snug">
                          {project.name}
                        </h2>
                        <div className="flex items-center gap-1 text-[11px] text-[#8e9f96] light:text-slate-500 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#718078]" />
                          <span>{project.region}</span>
                        </div>
                      </div>
                      <GradeBadge grade={project.grade} />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-[#162922]/60 light:border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[11px] text-[#f4f5ef] light:text-slate-800">
                          {project.forestCover} canopy
                        </span>
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          {isRevoked ? (
                            <TrendingDown className="w-3 h-3 text-red-400" />
                          ) : (
                            <TrendingUp className="w-3 h-3 text-[#38b87c]" />
                          )}
                          <span className={isRevoked ? "text-red-400" : "text-[#38b87c]"}>
                            {project.trend}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={project.status} size="sm" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Map Container + Detail Drawer (8 Columns) */}
        <div className="lg:col-span-8 space-y-4">
          <Panel className="relative overflow-hidden h-[540px] flex flex-col">
            {/* Top Toolbar: Layer Switcher */}
            <div className="absolute top-3 left-3 z-[400] flex items-center gap-2">
              <SegmentedControl<MapLayerType>
                value={activeLayer}
                onChange={setActiveLayer}
                options={[
                  { value: "truecolor", label: "True Colour" },
                  { value: "ndvi", label: "NDVI Health" },
                  { value: "nir", label: "NIR Band 8" },
                  { value: "change", label: "Delta" },
                ]}
              />
            </div>

            {/* Toggle Drawer button if closed */}
            {!drawerOpen && selectedProject && (
              <button
                onClick={() => setDrawerOpen(true)}
                className="absolute top-3 right-3 z-[400] px-3 py-1.5 rounded-lg bg-[#07130f]/90 border border-[#162922] text-xs font-mono text-[#f4f5ef] hover:bg-[#11231c] transition-colors cursor-pointer"
              >
                Inspect Telemetry →
              </button>
            )}

            {/* Persistent Leaflet Map Canvas */}
            <div className="w-full h-full">
              <MapComponent
                projects={projects}
                selectedProject={selectedProjectId}
                onSelectProject={(id) => {
                  setSelectedProjectId(id);
                  setDrawerOpen(true);
                }}
                activeLayer={activeLayer}
              />
            </div>

            {/* Slide-over Detail Drawer */}
            {drawerOpen && selectedProject && (
              <div className="absolute top-0 right-0 bottom-0 w-full sm:w-[380px] bg-[#0d1714]/95 light:bg-white/95 backdrop-blur-md border-l border-[#162922] light:border-slate-200 p-5 z-[500] overflow-y-auto flex flex-col justify-between shadow-2xl transition-all">
                <div className="space-y-4">
                  {/* Drawer Header */}
                  <div className="flex items-start justify-between pb-3 border-b border-[#162922] light:border-slate-200">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <GradeBadge grade={selectedProject.grade} score={selectedProject.cqsScore} />
                        <StatusBadge status={selectedProject.status} />
                      </div>
                      <h3 className="text-sm font-bold text-[#f4f5ef] light:text-slate-900 leading-tight">
                        {selectedProject.name}
                      </h3>
                      <p className="text-[11px] text-[#8e9f96] light:text-slate-500 mt-0.5">
                        {selectedProject.region} · {selectedProject.area}
                      </p>
                    </div>

                    <button
                      onClick={() => setDrawerOpen(false)}
                      className="p-1 text-[#718078] hover:text-white transition-colors cursor-pointer"
                      aria-label="Close detail drawer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Suspended Alert Banner (Borneo) */}
                  {(selectedProject.status === "Revoked" || selectedProject.status === "Suspended") && (
                    <div className="p-3 rounded-lg bg-[#291313] border border-red-500/40 text-xs text-red-300 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-red-400">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>Transfer Hook Enforced: Suspended</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-red-200/90 font-normal">
                        {selectedProject.revocationReason}
                      </p>

                      {/* Before / After Slider */}
                      <div className="pt-2">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-red-400 mb-1">
                          Canopy Loss Comparison
                        </div>
                        <div className="relative h-28 rounded overflow-hidden border border-red-500/30 select-none">
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
                              style={{ width: "380px" }}
                            />
                          </div>
                          {/* Divider line */}
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
                            aria-label="Before/After comparison slider"
                          />
                          <div className="absolute bottom-1 left-2 text-[9px] font-mono bg-black/60 px-1 rounded text-white">
                            Baseline
                          </div>
                          <div className="absolute bottom-1 right-2 text-[9px] font-mono bg-black/60 px-1 rounded text-red-400">
                            Degraded
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Telemetry Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-[#07130f] light:bg-slate-100 border border-[#162922] light:border-slate-200">
                      <span className="text-[10px] text-[#8e9f96] light:text-slate-500 font-mono">
                        NDVI INDEX
                      </span>
                      <div className="font-mono text-sm font-bold text-[#f4f5ef] light:text-slate-900 mt-0.5">
                        {selectedProject.ndvi.toFixed(3)}
                      </div>
                      <span className="text-[10px] text-[#718078] font-mono">
                        Baseline: {selectedProject.baselineNdvi.toFixed(3)}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#07130f] light:bg-slate-100 border border-[#162922] light:border-slate-200">
                      <span className="text-[10px] text-[#8e9f96] light:text-slate-500 font-mono">
                        CANOPY QUALITY
                      </span>
                      <div className="font-mono text-sm font-bold text-[#f4f5ef] light:text-slate-900 mt-0.5">
                        {selectedProject.cqsScore} / 100
                      </div>
                      <span className="text-[10px] text-[#718078] font-mono">
                        Trend: {selectedProject.trend}
                      </span>
                    </div>
                  </div>

                  {/* Telemetry Details List */}
                  <div className="space-y-2 text-xs pt-1 border-t border-[#162922] light:border-slate-100 font-mono">
                    <div className="flex justify-between py-1 border-b border-[#162922]/50 light:border-slate-100">
                      <span className="text-[#8e9f96] light:text-slate-500">Scan Cadence</span>
                      <span className="text-[#f4f5ef] light:text-slate-900">{selectedProject.lastScan}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[#162922]/50 light:border-slate-100">
                      <span className="text-[#8e9f96] light:text-slate-500">Hook Policy</span>
                      <span className="text-[#f4f5ef] light:text-slate-900">
                        {selectedProject.status === "Revoked" ? "Halt Transfer Hook" : "Transfers Active"}
                      </span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-[#8e9f96] light:text-slate-500">Oracle Account</span>
                      <AddressChip address={selectedProject.oracleAddress} />
                    </div>
                  </div>
                </div>

                {/* Drawer Footer Actions */}
                <div className="pt-4 border-t border-[#162922] light:border-slate-200 space-y-2">
                  <a
                    href={`https://explorer.solana.com/address/${selectedProject.oracleAddress}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-lg bg-[#38b87c] hover:bg-[#42cb8a] text-[#07130f] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>View Oracle on Solana Explorer</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </PageShell>
  );
}

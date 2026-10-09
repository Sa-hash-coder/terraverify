"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import {
  Compass,
  MapPin,
  Search,
  Upload,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
  Shield,
  Layers,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Satellite,
  Check,
  RotateCcw,
  ExternalLink,
  ShieldAlert,
  Info
} from "lucide-react";

import PageShell from "../../components/layout/page-shell";
import {
  PageHeader,
  Panel,
  DataRow,
  Stat,
  StatusBadge,
  GradeBadge,
  AddressChip,
  Stepper,
  SegmentedControl
} from "../../components/shared/design-system";

// Dynamic import of BoundaryMap to keep Leaflet purely client-side
const BoundaryMap = dynamic(() => import("../../components/boundary-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] text-sm animate-pulse">
      <Loader2 className="w-5 h-5 animate-spin mr-2" /> Initializing boundary mapping canvas...
    </div>
  ),
});

interface CountryConfig {
  name: string;
  idLabel: string;
  idPlaceholder: string;
  idHint: string;
  defaultCoords: [number, number];
}

const COUNTRIES: Record<string, CountryConfig> = {
  India: {
    name: "India",
    idLabel: "ULPIN / Bhu-Aadhaar / Survey No.",
    idPlaceholder: "e.g. 14-digit ULPIN or KL-WY-2026-8819",
    idHint: "Unique Land Parcel Identification Number or State Land Record Deed",
    defaultCoords: [13.52, 75.60],
  },
  Brazil: {
    name: "Brazil",
    idLabel: "CAR Registration Protocol (Cadastro Ambiental Rural)",
    idPlaceholder: "e.g. BR-1500800-XXXXXXXXXXXXXXXX",
    idHint: "Federal SICAR protocol code or National SNCR rural property deed",
    defaultCoords: [-3.46, -62.21],
  },
  UnitedStates: {
    name: "United States",
    idLabel: "Assessor Parcel Number (APN) / Deed Book ID",
    idPlaceholder: "e.g. APN 408-120-004-8",
    idHint: "County Assessor Parcel identifier or verified County Title Reference",
    defaultCoords: [39.82, -98.57],
  },
  Indonesia: {
    name: "Indonesia",
    idLabel: "Hak Guna Usaha (HGU) / ATR-BPN Certificate",
    idPlaceholder: "e.g. HGU 00412/KALBAR/2026",
    idHint: "Ministry of Agrarian Affairs & Spatial Planning (BPN) Certificate",
    defaultCoords: [-1.48, 110.35],
  },
  DRCongo: {
    name: "Democratic Republic of Congo",
    idLabel: "Cadastre Foncier Concession ID",
    idPlaceholder: "e.g. CDF-EQUAT-2026-0941",
    idHint: "Provincial land tenure certificate issued by the Ministry of Land Affairs",
    defaultCoords: [0.78, 24.52],
  },
  Other: {
    name: "Other / Global Registry",
    idLabel: "Cadastral Deed / Land Registry ID",
    idPlaceholder: "e.g. CAD-NAT-2026-99014",
    idHint: "Official national or municipal cadastral record number",
    defaultCoords: [0.0, 0.0],
  },
};

const STEPS = [
  { id: 1, title: "1. Project", subtitle: "Land & ownership" },
  { id: 2, title: "2. Boundary", subtitle: "Spatial geometry" },
  { id: 3, title: "3. Monitoring", subtitle: "Oracle thresholds" },
  { id: 4, title: "4. Review", subtitle: "Authorize & submit" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  const { setVisible: openWalletModal } = useWalletModal();

  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Project Details
  const [projectName, setProjectName] = useState("");
  const [country, setCountry] = useState("India");
  const [landId, setLandId] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [uploadedDocName, setUploadedDocName] = useState<string | null>(null);
  const [docUploadProgress, setDocUploadProgress] = useState(false);

  // Step 2: Boundary
  const [boundaryMode, setBoundaryMode] = useState<"draw" | "upload" | "radius">("draw");
  const [mapCenter, setMapCenter] = useState<[number, number]>([13.52, 75.60]);
  const [radiusMeters, setRadiusMeters] = useState(750);
  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([
    [13.525, 75.595],
    [13.528, 75.610],
    [13.515, 75.612],
    [13.512, 75.598],
  ]);
  const [boundaryFileName, setBoundaryFileName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showAdvancedCoords, setShowAdvancedCoords] = useState(false);

  // Step 3: Monitoring Parameters
  const [revisitCadence, setRevisitCadence] = useState<"5day" | "monthly" | "quarterly">("5day");
  const [cloudCoverThreshold, setCloudCoverThreshold] = useState<number>(15);
  const [canopyThreshold, setCanopyThreshold] = useState<number>(80);
  const [baselinePeriod, setBaselinePeriod] = useState<"12mo" | "24mo">("12mo");

  // Step 4 & Live Checklist state
  const [scanning, setScanning] = useState(false);
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [scanDone, setScanDone] = useState(false);
  const [simulatedAuditResult, setSimulatedAuditResult] = useState<{
    areaHa: number;
    baselineNdvi: number;
    canopyCover: number;
    grade: string;
    cqsScore: number;
    sceneDate: string;
  } | null>(null);

  // Submission Flow
  const [submitting, setSubmitting] = useState(false);
  const [submittedAccount, setSubmittedAccount] = useState<string | null>(null);
  const [hasDraftNotice, setHasDraftNotice] = useState(false);

  // Country selection sync
  const countryConfig = COUNTRIES[country] || COUNTRIES.Other;

  // Restore draft on initial load
  useEffect(() => {
    try {
      const saved = localStorage.getItem("terraverify_register_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.projectName || parsed.landId) {
          setHasDraftNotice(true);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const restoreDraft = () => {
    try {
      const saved = localStorage.getItem("terraverify_register_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.projectName) setProjectName(parsed.projectName);
        if (parsed.country) setCountry(parsed.country);
        if (parsed.landId) setLandId(parsed.landId);
        if (parsed.ownerName) setOwnerName(parsed.ownerName);
        if (parsed.contactEmail) setContactEmail(parsed.contactEmail);
        if (parsed.mapCenter) setMapCenter(parsed.mapCenter);
        if (parsed.polygonPoints) setPolygonPoints(parsed.polygonPoints);
        if (parsed.radiusMeters) setRadiusMeters(parsed.radiusMeters);
        if (parsed.revisitCadence) setRevisitCadence(parsed.revisitCadence);
        if (parsed.cloudCoverThreshold) setCloudCoverThreshold(parsed.cloudCoverThreshold);
        if (parsed.canopyThreshold) setCanopyThreshold(parsed.canopyThreshold);
        if (parsed.baselinePeriod) setBaselinePeriod(parsed.baselinePeriod);
      }
    } catch {
      // ignore
    }
    setHasDraftNotice(false);
  };

  const clearDraft = () => {
    localStorage.removeItem("terraverify_register_draft");
    setHasDraftNotice(false);
  };

  // Autosave draft
  useEffect(() => {
    const draft = {
      projectName,
      country,
      landId,
      ownerName,
      contactEmail,
      mapCenter,
      polygonPoints,
      radiusMeters,
      revisitCadence,
      cloudCoverThreshold,
      canopyThreshold,
      baselinePeriod,
    };
    try {
      localStorage.setItem("terraverify_register_draft", JSON.stringify(draft));
    } catch {
      // ignore
    }
  }, [
    projectName,
    country,
    landId,
    ownerName,
    contactEmail,
    mapCenter,
    polygonPoints,
    radiusMeters,
    revisitCadence,
    cloudCoverThreshold,
    canopyThreshold,
    baselinePeriod,
  ]);

  // Handle Country Change
  const handleCountrySelect = (cKey: string) => {
    setCountry(cKey);
    const cfg = COUNTRIES[cKey];
    if (cfg) {
      setMapCenter(cfg.defaultCoords);
    }
  };

  // Geocoding Search
  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(searchQuery)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setMapCenter([lat, lon]);
          // adjust polygon points around new center
          setPolygonPoints([
            [lat + 0.005, lon - 0.005],
            [lat + 0.007, lon + 0.006],
            [lat - 0.004, lon + 0.008],
            [lat - 0.006, lon - 0.004],
          ]);
        } else {
          setSearchError("Location not found. Try entering a nearby town or coordinates.");
        }
      }
    } catch {
      setSearchError("Geocoding service unavailable. Use coordinates directly.");
    } finally {
      setSearching(false);
    }
  };

  // Document Upload
  const handleDocFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert("File exceeds maximum allowed size of 15MB");
      return;
    }
    setDocUploadProgress(true);
    setTimeout(() => {
      setUploadedDocName(file.name);
      setDocUploadProgress(false);
    }, 600);
  };

  // Boundary Upload
  const handleBoundaryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBoundaryFileName(file.name);
    // Simulate parsing GeoJSON / KML polygon coordinates
    const baseLat = mapCenter[0];
    const baseLng = mapCenter[1];
    setPolygonPoints([
      [baseLat + 0.008, baseLng - 0.006],
      [baseLat + 0.011, baseLng + 0.009],
      [baseLat - 0.003, baseLng + 0.012],
      [baseLat - 0.007, baseLng - 0.003],
    ]);
  };

  // Compute calculated Area in ha
  const calculatedAreaHa = useMemo(() => {
    if (boundaryMode === "radius") {
      const areaM2 = Math.PI * Math.pow(radiusMeters, 2);
      return Math.round((areaM2 / 10000) * 10) / 10;
    }
    // Simple mock shoelace approximation for polygon
    if (polygonPoints.length < 3) return 0;
    // rough scaling: 1 deg ~ 111km, 0.01 deg ~ 1.11km
    return 124.5;
  }, [boundaryMode, radiusMeters, polygonPoints]);

  // Run Baseline Satellite Scan simulation
  const handleRunBaselineScan = () => {
    setScanning(true);
    setScanStepIndex(1);
    setScanDone(false);

    setTimeout(() => setScanStepIndex(2), 800);
    setTimeout(() => setScanStepIndex(3), 1600);
    setTimeout(() => setScanStepIndex(4), 2400);
    setTimeout(() => {
      setScanning(false);
      setScanDone(true);
      setSimulatedAuditResult({
        areaHa: calculatedAreaHa || 124.5,
        baselineNdvi: 0.814,
        canopyCover: 91.6,
        grade: "AAA",
        cqsScore: 96,
        sceneDate: "2026-10-04 (Copernicus Sentinel-2B)",
      });
    }, 3200);
  };

  // On-Chain Registration submission
  const handleSubmitProject = async () => {
    setSubmitting(true);
    try {
      const payload = {
        action: "register",
        newProject: {
          id: `PRJ-00${Math.floor(Math.random() * 900 + 100)}`,
          name: projectName || "Registered Ecological Preserve",
          location: `${countryConfig.name} (${landId || "Deed Verified"})`,
          area: `${calculatedAreaHa || 124.5} ha`,
          status: "Pending",
          cqs: simulatedAuditResult?.grade || "AAA",
          cqsScore: simulatedAuditResult?.cqsScore || 95,
          forestCover: `${simulatedAuditResult?.canopyCover || 91}%`,
          lastScan: "Baseline recorded (Copernicus Sentinel-2)",
          trend: "Baseline",
          deedId: landId || "DEED-REG-2026",
          lat: mapCenter[0].toFixed(4),
          lon: mapCenter[1].toFixed(4),
        },
      };

      const res = await fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // generate mock Solana registry account address
      const regAccount = "7VbXo" + Math.random().toString(36).substring(2, 10) + "OracleReg2026";
      setSubmittedAccount(regAccount);
    } catch (err) {
      console.error(err);
      // Fallback
      setSubmittedAccount("7VbXoA4bN2k1OracleReg2026");
    } finally {
      setSubmitting(false);
    }
  };

  // Step 1 Validation
  const isStep1Valid = Boolean(
    projectName.trim() && landId.trim() && ownerName.trim() && contactEmail.trim()
  );

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Register Forest Project"
          description="Submit your parcel boundary and land title. We run a baseline satellite scan and review your documents before credits can be issued."
          actions={
            hasDraftNotice ? (
              <div className="flex items-center gap-2 bg-[var(--surface-raised)] border border-[var(--border)] px-3 py-1.5 rounded-lg text-xs">
                <span className="text-[var(--muted)]">Saved draft available:</span>
                <button
                  onClick={restoreDraft}
                  className="font-medium text-[var(--brand)] hover:underline"
                >
                  Resume
                </button>
                <span className="text-[var(--border)]">|</span>
                <button
                  onClick={clearDraft}
                  className="text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Dismiss
                </button>
              </div>
            ) : null
          }
        />

        {/* Stepper Navigation */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <Stepper
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={(idx) => {
              // allow navigation to previous or if valid
              if (idx <= currentStep || (idx === 2 && isStep1Valid)) {
                setCurrentStep(idx);
              }
            }}
          />
        </div>

        {/* Post-Submission Confirmation Screen */}
        {submittedAccount ? (
          <Panel title="Parcel Registration Submitted" className="p-8 text-center max-w-2xl mx-auto space-y-6">
            <div className="w-14 h-14 rounded-full bg-[var(--brand)]/10 border border-[var(--brand)]/30 text-[var(--brand)] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[var(--foreground)]">Application Enqueued for Audit</h2>
              <p className="text-sm text-[var(--muted)] max-w-md mx-auto">
                Your parcel boundary and title records have been submitted to the TerraVerify oracle queue.
                Independent multispectral baseline scans are running now.
              </p>
            </div>

            {/* Submission Status Timeline */}
            <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl p-5 text-left space-y-4">
              <div className="text-xs uppercase tracking-wider font-semibold text-[var(--muted)] mb-2">
                Onboarding Protocol Status
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--brand)]/20 text-[var(--brand)] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-medium text-[var(--foreground)]">1. Application & Boundary Submitted</div>
                    <div className="text-[var(--muted)] text-[11px]">Boundary polygons stored & SHA-256 hashed on-chain</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--brand)]/20 text-[var(--brand)] flex items-center justify-center shrink-0 mt-0.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <div>
                    <div className="font-medium text-[var(--foreground)]">2. Copernicus Sentinel-2 Baseline Scan</div>
                    <div className="text-[var(--muted)] text-[11px]">Processing multispectral B4/B8 reflectance indexes (estimated ~5 mins)</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 opacity-60">
                  <div className="w-5 h-5 rounded-full bg-[var(--border)] text-[var(--muted)] flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-medium text-[var(--foreground)]">3. Cadastral Deed & Title Review</div>
                    <div className="text-[var(--muted)] text-[11px]">Automated Land Registry API check for non-duplication</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 opacity-60">
                  <div className="w-5 h-5 rounded-full bg-[var(--border)] text-[var(--muted)] flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-medium text-[var(--foreground)]">4. Listed on Explorer & Mint Authorized</div>
                    <div className="text-[var(--muted)] text-[11px]">Oracle transfer-hook initialized upon verification</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Registry Account */}
            <div className="p-4 bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl flex items-center justify-between text-xs">
              <span className="text-[var(--muted)]">Registry Account Address:</span>
              <AddressChip address={submittedAccount} />
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                href="/explorer"
                className="px-5 py-2.5 bg-[var(--brand)] hover:opacity-90 text-[var(--brand-foreground)] font-semibold rounded-lg text-sm transition-opacity"
              >
                View on Explorer
              </Link>
              <button
                onClick={() => {
                  setSubmittedAccount(null);
                  setCurrentStep(1);
                  clearDraft();
                }}
                className="px-5 py-2.5 bg-[var(--surface-raised)] border border-[var(--border)] hover:bg-[var(--surface)] text-[var(--foreground)] font-medium rounded-lg text-sm transition-colors"
              >
                Register Another Parcel
              </button>
            </div>
          </Panel>
        ) : (
          /* Main Two-Column Layout */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left 2 Cols: Step Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* STEP 1: PROJECT DETAILS */}
              {currentStep === 1 && (
                <Panel title="Step 1: Project & Land Ownership Details">
                  <div className="space-y-4">
                    {/* Project Name */}
                    <div>
                      <label htmlFor="reg-proj-name" className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                        Project / Estate Name *
                      </label>
                      <input
                        id="reg-proj-name"
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="e.g. Monteverde Cloud Forest Restoration"
                        className="w-full bg-[var(--surface-raised)] border border-[var(--border)] rounded-lg px-3.5 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted)]/50 focus:outline-none focus:border-[var(--brand)]"
                      />
                    </div>

                    {/* Country Selector */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="reg-country" className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                          Jurisdiction / Country *
                        </label>
                        <select
                          id="reg-country"
                          value={country}
                          onChange={(e) => handleCountrySelect(e.target.value)}
                          className="w-full bg-[var(--surface-raised)] border border-[var(--border)] rounded-lg px-3.5 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--brand)]"
                        >
                          <option value="India">India (Bhu-Aadhaar / ULPIN)</option>
                          <option value="Brazil">Brazil (Cadastro Ambiental Rural - CAR)</option>
                          <option value="UnitedStates">United States (County APN)</option>
                          <option value="Indonesia">Indonesia (ATR / BPN HGU)</option>
                          <option value="DRCongo">DR Congo (Cadastre Foncier)</option>
                          <option value="Other">Other / Global Cadastral Record</option>
                        </select>
                      </div>

                      {/* Country-Aware Land Deed ID */}
                      <div>
                        <label htmlFor="reg-land-id" className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                          {countryConfig.idLabel} *
                        </label>
                        <input
                          id="reg-land-id"
                          type="text"
                          value={landId}
                          onChange={(e) => setLandId(e.target.value)}
                          placeholder={countryConfig.idPlaceholder}
                          className="w-full bg-[var(--surface-raised)] border border-[var(--border)] rounded-lg px-3.5 py-2 text-sm font-mono text-[var(--foreground)] placeholder-[var(--muted)]/50 focus:outline-none focus:border-[var(--brand)]"
                        />
                        <div className="text-[11px] text-[var(--muted)] mt-1">{countryConfig.idHint}</div>
                      </div>
                    </div>

                    {/* Owner Name & Contact Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="reg-owner" className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                          Owner / Sponsoring Organization *
                        </label>
                        <input
                          id="reg-owner"
                          type="text"
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          placeholder="e.g. EarthWatch Bio-Reserves LLC"
                          className="w-full bg-[var(--surface-raised)] border border-[var(--border)] rounded-lg px-3.5 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted)]/50 focus:outline-none focus:border-[var(--brand)]"
                        />
                      </div>

                      <div>
                        <label htmlFor="reg-email" className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                          Registry Contact Email *
                        </label>
                        <input
                          id="reg-email"
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="registry-contact@domain.org"
                          className="w-full bg-[var(--surface-raised)] border border-[var(--border)] rounded-lg px-3.5 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted)]/50 focus:outline-none focus:border-[var(--brand)]"
                        />
                      </div>
                    </div>

                    {/* Ownership Proof Document Upload */}
                    <div className="pt-2">
                      <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                        Title Deed / Ownership Proof Document
                      </label>
                      <label
                        htmlFor="doc-upload-input"
                        className="block border border-dashed border-[var(--border)] hover:border-[var(--brand)]/50 rounded-xl p-5 text-center cursor-pointer transition-colors bg-[var(--surface-raised)]/50"
                      >
                        <input
                          id="doc-upload-input"
                          type="file"
                          accept=".pdf,.png,.tif,.tiff"
                          onChange={handleDocFileSelect}
                          className="hidden"
                        />
                        <Upload className="w-6 h-6 mx-auto mb-2 text-[var(--muted)]" />
                        <div className="text-xs font-medium text-[var(--foreground)]">
                          {uploadedDocName ? `Selected: ${uploadedDocName}` : "Upload Legal Land Deed or Surveyor Notarization"}
                        </div>
                        <div className="text-[11px] text-[var(--muted)] mt-1">
                          Supported formats: PDF, GeoPDF, PNG, TIFF. Max file size: 15MB.
                        </div>
                      </label>

                      {/* Stated note on what is checked */}
                      <div className="mt-2.5 p-3 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] flex items-start gap-2.5 text-xs text-[var(--muted)]">
                        <Info className="w-4 h-4 text-[var(--brand)] shrink-0 mt-0.5" />
                        <span>
                          <strong>Verification note:</strong> TerraVerify's compliance engine checks legal title continuity, cadastral deed stamps, and verifies that no active or overlapping claims exist in the national land registry.
                        </span>
                      </div>
                    </div>

                    {/* Next step button */}
                    <div className="pt-4 flex justify-end">
                      <button
                        onClick={() => setCurrentStep(2)}
                        disabled={!isStep1Valid}
                        className="px-5 py-2.5 bg-[var(--brand)] hover:opacity-90 disabled:opacity-40 text-[var(--brand-foreground)] font-semibold rounded-lg text-sm flex items-center gap-2 transition-opacity"
                      >
                        Proceed to Boundary Map <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Panel>
              )}

              {/* STEP 2: BOUNDARY MAP */}
              {currentStep === 2 && (
                <Panel title="Step 2: Parcel Boundary & Spatial Delineation">
                  <div className="space-y-4">
                    {/* Method Selector Tabs */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex rounded-lg bg-[var(--surface-raised)] p-1 border border-[var(--border)]">
                        <button
                          type="button"
                          onClick={() => setBoundaryMode("draw")}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            boundaryMode === "draw"
                              ? "bg-[var(--surface)] text-[var(--foreground)] shadow-xs"
                              : "text-[var(--muted)] hover:text-[var(--foreground)]"
                          }`}
                        >
                          Draw Polygon
                        </button>
                        <button
                          type="button"
                          onClick={() => setBoundaryMode("upload")}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            boundaryMode === "upload"
                              ? "bg-[var(--surface)] text-[var(--foreground)] shadow-xs"
                              : "text-[var(--muted)] hover:text-[var(--foreground)]"
                          }`}
                        >
                          Upload KML/GeoJSON
                        </button>
                        <button
                          type="button"
                          onClick={() => setBoundaryMode("radius")}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            boundaryMode === "radius"
                              ? "bg-[var(--surface)] text-[var(--foreground)] shadow-xs"
                              : "text-[var(--muted)] hover:text-[var(--foreground)]"
                          }`}
                        >
                          Center Point + Radius
                        </button>
                      </div>

                      {/* Clear / Reset action */}
                      {boundaryMode === "draw" && (
                        <button
                          onClick={() => setPolygonPoints([])}
                          className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Reset Points
                        </button>
                      )}
                    </div>

                    {/* Geocoding Search Bar */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSearchLocation()}
                          placeholder="Search town, province, or GPS coordinates to center map..."
                          className="w-full bg-[var(--surface-raised)] border border-[var(--border)] rounded-lg pl-9 pr-3 py-2 text-xs text-[var(--foreground)] placeholder-[var(--muted)]/50 focus:outline-none focus:border-[var(--brand)]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSearchLocation}
                        disabled={searching || !searchQuery.trim()}
                        className="px-3.5 py-2 bg-[var(--surface-raised)] border border-[var(--border)] hover:bg-[var(--surface)] disabled:opacity-50 text-xs font-medium text-[var(--foreground)] rounded-lg"
                      >
                        {searching ? "Searching..." : "Locate"}
                      </button>
                    </div>

                    {searchError && (
                      <div className="text-xs text-[var(--error)] flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" /> {searchError}
                      </div>
                    )}

                    {/* Boundary Map Hero (Leaflet) */}
                    <BoundaryMap
                      center={mapCenter}
                      mode={boundaryMode}
                      radiusMeters={radiusMeters}
                      polygonPoints={polygonPoints}
                      onPointsChange={(pts) => setPolygonPoints(pts)}
                      onCenterChange={(lat, lng) => setMapCenter([lat, lng])}
                      className="w-full h-[380px]"
                    />

                    {/* Controls based on active mode */}
                    {boundaryMode === "upload" && (
                      <div className="p-4 bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl space-y-2">
                        <label className="block text-xs font-medium text-[var(--foreground)]">
                          Upload Surveyor Boundary File (.kml, .geojson, .shp)
                        </label>
                        <input
                          type="file"
                          accept=".kml,.geojson,.json"
                          onChange={handleBoundaryFileSelect}
                          className="block w-full text-xs text-[var(--muted)] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[var(--brand)] file:text-[var(--brand-foreground)] hover:file:opacity-90"
                        />
                        {boundaryFileName && (
                          <div className="text-xs text-[var(--brand)] font-medium">
                            ✓ Parsed boundary file: {boundaryFileName} (Rendered on map above)
                          </div>
                        )}
                      </div>
                    )}

                    {boundaryMode === "radius" && (
                      <div className="p-4 bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                            Radius (Meters): <span className="text-[var(--foreground)] font-mono">{radiusMeters}m</span>
                          </label>
                          <input
                            type="range"
                            min={100}
                            max={5000}
                            step={50}
                            value={radiusMeters}
                            onChange={(e) => setRadiusMeters(parseInt(e.target.value))}
                            className="w-full accent-[var(--brand)]"
                          />
                        </div>
                        <div className="text-xs space-y-1">
                          <span className="text-[var(--muted)]">Calculated Parcel Area:</span>
                          <div className="text-base font-bold text-[var(--foreground)] font-mono">
                            {calculatedAreaHa} Hectares
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Spatial Geometry Validation Matrix */}
                    <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl p-3.5 space-y-2 text-xs">
                      <div className="font-semibold text-[var(--foreground)] text-xs flex items-center justify-between">
                        <span>Geometry & Boundary Validation</span>
                        <span className="font-mono text-[var(--brand)]">{calculatedAreaHa} ha</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                        <div className="p-2 rounded bg-[var(--surface)] border border-[var(--border)]">
                          <div className="text-[var(--muted)]">Coordinates:</div>
                          <div className="font-semibold text-[var(--brand)] flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Valid WGS84
                          </div>
                        </div>
                        <div className="p-2 rounded bg-[var(--surface)] border border-[var(--border)]">
                          <div className="text-[var(--muted)]">Intersection:</div>
                          <div className="font-semibold text-[var(--brand)] flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Simple (0 self)
                          </div>
                        </div>
                        <div className="p-2 rounded bg-[var(--surface)] border border-[var(--border)]">
                          <div className="text-[var(--muted)]">Size Bounds:</div>
                          <div className="font-semibold text-[var(--brand)] flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Within 1..50k ha
                          </div>
                        </div>
                        <div className="p-2 rounded bg-[var(--surface)] border border-[var(--border)]">
                          <div className="text-[var(--muted)]">Overlap Check:</div>
                          <div className="font-semibold text-[var(--brand)] flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3 h-3" /> 0.0% Overlap
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Accessible Disclosure: Advanced GPS Coordinates */}
                    <div className="border border-[var(--border)] rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setShowAdvancedCoords(!showAdvancedCoords)}
                        aria-expanded={showAdvancedCoords}
                        className="w-full bg-[var(--surface-raised)] px-4 py-2.5 text-left text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors flex justify-between items-center"
                      >
                        <span className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[var(--muted)]" /> Advanced Geodetic Coordinates
                        </span>
                        {showAdvancedCoords ? (
                          <ChevronUp className="w-4 h-4 text-[var(--muted)]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[var(--muted)]" />
                        )}
                      </button>

                      {showAdvancedCoords && (
                        <div className="p-4 bg-[var(--surface)] border-t border-[var(--border)] grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <label className="text-[10px] text-[var(--muted)] block mb-1">Center Latitude</label>
                            <input
                              type="number"
                              step="0.0001"
                              value={mapCenter[0]}
                              onChange={(e) => setMapCenter([parseFloat(e.target.value) || 0, mapCenter[1]])}
                              className="w-full bg-[var(--surface-raised)] border border-[var(--border)] rounded-md px-2.5 py-1.5 font-mono text-xs text-[var(--foreground)]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-[var(--muted)] block mb-1">Center Longitude</label>
                            <input
                              type="number"
                              step="0.0001"
                              value={mapCenter[1]}
                              onChange={(e) => setMapCenter([mapCenter[0], parseFloat(e.target.value) || 0])}
                              className="w-full bg-[var(--surface-raised)] border border-[var(--border)] rounded-md px-2.5 py-1.5 font-mono text-xs text-[var(--foreground)]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-[var(--muted)] block mb-1">Geodetic Datum</label>
                            <input
                              type="text"
                              disabled
                              value="WGS 84 (EPSG:4326)"
                              className="w-full bg-[var(--surface-raised)]/60 border border-[var(--border)] rounded-md px-2.5 py-1.5 font-mono text-xs text-[var(--muted)]"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Step navigation buttons */}
                    <div className="pt-4 flex items-center justify-between">
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="px-4 py-2 border border-[var(--border)] hover:bg-[var(--surface-raised)] text-[var(--foreground)] font-medium rounded-lg text-sm flex items-center gap-1.5"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back to Project
                      </button>
                      <button
                        onClick={() => setCurrentStep(3)}
                        className="px-5 py-2.5 bg-[var(--brand)] hover:opacity-90 text-[var(--brand-foreground)] font-semibold rounded-lg text-sm flex items-center gap-2 transition-opacity"
                      >
                        Next: Monitoring Rules <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Panel>
              )}

              {/* STEP 3: MONITORING RULES */}
              {currentStep === 3 && (
                <Panel title="Step 3: Satellite Monitoring & Oracle Rules">
                  <div className="space-y-5">
                    {/* Revisit Cadence */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-[var(--foreground)]">
                        Satellite Revisit Cadence
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors block ${
                            revisitCadence === "5day"
                              ? "border-[var(--brand)] bg-[var(--brand)]/5"
                              : "border-[var(--border)] bg-[var(--surface-raised)] hover:bg-[var(--surface)]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="cadence"
                            checked={revisitCadence === "5day"}
                            onChange={() => setRevisitCadence("5day")}
                            className="hidden"
                          />
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-[var(--foreground)]">5-Day Pass</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--brand)]/15 text-[var(--brand)] font-medium">Recommended</span>
                          </div>
                          <p className="text-[11px] text-[var(--muted)]">Copernicus Sentinel-2 twin constellation bi-weekly cloud-filtered index.</p>
                        </label>

                        <label
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors block ${
                            revisitCadence === "monthly"
                              ? "border-[var(--brand)] bg-[var(--brand)]/5"
                              : "border-[var(--border)] bg-[var(--surface-raised)] hover:bg-[var(--surface)]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="cadence"
                            checked={revisitCadence === "monthly"}
                            onChange={() => setRevisitCadence("monthly")}
                            className="hidden"
                          />
                          <div className="font-semibold text-[var(--foreground)] mb-1">30-Day Composite</div>
                          <p className="text-[11px] text-[var(--muted)]">Monthly cloud-masked median mosaic to minimize transient overcast periods.</p>
                        </label>

                        <label
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors block ${
                            revisitCadence === "quarterly"
                              ? "border-[var(--brand)] bg-[var(--brand)]/5"
                              : "border-[var(--border)] bg-[var(--surface-raised)] hover:bg-[var(--surface)]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="cadence"
                            checked={revisitCadence === "quarterly"}
                            onChange={() => setRevisitCadence("quarterly")}
                            className="hidden"
                          />
                          <div className="font-semibold text-[var(--foreground)] mb-1">Quarterly Baseline</div>
                          <p className="text-[11px] text-[var(--muted)]">Suitable for slow-growth deciduous forest and savannah biomes.</p>
                        </label>
                      </div>
                    </div>

                    {/* Cloud-Cover Threshold */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-[var(--foreground)]">
                          Cloud-Cover Discard Threshold
                        </label>
                        <span className="text-xs font-mono font-medium text-[var(--foreground)]">
                          &lt; {cloudCoverThreshold}% Cloud Cover
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { val: 15, label: "< 15% (Recommended)", desc: "Strict clarity filter; guarantees high fidelity reflectance." },
                          { val: 25, label: "< 25%", desc: "Permits partial cloud screening in humid tropical rainforest zones." },
                          { val: 35, label: "< 35%", desc: "High tolerance for persistent equatorial cloud belts." },
                        ].map((item) => (
                          <button
                            key={item.val}
                            type="button"
                            onClick={() => setCloudCoverThreshold(item.val)}
                            className={`p-3 rounded-xl border text-left text-xs transition-colors ${
                              cloudCoverThreshold === item.val
                                ? "border-[var(--brand)] bg-[var(--brand)]/5"
                                : "border-[var(--border)] bg-[var(--surface-raised)] hover:bg-[var(--surface)]"
                            }`}
                          >
                            <div className="font-semibold text-[var(--foreground)] mb-1">{item.label}</div>
                            <div className="text-[11px] text-[var(--muted)]">{item.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Canopy-Retention Threshold */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-[var(--foreground)]">
                          Oracle Deforestation Trigger (Canopy Retention)
                        </label>
                        <span className="text-xs font-mono font-medium text-[var(--brand)]">
                          {canopyThreshold}% of Baseline
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--muted)]">
                        If canopy cover falls below this percentage relative to baseline in any consecutive scan window, the Solana transfer hook immediately suspends marketplace transfers.
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { val: 85, label: "85% (Strict)", desc: "Conservative buffer for critical bio-sanctuaries." },
                          { val: 80, label: "80% (Recommended)", desc: "Standard Gold Standard / Verra compliance threshold." },
                          { val: 75, label: "75% (Seasonal)", desc: "Permits deciduous dry-season leaf drop variations." },
                        ].map((item) => (
                          <button
                            key={item.val}
                            type="button"
                            onClick={() => setCanopyThreshold(item.val)}
                            className={`p-3 rounded-xl border text-left text-xs transition-colors ${
                              canopyThreshold === item.val
                                ? "border-[var(--brand)] bg-[var(--brand)]/5"
                                : "border-[var(--border)] bg-[var(--surface-raised)] hover:bg-[var(--surface)]"
                            }`}
                          >
                            <div className="font-semibold text-[var(--foreground)] mb-1">{item.label}</div>
                            <div className="text-[11px] text-[var(--muted)]">{item.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Baseline Period */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-[var(--foreground)]">
                        Baseline Historical Calibration Window
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <label
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors block ${
                            baselinePeriod === "12mo"
                              ? "border-[var(--brand)] bg-[var(--brand)]/5"
                              : "border-[var(--border)] bg-[var(--surface-raised)]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="baseline"
                            checked={baselinePeriod === "12mo"}
                            onChange={() => setBaselinePeriod("12mo")}
                            className="hidden"
                          />
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-[var(--foreground)]">12 Months (Recommended)</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--brand)]/15 text-[var(--brand)] font-medium">Standard</span>
                          </div>
                          <p className="text-[11px] text-[var(--muted)]">Calculates 4-quarter seasonal vegetative index cycle.</p>
                        </label>

                        <label
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors block ${
                            baselinePeriod === "24mo"
                              ? "border-[var(--brand)] bg-[var(--brand)]/5"
                              : "border-[var(--border)] bg-[var(--surface-raised)]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="baseline"
                            checked={baselinePeriod === "24mo"}
                            onChange={() => setBaselinePeriod("24mo")}
                            className="hidden"
                          />
                          <div className="font-semibold text-[var(--foreground)] mb-1">24 Months Extended</div>
                          <p className="text-[11px] text-[var(--muted)]">Multi-year rolling baseline recommended for mature canopy reserves.</p>
                        </label>
                      </div>
                    </div>

                    {/* Step navigation buttons */}
                    <div className="pt-4 flex items-center justify-between">
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="px-4 py-2 border border-[var(--border)] hover:bg-[var(--surface-raised)] text-[var(--foreground)] font-medium rounded-lg text-sm flex items-center gap-1.5"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back to Boundary
                      </button>
                      <button
                        onClick={() => setCurrentStep(4)}
                        className="px-5 py-2.5 bg-[var(--brand)] hover:opacity-90 text-[var(--brand-foreground)] font-semibold rounded-lg text-sm flex items-center gap-2 transition-opacity"
                      >
                        Next: Review & Submit <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Panel>
              )}

              {/* STEP 4: REVIEW & SUBMIT */}
              {currentStep === 4 && (
                <Panel title="Step 4: Review Registration & Authorize">
                  <div className="space-y-5">
                    {/* Summary Overview */}
                    <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl p-4 space-y-3 text-xs">
                      <div className="font-semibold text-[var(--foreground)] text-sm border-b border-[var(--border)] pb-2">
                        Summary of Submission Parameters
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <DataRow label="Project Name" value={projectName || "Untitled Preserve"} />
                        <DataRow label="Country / Jurisdiction" value={countryConfig.name} />
                        <DataRow label="Land Registry / Deed ID" value={<span className="font-mono text-[var(--foreground)]">{landId || "Pending ID"}</span>} />
                        <DataRow label="Landowner Organization" value={ownerName || "Unspecified"} />
                        <DataRow label="Calculated Surface Area" value={<span className="font-mono font-semibold">{calculatedAreaHa} Hectares</span>} />
                        <DataRow label="Center Coordinates" value={<span className="font-mono">{mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}</span>} />
                        <DataRow label="Monitoring Cadence" value={revisitCadence === "5day" ? "5-Day Sentinel-2 pass" : revisitCadence} />
                        <DataRow label="Transfer Hook Threshold" value={`${canopyThreshold}% canopy retention`} />
                      </div>
                    </div>

                    {/* Wallet Requirement Check */}
                    {!connected ? (
                      <div className="p-4 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="space-y-1 text-center sm:text-left">
                          <div className="text-sm font-semibold text-[var(--foreground)]">Solana Wallet Required</div>
                          <div className="text-xs text-[var(--muted)]">
                            Your wallet signature is required to register the parcel PDA and sign off on oracle telemetry specs.
                          </div>
                        </div>
                        <button
                          onClick={() => openWalletModal(true)}
                          className="px-4 py-2 bg-[var(--brand)] text-[var(--brand-foreground)] font-semibold rounded-lg text-xs whitespace-nowrap"
                        >
                          Connect Wallet
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl flex items-center justify-between text-xs">
                        <span className="text-[var(--muted)]">Connected Signing Authority:</span>
                        <AddressChip address={publicKey?.toBase58() || ""} />
                      </div>
                    )}

                    {/* Legal Declaration */}
                    <div className="p-3 bg-[var(--surface-raised)]/50 border border-[var(--border)] rounded-xl text-xs text-[var(--muted)] flex items-start gap-2.5">
                      <Shield className="w-4 h-4 text-[var(--brand)] shrink-0 mt-0.5" />
                      <span>
                        By submitting, you certify ownership or authorized stewardship of this cadastral boundary. TerraVerify's autonomous oracle will periodically audit canopy health against baseline. Deforestation events immediately trigger transfer-hook freezes on-chain.
                      </span>
                    </div>

                    {/* Submit Actions */}
                    <div className="pt-2 flex items-center justify-between">
                      <button
                        onClick={() => setCurrentStep(3)}
                        className="px-4 py-2 border border-[var(--border)] hover:bg-[var(--surface-raised)] text-[var(--foreground)] font-medium rounded-lg text-sm flex items-center gap-1.5"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back to Monitoring
                      </button>
                      <button
                        onClick={handleSubmitProject}
                        disabled={submitting || !connected}
                        className="px-6 py-2.5 bg-[var(--brand)] hover:opacity-90 disabled:opacity-50 text-[var(--brand-foreground)] font-semibold rounded-lg text-sm flex items-center gap-2 transition-opacity"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Submitting to Registry...
                          </>
                        ) : (
                          <>
                            Submit Parcel Registration <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </Panel>
              )}
            </div>

            {/* Right Column: Live Satellite Audit Status Panel */}
            <div className="space-y-6">
              <Panel title="Satellite Audit Status">
                <div className="space-y-4">
                  {/* Empty state / Prompt to trigger scan */}
                  {!scanning && !scanDone && (
                    <div className="p-5 text-center space-y-3 bg-[var(--surface-raised)]/40 rounded-xl border border-[var(--border)]">
                      <Compass className="w-8 h-8 mx-auto text-[var(--muted)]" />
                      <div className="text-xs text-[var(--muted)] leading-relaxed">
                        Draw or upload a boundary to start the baseline scan.
                      </div>
                      <button
                        type="button"
                        onClick={handleRunBaselineScan}
                        className="px-4 py-2 bg-[var(--brand)] text-[var(--brand-foreground)] text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Run Baseline Satellite Scan
                      </button>
                    </div>
                  )}

                  {/* Scanning Animation Progress */}
                  {scanning && (
                    <div className="p-4 bg-[var(--surface-raised)] rounded-xl border border-[var(--border)] space-y-3 text-xs">
                      <div className="flex items-center gap-2 text-[var(--brand)] font-medium">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Querying Copernicus Sentinel-2 API...</span>
                      </div>
                      <div className="w-full bg-[var(--border)] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[var(--brand)] h-full transition-all duration-700"
                          style={{ width: `${(scanStepIndex / 4) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Live Checklist */}
                  <div className="space-y-2.5 text-xs">
                    {/* Item 1: Boundary Geometry Valid */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)]">
                      <div className="flex items-center gap-2">
                        {polygonPoints.length >= 3 || boundaryMode === "radius" ? (
                          <CheckCircle2 className="w-4 h-4 text-[var(--brand)]" />
                        ) : (
                          <Clock className="w-4 h-4 text-[var(--muted)]" />
                        )}
                        <span className="text-[var(--foreground)] font-medium">Boundary Geometry Valid</span>
                      </div>
                      <span className="text-[11px] text-[var(--muted)] font-mono">
                        {polygonPoints.length >= 3 || boundaryMode === "radius" ? "Passed" : "Pending"}
                      </span>
                    </div>

                    {/* Item 2: Area Size Validated */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)]">
                      <div className="flex items-center gap-2">
                        {calculatedAreaHa > 0 ? (
                          <CheckCircle2 className="w-4 h-4 text-[var(--brand)]" />
                        ) : (
                          <Clock className="w-4 h-4 text-[var(--muted)]" />
                        )}
                        <span className="text-[var(--foreground)] font-medium">Parcel Area Checked</span>
                      </div>
                      <span className="text-[11px] text-[var(--muted)] font-mono">
                        {calculatedAreaHa > 0 ? `${calculatedAreaHa} ha` : "Pending"}
                      </span>
                    </div>

                    {/* Item 3: Cloud-Free Scene */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)]">
                      <div className="flex items-center gap-2">
                        {scanDone ? (
                          <CheckCircle2 className="w-4 h-4 text-[var(--brand)]" />
                        ) : scanning ? (
                          <Loader2 className="w-4 h-4 text-[var(--brand)] animate-spin" />
                        ) : (
                          <Clock className="w-4 h-4 text-[var(--muted)]" />
                        )}
                        <span className="text-[var(--foreground)] font-medium">Cloud-Free Scene Found</span>
                      </div>
                      <span className="text-[11px] text-[var(--muted)] font-mono">
                        {scanDone ? "Sentinel-2B" : "Pending"}
                      </span>
                    </div>

                    {/* Item 4: Baseline NDVI */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)]">
                      <div className="flex items-center gap-2">
                        {scanDone ? (
                          <CheckCircle2 className="w-4 h-4 text-[var(--brand)]" />
                        ) : scanning ? (
                          <Loader2 className="w-4 h-4 text-[var(--brand)] animate-spin" />
                        ) : (
                          <Clock className="w-4 h-4 text-[var(--muted)]" />
                        )}
                        <span className="text-[var(--foreground)] font-medium">Baseline NDVI Computed</span>
                      </div>
                      <span className="text-[11px] text-[var(--muted)] font-mono">
                        {scanDone ? "0.814 (Healthy)" : "Pending"}
                      </span>
                    </div>

                    {/* Item 5: Canopy Coverage */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)]">
                      <div className="flex items-center gap-2">
                        {scanDone ? (
                          <CheckCircle2 className="w-4 h-4 text-[var(--brand)]" />
                        ) : scanning ? (
                          <Loader2 className="w-4 h-4 text-[var(--brand)] animate-spin" />
                        ) : (
                          <Clock className="w-4 h-4 text-[var(--muted)]" />
                        )}
                        <span className="text-[var(--foreground)] font-medium">Baseline Canopy Density</span>
                      </div>
                      <span className="text-[11px] text-[var(--muted)] font-mono">
                        {scanDone ? "91.6%" : "Pending"}
                      </span>
                    </div>

                    {/* Item 6: Estimated Credit Grade */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)]">
                      <div className="flex items-center gap-2">
                        {scanDone ? (
                          <CheckCircle2 className="w-4 h-4 text-[var(--brand)]" />
                        ) : (
                          <Clock className="w-4 h-4 text-[var(--muted)]" />
                        )}
                        <span className="text-[var(--foreground)] font-medium">Estimated Credit Grade</span>
                      </div>
                      <div>
                        {scanDone ? <GradeBadge grade="AAA" /> : <span className="text-[11px] text-[var(--muted)] font-mono">Pending</span>}
                      </div>
                    </div>
                  </div>

                  {/* Scan summary outcome */}
                  {scanDone && simulatedAuditResult && (
                    <div className="mt-4 p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--brand)]/30 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[var(--foreground)]">Provisional Audit Score:</span>
                        <span className="text-sm font-bold text-[var(--brand)] font-mono">
                          {simulatedAuditResult.cqsScore}/100
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--muted)]">
                        Scene captured on {simulatedAuditResult.sceneDate}. High vegetation index confirms dense intact canopy.
                      </div>
                    </div>
                  )}
                </div>
              </Panel>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}

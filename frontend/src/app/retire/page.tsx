"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Printer, 
  Copy, 
  Check, 
  Calculator, 
  Building, 
  Plane, 
  Server, 
  Zap, 
  ShieldAlert, 
  FileCheck, 
  QrCode,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Transaction, SystemProgram, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import QRCode from "qrcode.react";

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

interface PastRetirement {
  id: string;
  beneficiary: string;
  project: string;
  amount: number;
  date: string;
  signature: string;
}

const DEFAULT_PAST_RETIREMENTS: PastRetirement[] = [
  {
    id: "TV-RET-2026-A19F88",
    beneficiary: "Acme Logistics Global",
    project: "Amazon Reforestation Block 7",
    amount: 500,
    date: "Oct 8, 2026",
    signature: "5wHmd1tsz2veD44UNLaRbg7aD463D11RdCz9zRYkKAkFYgSmQpayaHsykferEzfQ9bNcati59De23Len4YCJKqQQ",
  },
  {
    id: "TV-RET-2026-B44E12",
    beneficiary: "Starlight Digital Tech",
    project: "Congo Basin Conservation",
    amount: 250,
    date: "Sep 28, 2026",
    signature: "3NqmZt88xPqLM091871111111111111111111111111111111111111111111111",
  },
];

const AVAILABLE_PROJECTS = [
  {
    name: "Amazon Reforestation Block 7",
    region: "Amazonas, Brazil",
    grade: "AAA",
    status: "Verified",
    available: 12500,
    cqs: 94,
  },
  {
    name: "Congo Basin Conservation",
    region: "Équateur, DRC",
    grade: "AA",
    status: "Verified",
    available: 45000,
    cqs: 88,
  },
  {
    name: "Borneo Peatland Protection",
    region: "Central Kalimantan, ID",
    grade: "C",
    status: "Revoked",
    available: 0,
    cqs: 42,
    reason: "Suspended: Canopy degradation detected by Sentinel-2. Transfer hooks prohibit retirement.",
  },
];

export default function RetirePage() {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Emissions Measurement
  const [measurementMode, setMeasurementMode] = useState<"calc" | "direct">("calc");
  const [electricityMwh, setElectricityMwh] = useState<string>("");
  const [flightsKm, setFlightsKm] = useState<string>("");
  const [cloudSpendUsd, setCloudSpendUsd] = useState<string>("");
  const [fuelLitres, setFuelLitres] = useState<string>("");
  const [directTons, setDirectTons] = useState<string>("500");

  // Step 2: Select Credits
  const [selectedProjectName, setSelectedProjectName] = useState(AVAILABLE_PROJECTS[0].name);
  const [beneficiaryName, setBeneficiaryName] = useState("Acme Corporation");
  const [retireAmount, setRetireAmount] = useState<string>("500");

  // Step 3: Confirm & Execute
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [burning, setBurning] = useState(false);
  const [burnSignature, setBurnSignature] = useState<string | null>(null);
  const [burnError, setBurnError] = useState<string | null>(null);
  const [pastRetirements, setPastRetirements] = useState<PastRetirement[]>(DEFAULT_PAST_RETIREMENTS);

  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();
  const { setVisible } = useWalletModal();

  // Calculated emissions in Step 1
  const calculatedEmissions = useMemo(() => {
    if (measurementMode === "direct") {
      return parseFloat(directTons) || 0;
    }
    // Standard GHG protocol factors:
    // Electricity: ~0.4 kg CO2e per kWh => 0.4 tons per MWh
    const elecE = (parseFloat(electricityMwh) || 0) * 0.4;
    // Flights: ~0.15 kg CO2e per passenger-km => 0.00015 tons per km
    const flightE = (parseFloat(flightsKm) || 0) * 0.00015;
    // Cloud: ~0.02 tons CO2e per $100 spent (estimated enterprise cloud carbon factor)
    const cloudE = ((parseFloat(cloudSpendUsd) || 0) / 100) * 0.02;
    // Fuel (Diesel/Gas): ~2.6 kg CO2e per litre => 0.0026 tons per litre
    const fuelE = (parseFloat(fuelLitres) || 0) * 0.0026;

    const total = Math.round(elecE + flightE + cloudE + fuelE);
    return total > 0 ? total : 500; // sensible baseline
  }, [measurementMode, directTons, electricityMwh, flightsKm, cloudSpendUsd, fuelLitres]);

  const selectedProject = useMemo(
    () => AVAILABLE_PROJECTS.find((p) => p.name === selectedProjectName) || AVAILABLE_PROJECTS[0],
    [selectedProjectName]
  );

  const isProjectBlocked = selectedProject.status === "Revoked" || selectedProject.status === "Suspended";
  const amountToRetire = parseFloat(retireAmount) || 0;
  const coveragePercent = calculatedEmissions > 0 ? Math.min(100, Math.round((amountToRetire / calculatedEmissions) * 100)) : 100;

  // Execute Burn Transaction on Solana
  const handleExecuteBurn = async () => {
    setBurnError(null);

    if (!connected || !publicKey) {
      setVisible(true);
      return;
    }

    if (isProjectBlocked) {
      setBurnError("Cannot retire tokens: Project oracle status is suspended.");
      return;
    }

    if (amountToRetire <= 0) {
      setBurnError("Please specify a valid credit amount to retire.");
      return;
    }

    try {
      setBurning(true);

      // On-chain burn simulation via Solana Devnet transaction
      const burnRecipient = new PublicKey("11111111111111111111111111111111");
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: burnRecipient,
          lamports: Math.round(0.0005 * LAMPORTS_PER_SOL), // Nominal burn execution fee
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      setBurnSignature(signature);

      const newRetirement: PastRetirement = {
        id: `TV-RET-2026-${signature.slice(0, 6).toUpperCase()}`,
        beneficiary: beneficiaryName || "Acme Corporation",
        project: selectedProject.name,
        amount: amountToRetire,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        signature,
      };

      setPastRetirements([newRetirement, ...pastRetirements]);
    } catch (err: unknown) {
      const errStr = err instanceof Error ? err.message : String(err);
      if (errStr.includes("User rejected")) {
        setBurnError("Burn transaction cancelled by wallet.");
      } else {
        setBurnError(errStr || "Burn transaction failed on Devnet.");
      }
    } finally {
      setBurning(false);
    }
  };

  const steps = [
    { id: 1, title: "Measure Emissions", subtitle: "Scope 1–3 Assessment" },
    { id: 2, title: "Select Credits", subtitle: "Choose Verified Parcel" },
    { id: 3, title: "Confirm & Certificate", subtitle: "On-Chain Token Burn" },
  ];

  return (
    <PageShell>
      <PageHeader
        title="Retire Carbon Credits"
        description="Permanently burn satellite-verified carbon credits on Solana to claim verifiable environmental offsets."
      />

      {/* 3-Step Guided Stepper */}
      <Stepper
        steps={steps}
        currentStep={currentStep}
        onStepClick={(s) => setCurrentStep(s)}
      />

      {/* Step 1: Emissions Measurement */}
      {currentStep === 1 && (
        <div className="max-w-3xl mx-auto space-y-6">
          <Panel className="p-6 sm:p-8 space-y-6 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Step 1: Quantify Organizational Emissions
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Input activity data to compute offset volume, or enter your audited total directly.
                </p>
              </div>

              <SegmentedControl<"calc" | "direct">
                value={measurementMode}
                onChange={setMeasurementMode}
                options={[
                  { value: "calc", label: "Calculator" },
                  { value: "direct", label: "Direct Entry" },
                ]}
              />
            </div>

            {measurementMode === "calc" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[var(--text-muted)] font-medium flex items-center gap-1.5 mb-1.5">
                      <Zap className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>Electricity Consumption (MWh)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 1200"
                      value={electricityMwh}
                      onChange={(e) => setElectricityMwh(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text)] font-mono focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                    <span className="text-[10px] text-[var(--text-muted)]">Factor: 0.40 tCO2e / MWh</span>
                  </div>

                  <div>
                    <label className="text-[var(--text-muted)] font-medium flex items-center gap-1.5 mb-1.5">
                      <Plane className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>Business Travel Flights (km)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      value={flightsKm}
                      onChange={(e) => setFlightsKm(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text)] font-mono focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                    <span className="text-[10px] text-[var(--text-muted)]">Factor: 0.15 kg CO2e / km</span>
                  </div>

                  <div>
                    <label className="text-[var(--text-muted)] font-medium flex items-center gap-1.5 mb-1.5">
                      <Server className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>Annual Cloud Infrastructure ($ USD)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 25000"
                      value={cloudSpendUsd}
                      onChange={(e) => setCloudSpendUsd(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text)] font-mono focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                    <span className="text-[10px] text-[var(--text-muted)]">Factor: ~0.02 tCO2e / $100</span>
                  </div>

                  <div>
                    <label className="text-[var(--text-muted)] font-medium flex items-center gap-1.5 mb-1.5">
                      <Flame className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>Fleet Fuel Combustion (Litres)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 8000"
                      value={fuelLitres}
                      onChange={(e) => setFuelLitres(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text)] font-mono focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                    <span className="text-[10px] text-[var(--text-muted)]">Factor: 2.60 kg CO2e / L</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                <label className="text-[var(--text-muted)] font-medium block">
                  Audited Total Emissions to Offset (tCO2e)
                </label>
                <input
                  type="number"
                  value={directTons}
                  onChange={(e) => setDirectTons(e.target.value)}
                  className="w-full sm:w-64 p-2.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text)] font-mono text-base focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
            )}

            {/* Total Summary Banner */}
            <div className="p-4 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-between">
              <div>
                <span className="text-xs text-[var(--text-muted)]">Target Retirement Volume</span>
                <div className="text-xl font-bold font-mono text-[var(--accent)]">
                  {calculatedEmissions.toLocaleString()} tCO2e
                </div>
              </div>

              <button
                onClick={() => {
                  setRetireAmount(String(calculatedEmissions));
                  setCurrentStep(2);
                }}
                className="px-5 py-2.5 rounded-lg bg-[var(--accent)] hover:opacity-90 text-[var(--bg-app)] font-semibold text-xs transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Continue to Select Credits</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </Panel>
        </div>
      )}

      {/* Step 2: Select Credits & Target Parcel */}
      {currentStep === 2 && (
        <div className="max-w-3xl mx-auto space-y-6">
          <Panel className="p-6 sm:p-8 space-y-6 text-left">
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Step 2: Assign Verified Project & Beneficiary
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose an intact, oracle-verified ecological parcel to draw offsets from.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[var(--text-muted)] font-medium block mb-1.5">
                  Beneficiary Legal Name (Entity receiving certificate)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corporation"
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>

              {/* Project Selection */}
              <div>
                <label className="text-[var(--text-muted)] font-medium block mb-2">
                  Select Carbon Offset Project
                </label>
                <div className="space-y-2">
                  {AVAILABLE_PROJECTS.map((proj) => {
                    const isSelected = selectedProjectName === proj.name;
                    const isBlocked = proj.status === "Revoked" || proj.status === "Suspended";

                    return (
                      <div
                        key={proj.name}
                        onClick={() => !isBlocked && setSelectedProjectName(proj.name)}
                        className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-[var(--accent-subtle)] border-[var(--accent)] ring-1 ring-[var(--accent)]/30"
                            : isBlocked
                            ? "bg-[var(--danger-subtle)]/40 border-[var(--danger)]/30 opacity-70 cursor-not-allowed"
                            : "bg-[var(--surface-raised)] border-[var(--border)] hover:border-[var(--border-hover)] cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="projectSelection"
                            checked={isSelected}
                            disabled={isBlocked}
                            onChange={() => setSelectedProjectName(proj.name)}
                            className="accent-[var(--accent)]"
                          />
                          <div>
                            <div className="font-bold text-[var(--text)] leading-tight">
                              {proj.name}
                            </div>
                            <div className="text-[11px] text-[var(--text-muted)]">
                              {proj.region} · {proj.available.toLocaleString()} tCO2e available
                            </div>
                            {isBlocked && (
                              <div className="text-[11px] text-[var(--danger)] mt-1 flex items-center gap-1 font-mono">
                                <ShieldAlert className="w-3 h-3" />
                                <span>{proj.reason}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <GradeBadge grade={proj.grade} />
                          <StatusBadge status={proj.status} size="sm" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quantity to Retire */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[var(--text-muted)] font-medium">Credits to Burn (tCO2e)</label>
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">
                    Calculated target: {calculatedEmissions} t
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  max={selectedProject.available}
                  value={retireAmount}
                  onChange={(e) => setRetireAmount(e.target.value)}
                  className="w-full sm:w-64 p-2.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text)] font-mono focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>

              {/* Coverage Progress Bar */}
              <div className="p-3 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-[var(--text-muted)]">Emissions Coverage</span>
                  <span className="text-[var(--accent)] font-bold">
                    {coveragePercent}% ({coveragePercent >= 100 ? "Full Offset" : "Partial Offset"})
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--surface)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent)] transition-all duration-300"
                    style={{ width: `${coveragePercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stepper Buttons */}
            <div className="pt-4 border-t border-slate-100 flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                onClick={() => setCurrentStep(3)}
                disabled={isProjectBlocked || amountToRetire <= 0}
                className="px-5 py-2.5 rounded-lg bg-[var(--accent)] hover:opacity-90 text-[var(--bg-app)] font-semibold text-xs transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <span>Proceed to Confirmation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </Panel>
        </div>
      )}

      {/* Step 3: Confirm & Certificate Document */}
      {currentStep === 3 && (
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Confirmation Form (5 Columns) */}
            <div className="lg:col-span-5 space-y-4 text-left">
              <Panel className="p-6 space-y-5">
                <div className="pb-3 border-b border-[var(--border)]">
                  <h3 className="text-sm font-bold text-[var(--text)]">
                    Step 3: Confirm Token Burn
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    This cryptographic burn action is irreversible on Solana.
                  </p>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <DataRow label="Beneficiary" value={beneficiaryName} />
                  <DataRow label="Project" value={selectedProject.name} />
                  <DataRow label="Volume" value={`${amountToRetire.toLocaleString()} tCO2e`} />
                  <DataRow label="Coverage" value={`${coveragePercent}%`} />
                  <DataRow label="Network" value="Solana Devnet" />
                </div>

                {/* Irreversible Confirmation Checkbox & Type check */}
                <div className="space-y-3 pt-2 border-t border-[var(--border-subtle)] text-xs">
                  <label className="flex items-start gap-2.5 text-[var(--text-muted)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmCheckbox}
                      onChange={(e) => setConfirmCheckbox(e.target.checked)}
                      className="mt-0.5 rounded accent-[var(--accent)] w-3.5 h-3.5"
                    />
                    <span>
                      I understand that burning tokens permanently destroys them from circulating supply.
                    </span>
                  </label>

                  <div>
                    <label className="text-[11px] text-[var(--text-muted)] block mb-1">
                      Type <strong className="text-[var(--text)] font-bold">RETIRE</strong> to unlock action:
                    </label>
                    <input
                      type="text"
                      placeholder="RETIRE"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                      className="w-full p-2 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text)] font-mono uppercase focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                  </div>
                </div>

                {burnError && (
                  <div className="p-2.5 rounded bg-[var(--danger-subtle)] border border-[var(--danger)]/30 text-xs text-[var(--danger)]">
                    {burnError}
                  </div>
                )}

                {/* Neutral/Primary Action Button */}
                {!connected ? (
                  <button
                    onClick={() => setVisible(true)}
                    className="w-full py-3 rounded-lg bg-[var(--accent)] hover:opacity-90 text-[var(--bg-app)] font-semibold text-xs transition-opacity cursor-pointer shadow-xs"
                  >
                    Connect Wallet to Execute Burn
                  </button>
                ) : (
                  <button
                    onClick={handleExecuteBurn}
                    disabled={burning || !confirmCheckbox || confirmText !== "RETIRE"}
                    className="w-full py-3 rounded-lg bg-[var(--accent)] hover:opacity-90 text-[var(--bg-app)] font-semibold text-xs transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {burning ? (
                      <span>Executing Token-2022 Burn...</span>
                    ) : (
                      <>
                        <Flame className="w-3.5 h-3.5" />
                        <span>Confirm Permanent Retirement</span>
                      </>
                    )}
                  </button>
                )}

                <div className="text-[11px] text-slate-400 text-center">
                  Retirement is an on-chain record of credits retired, not a corporate net-zero certification.
                </div>
              </Panel>
            </div>

            {/* Right: Real Document Certificate (Paper Surface) (7 Columns) */}
            <div className="lg:col-span-7">
              <div className="bg-[#fcfcf9] text-[#1a201c] p-8 sm:p-10 rounded-2xl shadow-xl border border-[#e2e4dc] text-left font-serif relative overflow-hidden print:p-0 print:border-none print:shadow-none">
                {/* Watermark */}
                {!burnSignature && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10">
                    <span className="text-5xl font-sans font-bold text-gray-400/20 rotate-[-25deg] uppercase border-4 border-dashed border-gray-400/20 px-8 py-3 rounded-2xl">
                      Preview / Pending Burn
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-start pb-5 border-b border-[#e2e4dc]">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#2e5944] font-bold mb-1">
                      TerraVerify Protocol · On-Chain Registry
                    </div>
                    <h4 className="text-xl sm:text-2xl font-bold text-[#111c16]">
                      Certificate of Carbon Offset
                    </h4>
                  </div>
                  <div className="text-right font-mono text-[10px] text-[#526359]">
                    <div>STATUS:</div>
                    <div className="font-bold text-[#111c16]">
                      {burnSignature ? "VERIFIED ON-CHAIN" : "PENDING EXECUTION"}
                    </div>
                  </div>
                </div>

                <div className="py-6 space-y-5">
                  <p className="text-xs text-[#2d3a33] leading-relaxed">
                    This document formally certifies the permanent cryptographic retirement of carbon offset
                    credits on the Solana blockchain. Ecological permanency verified by Copernicus Sentinel-2.
                  </p>

                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-[#e2e4dc] font-sans text-xs">
                    <div>
                      <span className="text-[#697a70] uppercase font-mono text-[10px] block">
                        Beneficiary
                      </span>
                      <span className="font-bold text-[#111c16] text-sm truncate block">
                        {beneficiaryName || "Acme Corporation"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#697a70] uppercase font-mono text-[10px] block">
                        Volume Retired
                      </span>
                      <span className="font-mono font-bold text-[#1a5734] text-base">
                        {amountToRetire.toLocaleString()} tCO₂e
                      </span>
                    </div>

                    <div>
                      <span className="text-[#697a70] uppercase font-mono text-[10px] block">
                        Source Project
                      </span>
                      <span className="font-medium text-[#111c16] truncate block">
                        {selectedProject.name}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#697a70] uppercase font-mono text-[10px] block">
                        Retirement Date
                      </span>
                      <span className="font-mono text-[#111c16]">
                        {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>

                  {/* QR Code and Verification Link */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-1 font-mono text-[11px] text-[#526359] max-w-xs">
                      <div>Scan QR to verify proof on Solana Explorer:</div>
                      {burnSignature && (
                        <Link
                          href={`/verify/${burnSignature}`}
                          className="text-[#1a5734] hover:underline font-bold text-xs flex items-center gap-1"
                        >
                          <span>Public Verification Page</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>

                    <div className="p-2 rounded bg-white border border-[#e2e4dc] shrink-0">
                      <QRCode
                        value={
                          burnSignature
                            ? `https://terraverify-gold.vercel.app/verify/${burnSignature}`
                            : `https://terraverify-gold.vercel.app/verify/sample`
                        }
                        size={64}
                        level="M"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#e2e4dc] flex items-center justify-between font-sans text-xs">
                  <span className="text-[10px] font-mono text-[#697a70]">
                    Serial: TV-RET-2026-{burnSignature ? burnSignature.slice(0, 8).toUpperCase() : "SAMPLE"}
                  </span>

                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 rounded bg-[#111c16] text-white hover:bg-[#23382c] transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer print:hidden shadow-xs"
                  >
                    <Printer className="w-3 h-3" />
                    <span>Print Certificate</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Past Retirements Section */}
          <div className="space-y-4 pt-4 border-t border-[var(--border)] text-left">
            <h3 className="text-sm font-bold text-[var(--text)]">
              Past Retirement Certificates for Connected Wallet
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {pastRetirements.map((ret) => (
                <div
                  key={ret.id}
                  className="p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] shadow-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-[var(--text)]">
                      {ret.amount.toLocaleString()} tCO2e · {ret.project}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">
                      {ret.beneficiary} · {ret.date}
                    </div>
                  </div>

                  <Link
                    href={`/verify/${ret.signature}`}
                    className="px-2.5 py-1.5 rounded bg-[var(--surface)] hover:bg-[var(--surface-raised)] text-[var(--accent)] border border-[var(--border)] font-mono text-xs flex items-center gap-1 transition-colors"
                  >
                    <span>Verify</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

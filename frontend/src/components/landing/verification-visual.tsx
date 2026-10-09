"use client";

import React, { useState } from "react";
import Link from "next/link";

interface ParcelData {
  id: string;
  project: string;
  location: string;
  status: "VERIFIED" | "SUSPENDED";
  evidence: string;
  chain: string;
  ndvi: number;
  forestCover: string;
  trend: string;
  cqsScore: number;
  cqsGrade: string;
  image: string;
  oracleAccount: string;
  lastPass: string;
  notes: string;
}

const PARCELS: ParcelData[] = [
  {
    id: "PRJ-001",
    project: "Amazon Reforestation Block 7",
    location: "03.42° S · 62.40° W · Acreage 12,500 ha",
    status: "VERIFIED",
    evidence: "Multispectral Sentinel-2 observation (NDVI 0.845)",
    chain: "Solana (Token-2022 Transfer Hook)",
    ndvi: 0.845,
    forestCover: "84.5%",
    trend: "+0.2%",
    cqsScore: 94,
    cqsGrade: "AAA",
    image: "/amazon.png",
    oracleAccount: "TVrfy9xQK7m28aP...6F2b",
    lastPass: "2 hours ago (Sentinel-2 L2A)",
    notes: "Canopy integrity stable across all sub-quadrants. Token trading active.",
  },
  {
    id: "PRJ-003",
    project: "Borneo Peatland Protection Reserve",
    location: "01.25° S · 114.12° E · Acreage 8,200 ha",
    status: "SUSPENDED",
    evidence: "Canopy loss detected (-5.4% drop over 14 days)",
    chain: "Solana (Transfer Hook Blocked)",
    ndvi: 0.621,
    forestCover: "62.1%",
    trend: "-5.4%",
    cqsScore: 42,
    cqsGrade: "C",
    image: "/borneo.png",
    oracleAccount: "TVrfy3mNP9v41aQ...8L1a",
    lastPass: "12 hours ago (Sentinel-2 L2A)",
    notes: "Deforestation detected in quadrant C. Transfer hooks auto-froze secondary trading.",
  },
];

export default function VerificationVisualSection() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [filterMode, setFilterMode] = useState<"natural" | "infrared">("natural");

  const current = PARCELS[selectedIdx];

  return (
    <section
      id="verification"
      className="py-20 md:py-32 border-b border-[#d6dfd9] bg-[#f4f5ef] text-[#101814] transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8f2ec] border border-[#cfe0d5] mb-4">
              <span className="w-2 h-2 rounded-full bg-[#38b87c]" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#1b7046] font-medium">
                Independent Telemetry
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#101814] mb-4">
              What verification actually looks like.
            </h2>
            <p className="text-base sm:text-lg text-[#4f6358]">
              Real-time telemetry, parcel boundaries, and cryptographic proof
              compiled into an accessible public record.
            </p>
          </div>

          {/* Project Selector Tabs */}
          <div className="mt-6 md:mt-0 flex items-center gap-2 p-1.5 rounded-lg bg-[#e2ebe4] border border-[#cfe0d5]">
            {PARCELS.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setSelectedIdx(idx)}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                  selectedIdx === idx
                    ? "bg-[#ffffff] text-[#101814] font-bold shadow-xs border border-[#b8ccbf]"
                    : "text-[#55675e] hover:text-[#101814]"
                }`}
              >
                {p.id} ({p.status === "VERIFIED" ? "Verified" : "Suspended"})
              </button>
            ))}
          </div>
        </div>

        {/* Verification Console Body */}
        <div className="rounded-lg border border-[#162922] bg-[#0d1714] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Top Verification Header Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 sm:p-6 bg-[#07130f] border-b border-[#162922] text-left">
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-[#718078] mb-1">
                PROJECT
              </div>
              <div className="text-xs sm:text-sm font-semibold text-[#f4f5ef] truncate">
                {current.project}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-[#718078] mb-1">
                LOCATION
              </div>
              <div className="text-xs sm:text-sm font-mono text-[#a8c7b5] truncate">
                {current.location.split("·").slice(0, 2).join("·").trim()}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-[#718078] mb-1">
                STATUS
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    current.status === "VERIFIED" ? "bg-[#38b87c]" : "bg-red-400"
                  }`}
                />
                <span
                  className={`text-xs sm:text-sm font-bold tracking-wider ${
                    current.status === "VERIFIED"
                      ? "text-[#38b87c]"
                      : "text-red-400"
                  }`}
                >
                  {current.status}
                </span>
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-[#718078] mb-1">
                EVIDENCE
              </div>
              <div className="text-xs sm:text-sm text-[#8e9f96] truncate">
                {current.evidence}
              </div>
            </div>

            <div className="col-span-2 md:col-span-1">
              <div className="text-[10px] uppercase font-mono tracking-wider text-[#718078] mb-1">
                CHAIN
              </div>
              <div className="text-xs sm:text-sm font-mono text-[#f4f5ef] flex items-center gap-1.5">
                <span>Solana Devnet</span>
              </div>
            </div>
          </div>

          {/* Interactive GIS Viewport + Telemetry Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* GIS Satellite Viewport (8 Cols) */}
            <div className="lg:col-span-8 relative aspect-[16/10] bg-[#050c0a] overflow-hidden">
              <img
                src={current.image}
                alt={`${current.project} satellite view`}
                className={`w-full h-full object-cover transition-all duration-500 ${
                  filterMode === "infrared"
                    ? "hue-rotate-90 contrast-125 saturate-150"
                    : "brightness-95 contrast-105"
                }`}
              />

              {/* GIS Grid Mesh */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern
                    id="grid-gis"
                    width="48"
                    height="48"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 48 0 L 0 0 0 48"
                      fill="none"
                      stroke="#a8c7b5"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-gis)" />
              </svg>

              {/* Monitored Parcel Boundary */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 800 500"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <polygon
                  points="140,80 680,60 740,420 180,440"
                  stroke={current.status === "VERIFIED" ? "#38b87c" : "#f87171"}
                  strokeWidth="2"
                  strokeDasharray="8 4"
                  fill={
                    current.status === "VERIFIED"
                      ? "rgba(56, 184, 124, 0.08)"
                      : "rgba(248, 113, 113, 0.12)"
                  }
                />
                <circle
                  cx="140"
                  cy="80"
                  r="3.5"
                  fill={current.status === "VERIFIED" ? "#38b87c" : "#f87171"}
                />
                <circle
                  cx="680"
                  cy="60"
                  r="3.5"
                  fill={current.status === "VERIFIED" ? "#38b87c" : "#f87171"}
                />
                <circle
                  cx="740"
                  cy="420"
                  r="3.5"
                  fill={current.status === "VERIFIED" ? "#38b87c" : "#f87171"}
                />
                <circle
                  cx="180"
                  cy="440"
                  r="3.5"
                  fill={current.status === "VERIFIED" ? "#38b87c" : "#f87171"}
                />
              </svg>

              {/* Viewport Floating Controls */}
              <div className="absolute top-4 left-4 bg-[#07130f]/90 backdrop-blur-sm border border-[#162922] px-3 py-1.5 rounded text-xs font-mono text-[#a8c7b5] flex items-center gap-2">
                <span className="text-[#f4f5ef] font-semibold">{current.id}</span>
                <span>·</span>
                <span>{current.lastPass}</span>
              </div>

              <div className="absolute top-4 right-4 bg-[#07130f]/90 backdrop-blur-sm border border-[#162922] p-1 rounded flex items-center gap-1 text-[11px] font-mono">
                <button
                  onClick={() => setFilterMode("natural")}
                  className={`px-2 py-1 rounded transition-colors ${
                    filterMode === "natural"
                      ? "bg-[#38b87c] text-[#07130f] font-semibold"
                      : "text-[#8e9f96] hover:text-[#f4f5ef]"
                  }`}
                >
                  RGB View
                </button>
                <button
                  onClick={() => setFilterMode("infrared")}
                  className={`px-2 py-1 rounded transition-colors ${
                    filterMode === "infrared"
                      ? "bg-[#38b87c] text-[#07130f] font-semibold"
                      : "text-[#8e9f96] hover:text-[#f4f5ef]"
                  }`}
                >
                  NIR False Color
                </button>
              </div>

              {/* Watermark Coordinates */}
              <div className="absolute bottom-4 left-4 bg-[#07130f]/85 backdrop-blur-sm border border-[#162922] px-2.5 py-1 rounded text-[11px] font-mono text-[#718078]">
                COORDINATES: {current.location}
              </div>
            </div>

            {/* Telemetry Inspection Panel (4 Cols) */}
            <div className="lg:col-span-4 p-6 sm:p-8 bg-[#0a1813] border-t lg:border-t-0 lg:border-l border-[#162922] flex flex-col justify-between">
              <div className="space-y-6 text-left">
                <div className="flex items-center justify-between pb-3 border-b border-[#162922]">
                  <span className="text-xs font-mono text-[#718078] uppercase">
                    Verification Metrics
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      current.status === "VERIFIED"
                        ? "bg-[#13221d] text-[#38b87c] border border-[#38b87c]/30"
                        : "bg-red-500/10 text-red-400 border border-red-500/30"
                    }`}
                  >
                    GRADE {current.cqsGrade} ({current.cqsScore}/100)
                  </span>
                </div>

                {/* Score Data List */}
                <div className="space-y-4 font-mono text-xs">
                  <div className="flex justify-between items-baseline pb-2 border-b border-[#162922]">
                    <span className="text-[#8e9f96]">NDVI Score:</span>
                    <span className="text-[#f4f5ef] font-semibold text-sm">
                      {current.ndvi}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pb-2 border-b border-[#162922]">
                    <span className="text-[#8e9f96]">Canopy Retention:</span>
                    <span className="text-[#f4f5ef] font-semibold text-sm">
                      {current.forestCover}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pb-2 border-b border-[#162922]">
                    <span className="text-[#8e9f96]">30-Day Trend:</span>
                    <span
                      className={`font-semibold text-sm ${
                        current.trend.startsWith("-")
                          ? "text-red-400"
                          : "text-[#38b87c]"
                      }`}
                    >
                      {current.trend}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pb-2 border-b border-[#162922]">
                    <span className="text-[#8e9f96]">Transfer Hook:</span>
                    <span
                      className={`font-semibold ${
                        current.status === "VERIFIED"
                          ? "text-[#38b87c]"
                          : "text-red-400"
                      }`}
                    >
                      {current.status === "VERIFIED"
                        ? "Active (Trading Permitted)"
                        : "Blocked (Auto-Revoked)"}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pb-2 border-b border-[#162922]">
                    <span className="text-[#8e9f96]">Oracle Account:</span>
                    <span className="text-[#a8c7b5] text-[11px]">
                      {current.oracleAccount}
                    </span>
                  </div>
                </div>

                {/* Automated Audit Note */}
                <div className="p-3.5 rounded bg-[#07130f] border border-[#162922] text-xs text-[#8e9f96] leading-relaxed">
                  <span className="text-[#f4f5ef] font-semibold block mb-1">
                    System Diagnostic:
                  </span>
                  {current.notes}
                </div>
              </div>

              {/* Action Link to Full Explorer */}
              <div className="pt-6 border-t border-[#162922] mt-6">
                <Link
                  href="/explorer"
                  className="w-full py-2.5 px-4 rounded bg-[#0d1714] hover:bg-[#13221d] border border-[#162922] hover:border-[#a8c7b5]/30 text-xs font-semibold text-[#f4f5ef] transition-colors flex items-center justify-center gap-2"
                >
                  <span>Open Full Satellite Explorer</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

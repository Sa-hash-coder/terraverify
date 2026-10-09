"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ParticleDrift from "../originkit/particle-drift";

export default function HeroSection() {
  const [activeLayer, setActiveLayer] = useState<"optical" | "ndvi">("optical");

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden border-b border-[#162922]">
      {/* Background Particle Drift Animation */}
      <ParticleDrift
        particleCount={75}
        particleColor="#a8c7b5"
        accentColor="#38b87c"
        lineColor="rgba(56, 184, 124, 0.16)"
        maxDistance={120}
        speed={0.35}
        mouseRadius={150}
        className="z-0 opacity-80"
      />

      {/* Subtle background ambient gradient */}
      <div
        className="absolute top-0 right-1/4 w-96 h-96 bg-[#38b87c]/5 rounded-full blur-3xl pointer-events-none z-0"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial & Value Proposition */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {/* Status / Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#0d1714] border border-[#162922] text-[#a8c7b5] text-xs font-mono tracking-wide mb-8">
              <span className="w-2 h-2 rounded-full bg-[#38b87c] animate-pulse" />
              <span>ORBITAL TELEMETRY · 5-DAY VERIFICATION CADENCE</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#f4f5ef] leading-[1.08] mb-6">
              Verify the claim.
              <span className="block text-[#a8c7b5] font-medium mt-1">
                See the evidence.
              </span>
            </h1>

            {/* Supporting Line */}
            <p className="text-base sm:text-lg text-[#8e9f96] leading-relaxed max-w-xl mb-10 font-normal">
              TerraVerify uses satellite intelligence and on-chain verification
              to bring greater trust to the carbon market. Every credit is anchored
              to verified canopy density observed from orbit.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto mb-12">
              <Link
                href="/explorer"
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-[#07130f] bg-[#38b87c] hover:bg-[#42cb8a] rounded transition-all flex items-center justify-center gap-2 shadow-[0_2px_12px_rgba(56,184,124,0.25)]"
              >
                <span>Explore Projects</span>
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-medium text-[#f4f5ef] bg-[#0d1714] hover:bg-[#13221d] rounded border border-[#162922] hover:border-[#a8c7b5]/30 transition-all flex items-center justify-center gap-2"
              >
                <span>How Verification Works</span>
              </a>
            </div>

            {/* Credibility Micro-Strip */}
            <div className="pt-8 border-t border-[#162922] w-full grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-[#718078] uppercase font-mono tracking-wider mb-1">
                  Sensor
                </div>
                <div className="text-xs sm:text-sm font-medium text-[#f4f5ef]">
                  Sentinel-2 L2A
                </div>
              </div>
              <div>
                <div className="text-xs text-[#718078] uppercase font-mono tracking-wider mb-1">
                  Audits
                </div>
                <div className="text-xs sm:text-sm font-medium text-[#f4f5ef]">
                  Automated / 5d
                </div>
              </div>
              <div>
                <div className="text-xs text-[#718078] uppercase font-mono tracking-wider mb-1">
                  Enforcement
                </div>
                <div className="text-xs sm:text-sm font-medium text-[#38b87c]">
                  Token-2022 Hook
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual - Satellite Earth Observation Environment */}
          <div className="lg:col-span-6 w-full">
            <div className="relative rounded-lg overflow-hidden border border-[#162922] bg-[#0d1714] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              {/* Satellite Telemetry Top Bar */}
              <div className="px-4 py-2.5 bg-[#07130f] border-b border-[#162922] flex items-center justify-between text-xs font-mono text-[#8e9f96]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#38b87c]" />
                  <span className="text-[#f4f5ef] font-medium">LIVE TELEMETRY FEED</span>
                  <span className="text-[#718078]">·</span>
                  <span className="hidden sm:inline">PARCEL BR-07-AM</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#a8c7b5]">ESA / COPERNICUS</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#13221d] text-[#38b87c] text-[10px] uppercase font-semibold">
                    SYNCED
                  </span>
                </div>
              </div>

              {/* Main Earth Observation Viewport */}
              <div className="relative aspect-[4/3] w-full bg-[#050c0a] overflow-hidden group">
                <img
                  src="/satellite_hero.jpg"
                  alt="High-resolution Sentinel-2 satellite observation of Amazon conservation parcel"
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    activeLayer === "ndvi" ? "brightness-110 contrast-125 saturate-150" : "brightness-95 contrast-105"
                  }`}
                />

                {/* GIS Grid Lines Overlay */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern
                      id="hero-gis-grid"
                      width="60"
                      height="60"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 60 0 L 0 0 0 60"
                        fill="none"
                        stroke="#a8c7b5"
                        strokeWidth="0.5"
                        strokeDasharray="2 4"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#hero-gis-grid)" />
                </svg>

                {/* Monitored Parcel Boundary Polygon */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 600 450"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <polygon
                    points="90,75 480,50 530,360 160,390"
                    stroke="#38b87c"
                    strokeWidth="1.75"
                    strokeDasharray="6 3"
                    fill="rgba(56, 184, 124, 0.08)"
                  />
                  {/* Geographic Corner Markers */}
                  <circle cx="90" cy="75" r="3" fill="#38b87c" />
                  <circle cx="480" cy="50" r="3" fill="#38b87c" />
                  <circle cx="530" cy="360" r="3" fill="#38b87c" />
                  <circle cx="160" cy="390" r="3" fill="#38b87c" />

                  {/* Corner Coordinate Tags */}
                  <text
                    x="100"
                    y="70"
                    fill="#a8c7b5"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    03°24&apos;48&quot;S 62°24&apos;18&quot;W
                  </text>
                  <text
                    x="420"
                    y="45"
                    fill="#a8c7b5"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    03°24&apos;30&quot;S 62°21&apos;40&quot;W
                  </text>
                </svg>

                {/* Crosshair Scanner */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
                  <div className="w-16 h-16 border border-[#a8c7b5]/40 rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-[#38b87c] rounded-full" />
                  </div>
                  <div className="absolute w-24 h-[1px] bg-[#a8c7b5]/30" />
                  <div className="absolute h-24 w-[1px] bg-[#a8c7b5]/30" />
                </div>

                {/* Overlaid Verified Region Badge */}
                <div className="absolute top-4 left-4 bg-[#07130f]/90 backdrop-blur-sm border border-[#162922] rounded px-3 py-2 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#38b87c]" />
                    <span className="text-[11px] font-semibold text-[#f4f5ef] tracking-wide uppercase">
                      STATUS: VERIFIED
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-[#8e9f96]">
                    PARCEL ID: BR-07-AM · 12,500 ha
                  </div>
                </div>

                {/* Layer Control Toggle */}
                <div className="absolute top-4 right-4 bg-[#07130f]/90 backdrop-blur-sm border border-[#162922] rounded p-1 flex items-center gap-1 text-[11px] font-mono">
                  <button
                    onClick={() => setActiveLayer("optical")}
                    className={`px-2 py-1 rounded transition-colors ${
                      activeLayer === "optical"
                        ? "bg-[#38b87c] text-[#07130f] font-semibold"
                        : "text-[#8e9f96] hover:text-[#f4f5ef]"
                    }`}
                  >
                    RGB True
                  </button>
                  <button
                    onClick={() => setActiveLayer("ndvi")}
                    className={`px-2 py-1 rounded transition-colors ${
                      activeLayer === "ndvi"
                        ? "bg-[#38b87c] text-[#07130f] font-semibold"
                        : "text-[#8e9f96] hover:text-[#f4f5ef]"
                    }`}
                  >
                    NDVI Index
                  </button>
                </div>

                {/* Bottom Telemetry Floating Strip */}
                <div className="absolute bottom-4 left-4 right-4 bg-[#07130f]/92 backdrop-blur-sm border border-[#162922] rounded p-3 text-xs font-mono">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                    <div>
                      <div className="text-[10px] text-[#718078] uppercase">NDVI Index</div>
                      <div className="text-[#38b87c] font-semibold text-sm">0.845</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#718078] uppercase">Canopy Cover</div>
                      <div className="text-[#f4f5ef] font-medium text-sm">84.5%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#718078] uppercase">Cloud Cover</div>
                      <div className="text-[#a8c7b5] font-medium text-sm">&lt; 1.2%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#718078] uppercase">Ledger State</div>
                      <div className="text-[#38b87c] font-medium text-sm">Anchored</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Technical Line */}
              <div className="px-4 py-2 bg-[#07130f] border-t border-[#162922] flex items-center justify-between text-[11px] font-mono text-[#718078]">
                <span>ORBIT: L2A_T20NQF · ELEVATION: 82m</span>
                <span className="text-[#a8c7b5]">SOLANA ANCHOR: VERIFIED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

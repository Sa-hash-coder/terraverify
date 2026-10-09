"use client";

import React from "react";

export default function TechnologySection() {
  const layers = [
    {
      step: "01",
      layer: "Satellite Data Layer",
      tech: "Copernicus Sentinel-2 Constellation",
      desc: "Ingests 12-band multispectral imagery at 10m to 20m spatial resolution. Captures Red (Band 4) and Near-Infrared (Band 8) every 3–5 days per parcel orbit pass.",
      attributes: ["10m Ground Resolution", "12 Multispectral Bands", "3–5 Day Orbit Revisit"],
    },
    {
      step: "02",
      layer: "Environmental Analysis",
      tech: "Vegetation Index & Cloud Filtering",
      desc: "Executes atmospheric correction and pixel-level cloud masking. Computes NDVI vegetation indices across geoJSON cadastral boundaries to quantify biological density.",
      attributes: ["Atmospheric Correction", "Cloud & Shadow Masking", "Geometric Parcel Clipping"],
    },
    {
      step: "03",
      layer: "Verification Logic",
      tech: "Canopy Quality Scoring Engine",
      desc: "Evaluates canopy health trends against baseline thresholds. Generates immutable cryptographic audit proofs with verifiable ratings from AAA to C.",
      attributes: ["Canopy Degradation Alerting", "Baseline Variance Modeling", "ISO 14064 Compliance Alignment"],
    },
    {
      step: "04",
      layer: "On-Chain Record",
      tech: "Solana Token-2022 Transfer Hooks",
      desc: "Publishes audit attestations to dedicated Solana oracle accounts. Automatically restricts token transfers and retirements if canopy degradation is detected.",
      attributes: ["Token-2022 Transfer Hooks", "Sub-Second Finality", "Non-Fungible Retirement Proofs"],
    },
  ];

  return (
    <section
      id="technology"
      className="py-20 md:py-32 border-b border-[#d6dfd9] bg-[#ffffff] text-[#101814] transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8f2ec] border border-[#cfe0d5] mb-4">
            <span className="w-2 h-2 rounded-full bg-[#38b87c]" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#1b7046] font-semibold">
              Protocol Architecture
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#101814] mb-6">
            Built for evidence. Designed for trust.
          </h2>
          <p className="text-base sm:text-lg text-[#4f6358] leading-relaxed">
            A resilient multi-tier pipeline connecting physical earth observation
            to enforceable cryptographic settlement.
          </p>
        </div>

        {/* System Diagram Schematic */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: Interactive Architecture Flowchart */}
          <div className="lg:col-span-5 bg-[#f8faf9] border border-[#d6dfd9] rounded-xl p-6 sm:p-8 space-y-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="text-xs font-mono uppercase tracking-wider text-[#6e8075] font-semibold pb-3 border-b border-[#e2ece5]">
              System Pipeline Flow
            </div>

            <div className="space-y-3 relative">
              {[
                { title: "Satellite Data", subtitle: "ESA Sentinel-2 Multispectral Feed" },
                { title: "Environmental Analysis", subtitle: "NDVI Vegetation & Cloud Masking" },
                { title: "Verification Layer", subtitle: "Canopy Quality Assessment (CQS)" },
                { title: "On-Chain Record", subtitle: "Solana Token-2022 Ledger Proof" },
              ].map((item, idx, arr) => (
                <React.Fragment key={item.title}>
                  <div className="p-4 rounded-lg bg-[#ffffff] border border-[#d6dfd9] flex items-center justify-between text-left group hover:border-[#1b7046] hover:shadow-sm transition-all">
                    <div>
                      <div className="text-sm font-semibold text-[#101814]">
                        {item.title}
                      </div>
                      <div className="text-xs font-mono text-[#6e8075]">
                        {item.subtitle}
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#1b7046] bg-[#e8f2ec] px-2 py-0.5 rounded">
                      0{idx + 1}
                    </span>
                  </div>

                  {idx < arr.length - 1 && (
                    <div className="flex justify-center py-1">
                      <svg
                        className="w-4 h-4 text-[#1b7046]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <polyline points="19 12 12 19 5 12" />
                      </svg>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="pt-4 border-t border-[#e2ece5] text-xs font-mono text-[#6e8075] leading-relaxed">
              Automated feedback loop: Telemetry degradation triggers immediate
              on-chain transfer restrictions.
            </div>
          </div>

          {/* Right: Detailed Layer Breakdown Cards */}
          <div className="lg:col-span-7 space-y-4">
            {layers.map((layer) => (
              <div
                key={layer.step}
                className="p-6 rounded-xl bg-[#ffffff] border border-[#d6dfd9] text-left hover:border-[#1b7046]/40 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded bg-[#e8f2ec] text-[#1b7046] border border-[#cfe0d5]">
                      STAGE {layer.step}
                    </span>
                    <h3 className="text-base font-bold text-[#101814]">
                      {layer.layer}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[#6e8075] hidden sm:inline">
                    {layer.tech}
                  </span>
                </div>

                <p className="text-sm text-[#4f6358] leading-relaxed mb-4">
                  {layer.desc}
                </p>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-[#f0f4f1]">
                  {layer.attributes.map((attr) => (
                    <span
                      key={attr}
                      className="text-[11px] font-mono text-[#1b7046] bg-[#f4f8f5] px-2.5 py-1 rounded border border-[#dae8df]"
                    >
                      {attr}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

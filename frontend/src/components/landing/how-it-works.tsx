"use client";

import React, { useState } from "react";

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: "01",
      title: "Observe",
      subtitle: "Orbital Multispectral Ingestion",
      summary:
        "Satellite and environmental data provide a view of the physical project.",
      detail:
        "Copernicus Sentinel-2 satellites capture high-resolution 10-meter imagery across visible, red-edge, and near-infrared spectral bands every 3 to 5 days over registered parcel coordinates.",
      technical: "ESA Sentinel-2 L2A · Bands B04 & B08 · 10m Ground Resolution",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      ),
    },
    {
      num: "02",
      title: "Analyze",
      subtitle: "Biomass Signal Processing",
      summary:
        "TerraVerify evaluates the available evidence and identifies relevant environmental signals.",
      detail:
        "Automated pipelines calibrate atmospheric optical depth, mask cloud cover, and compute Normalized Difference Vegetation Index (NDVI) variance across geometric parcel boundaries.",
      technical: "NDVI = (NIR - RED) / (NIR + RED) · Cloud Masking < 5%",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
      ),
    },
    {
      num: "03",
      title: "Verify",
      subtitle: "Cryptographic Evidence Synthesis",
      summary:
        "Verification results are compiled into a transparent verification record.",
      detail:
        "Canopy stability metrics are matched against project baselines. Parcels exceeding conservation thresholds receive an authenticated Canopy Quality Score (AAA to C) with timestamped proofs.",
      technical: "CQS Scoring Standard · Minimum 80% Canopy Retention Threshold",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },
    {
      num: "04",
      title: "Record",
      subtitle: "Enforceable On-Chain Settlement",
      summary: "The result can be anchored on-chain through Solana.",
      detail:
        "Verification hashes are committed to Solana oracle accounts. Solana Token-2022 Transfer Hooks automatically freeze credit trading and retirement if canopy loss is detected.",
      technical: "Solana Token-2022 Transfer Hooks · Sub-Second State Finality",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="8" height="8" x="2" y="2" rx="1" />
          <path d="M14 2c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2" />
          <path d="M20 2c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2" />
          <rect width="8" height="8" x="14" y="14" rx="1" />
          <path d="M2 14c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2" />
          <path d="M2 20c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2" />
        </svg>
      ),
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-20 md:py-32 border-b border-[#d6dfd9] bg-[#edf1eb] text-[#101814] transition-colors scroll-mt-20 md:scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e2ebe4] border border-[#cfe0d5] mb-4">
            <span className="w-2 h-2 rounded-full bg-[#38b87c]" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#1b7046] font-medium">
              Verification Workflow
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#101814] mb-6">
            An infrastructure workflow for ecological proof.
          </h2>
          <p className="text-base sm:text-lg text-[#4f6358] leading-relaxed">
            Four synchronized stages connecting orbital sensor passes to the
            Solana settlement layer.
          </p>
        </div>

        {/* Process Track with Connecting Lines */}
        <div className="relative mb-12">
          {/* Subtle Horizontal Connecting Line on desktop */}
          <div
            className="hidden lg:block absolute top-7 left-12 right-12 h-[2px] bg-[#d6ded8] z-0"
            aria-hidden="true"
          />

          {/* Grid of Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative z-10">
            {steps.map((step, idx) => {
              const isSelected = activeStep === idx;
              return (
                <div
                  key={step.num}
                  onClick={() => setActiveStep(idx)}
                  className={`group cursor-pointer p-6 rounded-xl transition-all text-left ${
                    isSelected
                      ? "bg-[#ffffff] border-2 border-[#1b7046] shadow-[0_8px_30px_rgba(27,112,70,0.12)] ring-2 ring-[#38b87c]/15"
                      : "bg-[#ffffff] border border-[#d6dfd9] hover:border-[#38b87c] hover:shadow-md"
                  }`}
                >
                  {/* Step Header Indicator */}
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-[#1b7046] text-[#ffffff] border-[#1b7046]"
                          : "bg-[#f0f8f3] text-[#1b7046] border-[#d6dfd9] group-hover:border-[#38b87c]"
                      }`}
                    >
                      {step.icon}
                    </div>
                    <span className="font-mono text-xs font-bold text-[#8a9d93] tracking-widest">
                      {step.num}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-xl font-bold text-[#101814] mb-1">
                    {step.title}
                  </h3>
                  <div className="text-xs font-mono text-[#1b7046] font-semibold mb-3">
                    {step.subtitle}
                  </div>

                  {/* Summary */}
                  <p className="text-sm text-[#4f6358] leading-relaxed mb-4">
                    {step.summary}
                  </p>

                  {/* Technical Footer */}
                  <div className="pt-3 border-t border-[#edf2ee] text-[11px] font-mono text-[#6b7d74]">
                    {step.technical}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Step Expanded Inspector */}
        <div className="rounded-xl border border-[#d6dfd9] bg-[#ffffff] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#e2ece5]">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-[#e8f2ec] text-[#1b7046] border border-[#cfe0d5]">
                PHASE {steps[activeStep].num} INSPECTOR
              </span>
              <span className="text-sm font-bold text-[#101814]">
                {steps[activeStep].title} — {steps[activeStep].subtitle}
              </span>
            </div>
            <div className="text-xs font-mono text-[#6e8075] font-medium">
              ARCHITECTURE SPECIFICATION
            </div>
          </div>
          <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8">
              <p className="text-sm sm:text-base text-[#101814] leading-relaxed mb-3">
                {steps[activeStep].detail}
              </p>
              <p className="text-xs font-mono text-[#1b7046] font-semibold">
                Specification: {steps[activeStep].technical}
              </p>
            </div>
            <div className="lg:col-span-4 flex justify-end">
              <a
                href="#verification"
                className="text-xs font-mono font-semibold text-[#1b7046] hover:text-[#101814] flex items-center gap-2 group transition-colors"
              >
                <span>Inspect Live Verification Telemetry</span>
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

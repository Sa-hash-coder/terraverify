"use client";

import React from "react";

export default function ProblemSolutionSection() {
  return (
    <section
      id="about"
      className="py-20 md:py-32 border-b border-[#d6dfd9] bg-[#f4f5ef] text-[#101814] transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8f2ec] border border-[#cfe0d5] mb-8">
          <span className="w-2 h-2 rounded-full bg-[#38b87c]" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#1b7046] font-medium">
            The Verification Gap
          </span>
        </div>

        {/* Section Heading */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#101814] max-w-3xl mb-16">
          Carbon claims need evidence.
        </h2>

        {/* Split Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Editorial Statement */}
          <div className="lg:col-span-6 space-y-6">
            <p className="text-xl sm:text-2xl text-[#101814] font-medium leading-relaxed">
              Carbon credits depend on claims about real-world environmental
              impact. When audits occur once every five years, deforestation
              happens in plain sight without consequences.
            </p>
            <p className="text-base text-[#4f6358] leading-relaxed">
              Traditional carbon offset programs rely on manual, intermittent
              site inspections and static paper registries. Once issued, credits
              continue trading indefinitely—even if the underlying forest has
              experienced wildfire, illegal logging, or commercial clearing.
            </p>
            <p className="text-base text-[#4f6358] leading-relaxed">
              TerraVerify adds an independent verification layer by combining
              environmental data, continuous satellite observation, and
              blockchain-based records. If canopy loss is detected, the protocol
              acts immediately.
            </p>

            <div className="pt-6">
              <blockquote className="border-l-3 border-[#38b87c] pl-4 py-2 text-sm sm:text-base text-[#1e4530] font-medium bg-[#eaf2ec]/70 rounded-r-md">
                &ldquo;Trust the carbon claim. Verify it from the ground — and
                from space.&rdquo;
              </blockquote>
            </div>
          </div>

          {/* Right Column: Subtle Technical Visual Comparison */}
          <div className="lg:col-span-6">
            <div className="rounded-xl border border-[#d6dfd9] bg-[#ffffff] p-6 sm:p-8 space-y-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between pb-4 border-b border-[#e2ece5]">
                <span className="text-xs font-mono uppercase tracking-wider text-[#6e8075] font-semibold">
                  Architectural Contrast
                </span>
                <span className="text-xs font-mono text-[#1b7046] font-medium">
                  AUDIT METHODOLOGY
                </span>
              </div>

              {/* Legacy Approach */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#8e9f96]" />
                    <span className="text-sm font-semibold text-[#506359]">
                      Traditional Voluntary Registry
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#8a9b91]">
                    Manual / Opaque
                  </span>
                </div>
                <div className="p-4 rounded-lg bg-[#f8faf9] border border-[#e0eae3] text-xs text-[#5f7368] space-y-2.5 font-mono">
                  <div className="flex justify-between">
                    <span>Audit Cadence:</span>
                    <span className="text-[#101814] font-medium">Every 5–10 years</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Telemetry Verification:</span>
                    <span className="text-[#101814] font-medium">None (Self-reported)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deforestation Response:</span>
                    <span className="text-[#101814] font-medium">Delayed litigation</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Settlement Medium:</span>
                    <span className="text-[#101814] font-medium">Centralized PDF database</span>
                  </div>
                </div>
              </div>

              {/* TerraVerify Approach */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#38b87c]" />
                    <span className="text-sm font-bold text-[#101814]">
                      TerraVerify Verification Layer
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#1b7046] font-semibold">
                    Continuous / Cryptographic
                  </span>
                </div>
                <div className="p-4 rounded-lg bg-[#f0f8f3] border border-[#38b87c]/40 text-xs text-[#1e4530] space-y-2.5 font-mono shadow-xs">
                  <div className="flex justify-between">
                    <span className="text-[#4f6358]">Audit Cadence:</span>
                    <span className="text-[#1b7046] font-bold">
                      Every 5 days (Sentinel-2)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4f6358]">Telemetry Verification:</span>
                    <span className="text-[#1b7046] font-bold">
                      Calibrated NDVI + NIR Bands
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4f6358]">Deforestation Response:</span>
                    <span className="text-[#1b7046] font-bold">
                      Automated Token Freeze
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4f6358]">Settlement Medium:</span>
                    <span className="text-[#101814] font-bold">
                      Solana Token-2022 Hook
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";

export default function ProblemSolutionSection() {
  const [isSeparated, setIsSeparated] = useState(false);
  const [hoveredPanel, setHoveredPanel] = useState<"legacy" | "terra" | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSeparated(entry.isIntersecting);
      },
      {
        threshold: 0.18,
        rootMargin: "-20px 0px -20px 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-20 md:py-32 border-b border-[#d6dfd9] bg-[#f4f5ef] text-[#101814] transition-colors overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Tag */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8f2ec] border border-[#cfe0d5] mb-8 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
          style={{
            transform: isSeparated ? "translate3d(0, 0, 0)" : "translate3d(0, -15px, 0)",
            opacity: isSeparated ? 1 : 0.5,
          }}
        >
          <span className="w-2 h-2 rounded-full bg-[#38b87c]" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#1b7046] font-medium">
            The Verification Gap
          </span>
        </div>

        {/* Section Heading */}
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#101814] max-w-3xl mb-16 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
          style={{
            transform: isSeparated ? "translate3d(0, 0, 0)" : "translate3d(0, 20px, 0)",
            opacity: isSeparated ? 1 : 0.6,
          }}
        >
          Carbon claims need evidence.
        </h2>

        {/* Split Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Editorial Statement */}
          <div
            className="lg:col-span-6 space-y-6 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
            style={{
              transform: isSeparated ? "translate3d(0, 0, 0)" : "translate3d(-30px, 0, 0)",
              opacity: isSeparated ? 1 : 0.5,
            }}
          >
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

            <div
              className="pt-6 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.01]"
            >
              <blockquote className="border-l-3 border-[#38b87c] pl-4 py-2.5 text-sm sm:text-base text-[#1e4530] font-medium bg-[#eaf2ec]/70 rounded-r-md shadow-2xs">
                &ldquo;Trust the carbon claim. Verify it from the ground — and
                from space.&rdquo;
              </blockquote>
            </div>
          </div>

          {/* Right Column: Architectural Contrast Comparison Cards with Two-way Scroll Physics */}
          <div
            className="lg:col-span-6 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
            style={{
              transform: isSeparated ? "translate3d(0, 0, 0)" : "translate3d(30px, 20px, 0)",
              opacity: isSeparated ? 1 : 0.6,
            }}
          >
            <div className="rounded-xl border border-[#d6dfd9] bg-[#ffffff] p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between pb-4 border-b border-[#e2ece5]">
                <span className="text-xs font-mono uppercase tracking-wider text-[#6e8075] font-semibold">
                  Architectural Contrast
                </span>
                <span className="text-xs font-mono text-[#1b7046] font-medium">
                  AUDIT METHODOLOGY
                </span>
              </div>

              {/* Legacy Approach Card */}
              <div
                onMouseEnter={() => setHoveredPanel("legacy")}
                onMouseLeave={() => setHoveredPanel(null)}
                className="space-y-3 p-4 rounded-xl border transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer motion-reduce:transform-none motion-reduce:transition-none"
                style={{
                  transform: hoveredPanel === "legacy"
                    ? "translate3d(0, -6px, 0) rotate(0deg) scale(1.02)"
                    : isSeparated
                    ? "translate3d(0, 0, 0) rotate(-0.8deg) scale(1)"
                    : "translate3d(0, 15px, 0) rotate(-2deg) scale(0.97)",
                  boxShadow: hoveredPanel === "legacy"
                    ? "0 16px 24px -8px rgba(0,0,0,0.08), 0 0 0 1px #d6dfd9"
                    : "0 2px 6px rgba(0,0,0,0.02)",
                  borderColor: hoveredPanel === "legacy" ? "#a8b5ac" : "#e2ece5",
                  backgroundColor: hoveredPanel === "legacy" ? "#fbfcfb" : "#f8faf9",
                  willChange: "transform, box-shadow",
                }}
              >
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
                <div className="p-3.5 rounded-lg bg-[#ffffff] border border-[#e0eae3] text-xs text-[#5f7368] space-y-2 font-mono">
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

              {/* TerraVerify Approach Card */}
              <div
                onMouseEnter={() => setHoveredPanel("terra")}
                onMouseLeave={() => setHoveredPanel(null)}
                className="space-y-3 p-4 rounded-xl border transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer motion-reduce:transform-none motion-reduce:transition-none"
                style={{
                  transform: hoveredPanel === "terra"
                    ? "translate3d(0, -8px, 0) rotate(0deg) scale(1.025)"
                    : isSeparated
                    ? "translate3d(0, 0, 0) rotate(0.8deg) scale(1)"
                    : "translate3d(0, -10px, 0) rotate(2deg) scale(0.97)",
                  boxShadow: hoveredPanel === "terra"
                    ? "0 20px 30px -10px rgba(56,184,124,0.22), 0 0 0 1px #38b87c"
                    : "0 2px 8px rgba(56,184,124,0.06)",
                  borderColor: hoveredPanel === "terra" ? "#38b87c" : "rgba(56, 184, 124, 0.4)",
                  backgroundColor: hoveredPanel === "terra" ? "#effaf3" : "#f0f8f3",
                  willChange: "transform, box-shadow",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#38b87c] animate-pulse" />
                    <span className="text-sm font-bold text-[#101814]">
                      TerraVerify Verification Layer
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#1b7046] font-semibold">
                    Continuous / Cryptographic
                  </span>
                </div>
                <div className="p-3.5 rounded-lg bg-[#ffffff] border border-[#38b87c]/30 text-xs text-[#1e4530] space-y-2 font-mono shadow-xs">
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

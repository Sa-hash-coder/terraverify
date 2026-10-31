"use client";

import React, { useState, useEffect, useRef } from "react";

export default function SolanaSection() {
  const [isSeparated, setIsSeparated] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // Two-way scroll observer: unpack when visible, repack when scrolled past or above
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSeparated(entry.isIntersecting);
      },
      {
        threshold: 0.2,
        rootMargin: "-20px 0px -20px 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const points = [
    {
      title: "Token-2022 Transfer Hooks",
      desc: "Solana's native transfer hook extensions enable smart contracts to intercept every token transfer and verify whether the Oracle reports the parcel as healthy before allowing the swap.",
      spec: "Transfer Hook Program · SPL-Token-2022",
      tilt: -1.2,
      packedOffset: 25,
    },
    {
      title: "High-Throughput Settlement",
      desc: "400ms block times and sub-cent transaction costs make it economically viable to record continuous 5-day satellite passes on-chain without prohibitive gas fees.",
      spec: "400ms Finality · $0.00025 Average Network Fee",
      tilt: 0.9,
      packedOffset: 12,
    },
    {
      title: "Tamper-Resistant Public Proofs",
      desc: "Verification stamps, canopy scores, and retirement burns are queryable by institutional auditors and enterprise buyers directly on the public Solana ledger.",
      spec: "Public Oracle Accounts · Immutable State",
      tilt: -1.0,
      packedOffset: -15,
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-32 border-b border-[#d6dfd9] bg-[#edf1ec] text-[#101814] transition-colors overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-2xl border border-[#d6dfd9] bg-[#ffffff] p-8 sm:p-12 lg:p-16 shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
          style={{
            transform: isSeparated ? "translate3d(0, 0, 0) scale(1)" : "translate3d(0, 20px, 0) scale(0.985)",
            opacity: isSeparated ? 1 : 0.85,
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Heading & Role Explanation */}
            <div
              className="lg:col-span-5 text-left transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
              style={{
                transform: isSeparated ? "translate3d(0, 0, 0)" : "translate3d(-24px, 0, 0)",
                opacity: isSeparated ? 1 : 0.6,
              }}
            >
              {/* Subtle Solana Logo/Mark + Badge */}
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#e8f2ec] border border-[#cfe0d5] text-[#1b7046] text-xs font-mono font-semibold mb-8">
                <svg
                  className="w-4 h-4 text-[#1b7046]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 18h14l2-4H6l-2 4Z" />
                  <path d="M4 6h14l2 4H6L4 6Z" />
                  <path d="M2 12h16l2-4H4l-2 4Z" />
                </svg>
                <span>INFRASTRUCTURE SETTLEMENT LAYER</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#101814] mb-6">
                Why on-chain?
              </h2>

              <p className="text-base text-[#4f6358] leading-relaxed mb-6 font-normal">
                Verification records must be transparent, traceable, and
                difficult to alter. Once an environmental audit is confirmed, no
                centralized registry operator should be able to quietly modify
                the data.
              </p>

              <p className="text-sm text-[#6e8075] leading-relaxed">
                Solana provides the high-performance infrastructure for
                recording verification outcomes efficiently, linking physical
                canopy health directly to on-chain credit availability.
              </p>
            </div>

            {/* Right Column: Key Infrastructure Pillars with Dynamic Fan-out / Repack & Zoom */}
            <div className="lg:col-span-7 space-y-4 relative">
              {points.map((point, idx) => {
                const isHovered = hoveredIdx === idx;
                const isOtherHovered = hoveredIdx !== null && !isHovered;

                // When repacked, cards condense with vertical overlap; when separated, they fan out with signature tilt
                const currentTilt = isHovered ? 0 : isSeparated ? point.tilt : point.tilt * 2;
                const translateY = isHovered ? -8 : isSeparated ? 0 : point.packedOffset;
                const scale = isHovered ? 1.03 : isOtherHovered ? 0.98 : isSeparated ? 1 : 0.96;
                const opacity = isSeparated ? (isOtherHovered ? 0.8 : 1) : 0.45;
                const zIndex = isHovered ? 30 : 10 - idx;

                const transitionDelay = hoveredIdx !== null ? "0ms" : isSeparated ? `${idx * 80}ms` : `${(2 - idx) * 50}ms`;

                return (
                  <div
                    key={point.title}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className="p-6 rounded-xl bg-[#f8faf9] border border-[#d6dfd9] text-left transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer motion-reduce:transform-none motion-reduce:transition-none"
                    style={{
                      transform: `translate3d(0, ${translateY}px, 0) rotate(${currentTilt}deg) scale(${scale})`,
                      opacity,
                      zIndex,
                      boxShadow: isHovered
                        ? "0 20px 30px -10px rgba(27,112,70,0.18), 0 0 0 1px #1b7046"
                        : "0 2px 8px rgba(0,0,0,0.03)",
                      borderColor: isHovered ? "#1b7046" : "#d6dfd9",
                      transitionDelay,
                      willChange: "transform, box-shadow, opacity",
                    }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-base font-bold text-[#101814] flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                            isHovered ? "bg-[#1b7046] scale-125" : "bg-[#8ea597]"
                          }`}
                        />
                        {point.title}
                      </h3>
                      <span className="text-xs font-mono text-[#6e8075] opacity-60">
                        0{idx + 1}
                      </span>
                    </div>

                    <p className="text-sm text-[#4f6358] leading-relaxed mb-3">
                      {point.desc}
                    </p>

                    <div
                      className={`inline-block text-[11px] font-mono px-2.5 py-0.5 rounded border transition-colors duration-300 ${
                        isHovered
                          ? "bg-[#1b7046] text-white border-[#1b7046]"
                          : "text-[#1b7046] bg-[#e8f2ec] border-[#cfe0d5]"
                      }`}
                    >
                      {point.spec}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

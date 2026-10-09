"use client";

import React from "react";

export default function SolanaSection() {
  const points = [
    {
      title: "Token-2022 Transfer Hooks",
      desc: "Solana's native transfer hook extensions enable smart contracts to intercept every token transfer and verify whether the Oracle reports the parcel as healthy before allowing the swap.",
      spec: "Transfer Hook Program · SPL-Token-2022",
    },
    {
      title: "High-Throughput Settlement",
      desc: "400ms block times and sub-cent transaction costs make it economically viable to record continuous 5-day satellite passes on-chain without prohibitive gas fees.",
      spec: "400ms Finality · $0.00025 Average Network Fee",
    },
    {
      title: "Tamper-Resistant Public Proofs",
      desc: "Verification stamps, canopy scores, and retirement burns are queryable by institutional auditors and enterprise buyers directly on the public Solana ledger.",
      spec: "Public Oracle Accounts · Immutable State",
    },
  ];

  return (
    <section className="py-20 md:py-32 border-b border-[#d6dfd9] bg-[#edf1ec] text-[#101814] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[#d6dfd9] bg-[#ffffff] p-8 sm:p-12 lg:p-16 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Heading & Role Explanation */}
            <div className="lg:col-span-5 text-left">
              {/* Subtle Solana Logo/Mark + Badge */}
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#e8f2ec] border border-[#cfe0d5] text-[#1b7046] text-xs font-mono font-semibold mb-8">
                {/* Minimal Solana Monogram in clean monochrome */}
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

            {/* Right Column: Key Infrastructure Pillars */}
            <div className="lg:col-span-7 space-y-4">
              {points.map((point) => (
                <div
                  key={point.title}
                  className="p-6 rounded-xl bg-[#f8faf9] border border-[#d6dfd9] text-left hover:border-[#1b7046]/40 hover:shadow-sm transition-all"
                >
                  <h3 className="text-base font-bold text-[#101814] mb-2">
                    {point.title}
                  </h3>
                  <p className="text-sm text-[#4f6358] leading-relaxed mb-3">
                    {point.desc}
                  </p>
                  <div className="inline-block text-[11px] font-mono text-[#1b7046] bg-[#e8f2ec] px-2.5 py-0.5 rounded border border-[#cfe0d5]">
                    {point.spec}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { smoothScrollTo } from "../../lib/scroll";

export default function FinalCtaSection() {
  return (
    <section className="py-24 md:py-36 border-b border-[#d6dfd9] bg-[#f4f5ef] text-[#101814] relative overflow-hidden transition-colors">
      {/* Subtle topographic / radial atmospheric light */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#38b87c]/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Subtle eyebrow marker */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e8f2ec] border border-[#cfe0d5] text-[#1b7046] text-xs font-mono font-semibold tracking-wide mb-8">
          <span className="w-2 h-2 rounded-full bg-[#38b87c]" />
          <span>RESTORING INTEGRITY TO VOLUNTARY CARBON MARKETS</span>
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#101814] leading-tight mb-6">
          Make every carbon claim easier to trust.
        </h2>

        {/* Supporting text */}
        <p className="text-base sm:text-lg text-[#4f6358] max-w-2xl mx-auto leading-relaxed mb-10">
          Explore environmental evidence. Verify projects. Build a more
          transparent carbon market.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/explorer"
            className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-[#ffffff] bg-[#1b7046] hover:bg-[#155836] rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(27,112,70,0.25)] hover:shadow-[0_6px_20px_rgba(27,112,70,0.35)]"
          >
            <span>Explore TerraVerify</span>
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
            onClick={(e) => smoothScrollTo("how-it-works", e)}
            className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-[#101814] bg-[#ffffff] hover:bg-[#f0f4f1] rounded-lg border border-[#d6dfd9] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>See How Verification Works</span>
          </a>
        </div>
      </div>
    </section>
  );
}

"use client";

import React from "react";

export default function TrustStrip() {
  const signals = [
    {
      title: "Satellite Intelligence",
      detail: "Copernicus Sentinel-2 L2A",
      icon: (
        <svg
          className="w-4 h-4 text-[#38b87c]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2a10 10 0 0 0-7.07 17.07" />
          <path d="M12 22a10 10 0 0 0 7.07-17.07" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      title: "On-Chain Verification",
      detail: "Solana Token-2022 Transfer Hooks",
      icon: (
        <svg
          className="w-4 h-4 text-[#38b87c]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
    },
    {
      title: "Transparent Evidence",
      detail: "Cryptographic Canopy Audits",
      icon: (
        <svg
          className="w-4 h-4 text-[#38b87c]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
    {
      title: "Solana Infrastructure",
      detail: "High-Throughput State Settlement",
      icon: (
        <svg
          className="w-4 h-4 text-[#38b87c]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 18h14l2-4H6l-2 4Z" />
          <path d="M4 6h14l2 4H6L4 6Z" />
        </svg>
      ),
    },
  ];

  return (
    <aside
      className="border-b border-[#162922] bg-[#07130f] py-6 sm:py-8"
      aria-label="Verification Signals"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-center divide-y lg:divide-y-0 lg:divide-x divide-[#162922]">
          {signals.map((signal, index) => (
            <div
              key={signal.title}
              className={`flex items-center gap-3.5 ${
                index > 0 ? "pt-4 lg:pt-0 lg:pl-8" : ""
              }`}
            >
              <div className="w-8 h-8 rounded bg-[#0d1714] border border-[#162922] flex items-center justify-center shrink-0">
                {signal.icon}
              </div>
              <div>
                <div className="text-xs sm:text-sm font-semibold text-[#f4f5ef]">
                  {signal.title}
                </div>
                <div className="text-[11px] font-mono text-[#718078]">
                  {signal.detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

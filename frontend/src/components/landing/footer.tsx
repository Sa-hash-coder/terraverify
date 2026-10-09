"use client";

import React from "react";
import Link from "next/link";
import { smoothScrollTo } from "../../lib/scroll";

export default function LandingFooter() {
  return (
    <footer className="bg-[#050c09] border-t border-[#162922] text-[#8e9f96] py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 pb-12 border-b border-[#162922]">
          {/* Brand & Mission Statement */}
          <div className="md:col-span-5 space-y-4 text-left">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded border border-[#38b87c]/40 bg-[#0d1714] flex items-center justify-center text-[#38b87c]">
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2a10 10 0 0 0-7.07 17.07" />
                  <path d="M12 22a10 10 0 0 0 7.07-17.07" />
                </svg>
              </div>
              <span className="text-base font-semibold tracking-tight text-[#f4f5ef]">
                Terra<span className="text-[#a8c7b5]">Verify</span>
              </span>
            </Link>

            <p className="text-sm font-medium text-[#f4f5ef]">
              Verify the claim. See the evidence.
            </p>

            <p className="text-xs text-[#718078] max-w-sm leading-relaxed">
              TerraVerify connects orbital multispectral observation from Copernicus
              Sentinel-2 to verifiable Solana smart contracts, safeguarding the integrity
              of high-permanence ecological assets.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-[#a8c7b5]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38b87c]" />
              <span>Solana Devnet Cluster · Sentinel-2 Feed Nominal</span>
            </div>
          </div>

          {/* Navigation Links Columns */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8 text-left">
            {/* Column 1: Product */}
            <div>
              <div className="text-xs uppercase font-mono tracking-wider text-[#f4f5ef] font-semibold mb-4">
                Product
              </div>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link href="/explorer" className="hover:text-[#f4f5ef] transition-colors">
                    Satellite Explorer
                  </Link>
                </li>
                <li>
                  <Link href="/marketplace" className="hover:text-[#f4f5ef] transition-colors">
                    Credit Marketplace
                  </Link>
                </li>
                <li>
                  <Link href="/retire" className="hover:text-[#f4f5ef] transition-colors">
                    Retire &amp; Certificates
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-[#f4f5ef] transition-colors">
                    Register Parcel
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Verification */}
            <div>
              <div className="text-xs uppercase font-mono tracking-wider text-[#f4f5ef] font-semibold mb-4">
                Verification
              </div>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <a href="#verification" onClick={(e) => smoothScrollTo("verification", e)} className="hover:text-[#f4f5ef] transition-colors cursor-pointer">
                    Live Telemetry
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" onClick={(e) => smoothScrollTo("how-it-works", e)} className="hover:text-[#f4f5ef] transition-colors cursor-pointer">
                    NDVI Methodology
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" onClick={(e) => smoothScrollTo("how-it-works", e)} className="hover:text-[#f4f5ef] transition-colors cursor-pointer">
                    Canopy Quality (CQS)
                  </a>
                </li>
                <li>
                  <a href="#verification" onClick={(e) => smoothScrollTo("verification", e)} className="hover:text-[#f4f5ef] transition-colors cursor-pointer">
                    Auto-Revocation
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Technology */}
            <div>
              <div className="text-xs uppercase font-mono tracking-wider text-[#f4f5ef] font-semibold mb-4">
                Technology
              </div>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <a href="#technology" className="hover:text-[#f4f5ef] transition-colors">
                    System Architecture
                  </a>
                </li>
                <li>
                  <a href="#technology" className="hover:text-[#f4f5ef] transition-colors">
                    Sentinel-2 L2A
                  </a>
                </li>
                <li>
                  <a href="#technology" className="hover:text-[#f4f5ef] transition-colors">
                    Token-2022 Hooks
                  </a>
                </li>
                <li>
                  <a href="#technology" className="hover:text-[#f4f5ef] transition-colors">
                    Oracle Bridge
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: About */}
            <div>
              <div className="text-xs uppercase font-mono tracking-wider text-[#f4f5ef] font-semibold mb-4">
                About
              </div>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <a href="#about" className="hover:text-[#f4f5ef] transition-colors">
                    Mission
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#f4f5ef] transition-colors"
                  >
                    GitHub Repository
                  </a>
                </li>
                <li>
                  <a
                    href="https://solana.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#f4f5ef] transition-colors"
                  >
                    Solana Ecosystem
                  </a>
                </li>
                <li>
                  <Link href="/explorer" className="hover:text-[#f4f5ef] transition-colors">
                    Contact Protocol
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#718078]">
          <div>
            &copy; {new Date().getFullYear()} TerraVerify Protocol. Built for verifiable climate infrastructure.
          </div>
          <div className="flex items-center gap-4">
            <span>Copernicus Sentinel Data &copy; ESA</span>
            <span>·</span>
            <span>Solana Token-2022</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import WalletDialog from "../wallet/wallet-dialog";
import { smoothScrollTo } from "../../lib/scroll";

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [walletDialogInitialTab, setWalletDialogInitialTab] = useState<"create" | "connect">("create");
  const [localWalletPubkey, setLocalWalletPubkey] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("verification");

  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible: setAdapterModalVisible } = useWalletModal();

  const isWalletConnected = Boolean(connected && publicKey) || Boolean(localWalletPubkey);

  const handleDisconnectWallet = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (connected) {
      try {
        disconnect();
      } catch {}
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("terra_local_wallet");
    }
    setLocalWalletPubkey(null);
    window.dispatchEvent(new Event("storage"));
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);

      const sections = ["about", "technology", "how-it-works", "verification"];
      const scrollPos = window.scrollY + 200;

      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(id);
            return;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const syncLocalWallet = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("terra_local_wallet");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed?.publicKey) {
            setLocalWalletPubkey(parsed.publicKey);
            return;
          }
        } catch {}
      }
      setLocalWalletPubkey(null);
    }
  };

  useEffect(() => {
    syncLocalWallet();
    const handleStorage = () => syncLocalWallet();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [walletDialogOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-colors duration-200 bg-[#f2f5ef]/95 backdrop-blur-md border-b border-[#e1e7de] ${
          scrolled ? "shadow-[0_4px_20px_rgba(0,0,0,0.06)]" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo & Wordmark matching exact uploaded screenshot */}
          <Link
            href="/"
            className="flex items-center gap-3.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0a3d2a] rounded-lg"
            aria-label="TerraVerify Home"
          >
            {/* Circular Logo with "T" monogram and top-right light green satellite accent */}
            <div className="w-8 h-8 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
              <svg
                className="w-8 h-8"
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {/* Light green satellite orbit receiver accent at top right */}
                <path
                  d="M25 10L30 5"
                  stroke="#8bdab6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="30" cy="5" r="1.5" fill="#8bdab6" />

                {/* Dark Green Outer Ring */}
                <circle
                  cx="16"
                  cy="19"
                  r="11.5"
                  stroke="#0a3d2a"
                  strokeWidth="2.2"
                />

                {/* Inner "T" shape */}
                <path
                  d="M9.5 15H22.5M16 15V30"
                  stroke="#0a3d2a"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="flex flex-col text-left">
              <span className="text-[17px] font-bold text-[#0a3d2a] tracking-tight leading-tight">
                TerraVerify
              </span>
              <span className="text-[12px] text-[#5c7366] font-normal leading-tight mt-0.5">
                Earth observation protocol
              </span>
            </div>
          </Link>

          {/* Center Navigation Tabs Container matching Light Eco Theme */}
          <nav
            className="hidden md:flex items-center gap-1.5 bg-[#fafcf8] p-1.5 rounded-2xl border border-[#d8ded4] shadow-[0_1px_4px_rgba(0,0,0,0.03)]"
            aria-label="Main Navigation"
          >
            <a
              href="#how-it-works"
              onClick={(e) => {
                setActiveSection("how-it-works");
                smoothScrollTo("how-it-works", e);
              }}
              className={`text-sm px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeSection === "how-it-works"
                  ? "bg-[#e0ebe2] text-[#0a3d2a] font-semibold shadow-2xs"
                  : "text-[#4a6356] hover:text-[#0a3d2a] font-medium"
              }`}
            >
              How It Works
            </a>
            <a
              href="#verification"
              onClick={(e) => {
                setActiveSection("verification");
                smoothScrollTo("verification", e);
              }}
              className={`text-sm px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeSection === "verification"
                  ? "bg-[#e0ebe2] text-[#0a3d2a] font-semibold shadow-2xs"
                  : "text-[#4a6356] hover:text-[#0a3d2a] font-medium"
              }`}
            >
              Verification
            </a>
            <a
              href="#technology"
              onClick={(e) => {
                setActiveSection("technology");
                smoothScrollTo("technology", e);
              }}
              className={`text-sm px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeSection === "technology"
                  ? "bg-[#e0ebe2] text-[#0a3d2a] font-semibold shadow-2xs"
                  : "text-[#4a6356] hover:text-[#0a3d2a] font-medium"
              }`}
            >
              Technology
            </a>
            <a
              href="#about"
              onClick={(e) => {
                setActiveSection("about");
                smoothScrollTo("about", e);
              }}
              className={`text-sm px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeSection === "about"
                  ? "bg-[#e0ebe2] text-[#0a3d2a] font-semibold shadow-2xs"
                  : "text-[#4a6356] hover:text-[#0a3d2a] font-medium"
              }`}
            >
              About
            </a>
          </nav>

          {/* Right Actions matching Screenshot */}
          <div className="hidden md:flex items-center gap-6">
            {isWalletConnected ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/explorer"
                  className="text-sm font-medium text-[#2d4d3d] hover:text-[#0a3d2a] transition-colors"
                >
                  Explorer
                </Link>

                <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#fafcf8] border border-[#d8ded4] shadow-xs">
                  <button
                    onClick={() => {
                      setWalletDialogInitialTab("connect");
                      setWalletDialogOpen(true);
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-full bg-[#0a3d2a] hover:bg-[#114d36] text-white transition-all flex items-center gap-2 shadow-[0_2px_8px_rgba(10,61,42,0.2)] cursor-pointer"
                    title="Solana Wallet Active"
                  >
                    <svg
                      className="w-3.5 h-3.5 fill-none stroke-current"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                    </svg>
                    <span>
                      {connected && publicKey
                        ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
                        : `${localWalletPubkey?.slice(0, 4)}...${localWalletPubkey?.slice(-4)}`}
                    </span>
                  </button>
                  <button
                    onClick={handleDisconnectWallet}
                    className="px-2.5 py-1.5 text-xs text-[#b91c1c] hover:text-[#991b1b] hover:bg-[#fee2e2] rounded-full transition-colors cursor-pointer mr-1"
                    title="Disconnect wallet"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                {/* 1. Create wallet (Clean text action) */}
                <button
                  onClick={() => {
                    setWalletDialogInitialTab("create");
                    setWalletDialogOpen(true);
                  }}
                  className="text-sm font-medium text-[#2d4d3d] hover:text-[#0a3d2a] transition-colors cursor-pointer px-1 py-1"
                >
                  Create wallet
                </button>

                {/* 2. Connect wallet (Deep Forest Green Pill Button with White Wallet Icon) */}
                <button
                  onClick={() => setAdapterModalVisible(true)}
                  className="px-5 py-2.5 rounded-full bg-[#0a3d2a] hover:bg-[#114d36] text-white font-semibold text-sm transition-all duration-200 flex items-center gap-2 shadow-[0_2px_8px_rgba(10,61,42,0.2)] hover:shadow-[0_4px_14px_rgba(10,61,42,0.3)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <svg
                    className="w-4 h-4 fill-none stroke-current"
                    viewBox="0 0 24 24"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                  </svg>
                  <span>Connect wallet</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Buttons */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={() => {
                if (isWalletConnected) {
                  setWalletDialogInitialTab("connect");
                } else {
                  setWalletDialogInitialTab("create");
                }
                setWalletDialogOpen(true);
              }}
              className="px-3 py-1.5 rounded-full bg-[#0a3d2a] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <svg
                className="w-3.5 h-3.5 fill-none stroke-current"
                viewBox="0 0 24 24"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
              </svg>
              <span>{isWalletConnected ? "Wallet" : "Connect"}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#4a6356] hover:text-[#0a3d2a] rounded-lg border border-[#d8ded4] bg-white focus:outline-none"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {mobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="4" y1="8" x2="20" y2="8" />
                    <line x1="4" y1="16" x2="20" y2="16" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#f2f5ef] border-b border-[#e1e7de] px-6 py-6 space-y-4">
            <nav className="flex flex-col space-y-3 text-sm font-medium text-[#4a6356]">
              <a
                href="#how-it-works"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  setActiveSection("how-it-works");
                  smoothScrollTo("how-it-works", e);
                }}
                className="py-1 hover:text-[#0a3d2a] cursor-pointer"
              >
                How It Works
              </a>
              <a
                href="#verification"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  setActiveSection("verification");
                  smoothScrollTo("verification", e);
                }}
                className="py-1 text-[#0a3d2a] font-semibold cursor-pointer"
              >
                Verification
              </a>
              <a
                href="#technology"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  setActiveSection("technology");
                  smoothScrollTo("technology", e);
                }}
                className="py-1 hover:text-[#0a3d2a] cursor-pointer"
              >
                Technology
              </a>
              <a
                href="#about"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  setActiveSection("about");
                  smoothScrollTo("about", e);
                }}
                className="py-1 hover:text-[#0a3d2a] cursor-pointer"
              >
                About
              </a>
            </nav>
            <div className="pt-4 border-t border-[#e1e7de] flex flex-col gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setWalletDialogInitialTab("create");
                  setWalletDialogOpen(true);
                }}
                className="w-full text-center py-2.5 text-xs font-semibold text-[#0a3d2a] bg-white border border-[#d8ded4] rounded-full"
              >
                Create wallet
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAdapterModalVisible(true);
                }}
                className="w-full text-center py-2.5 text-xs font-semibold text-white bg-[#0a3d2a] hover:bg-[#114d36] rounded-full flex items-center justify-center gap-2 shadow-xs"
              >
                <svg
                  className="w-3.5 h-3.5 fill-none stroke-current"
                  viewBox="0 0 24 24"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                </svg>
                <span>Connect wallet</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Wallet Creation & Connection Dialog Modal */}
      <WalletDialog
        isOpen={walletDialogOpen}
        onClose={() => setWalletDialogOpen(false)}
        hideTabs={!isWalletConnected}
        initialTab={walletDialogInitialTab}
      />
    </>
  );
}

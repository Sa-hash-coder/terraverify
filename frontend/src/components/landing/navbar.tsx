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

      // Scroll spy for active section highlight
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

  // Check if a local wallet was generated and saved
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
        className={`sticky top-0 z-50 w-full transition-colors duration-200 bg-[#06120d]/95 backdrop-blur-md border-b border-[#0f241a] ${
          scrolled ? "shadow-[0_4px_24px_rgba(0,0,0,0.5)]" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo & Wordmark matching Image Theme */}
          <Link
            href="/"
            className="flex items-center gap-3.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2ecc71] rounded-lg"
            aria-label="TerraVerify Home"
          >
            {/* Viewfinder Reticle Icon with Target Center Dot */}
            <div className="w-8 h-8 flex items-center justify-center text-[#2ecc71] shrink-0 group-hover:scale-105 transition-transform duration-200">
              <svg
                className="w-7 h-7"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {/* Top-Left Reticle Corner */}
                <path
                  d="M4 10V7a3 3 0 0 1 3-3h3"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Top-Right Reticle Corner */}
                <path
                  d="M18 4h3a3 3 0 0 1 3 3v3"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Bottom-Right Reticle Corner */}
                <path
                  d="M24 18v3a3 3 0 0 1-3 3h-3"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Bottom-Left Reticle Corner */}
                <path
                  d="M10 24H7a3 3 0 0 1-3-3v-3"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Center Sensor / Target Dot */}
                <circle cx="14" cy="14" r="2.25" fill="currentColor" />
              </svg>
            </div>

            <div className="flex flex-col text-left">
              <span className="text-[17px] font-bold text-white tracking-tight leading-tight">
                TerraVerify
              </span>
              <span className="text-[12px] text-[#8e9f96] font-normal leading-tight mt-0.5">
                Earth observation protocol
              </span>
            </div>
          </Link>

          {/* Center Navigation Pill Container */}
          <nav
            className="hidden md:flex items-center gap-7 bg-[#0a1813]/90 px-8 py-2.5 rounded-full border border-[#163024] shadow-[0_2px_14px_rgba(0,0,0,0.3)] backdrop-blur-md"
            aria-label="Main Navigation"
          >
            <a
              href="#how-it-works"
              onClick={(e) => {
                setActiveSection("how-it-works");
                smoothScrollTo("how-it-works", e);
              }}
              className={`text-sm transition-colors cursor-pointer ${
                activeSection === "how-it-works"
                  ? "font-semibold text-white"
                  : "font-medium text-[#8e9f96] hover:text-white"
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
              className={`text-sm transition-colors cursor-pointer ${
                activeSection === "verification"
                  ? "font-semibold text-white"
                  : "font-medium text-[#8e9f96] hover:text-white"
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
              className={`text-sm transition-colors cursor-pointer ${
                activeSection === "technology"
                  ? "font-semibold text-white"
                  : "font-medium text-[#8e9f96] hover:text-white"
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
              className={`text-sm transition-colors cursor-pointer ${
                activeSection === "about"
                  ? "font-semibold text-white"
                  : "font-medium text-[#8e9f96] hover:text-white"
              }`}
            >
              About
            </a>
          </nav>

          {/* Rightmost Actions matching Screenshot Theme */}
          <div className="hidden md:flex items-center gap-5">
            {isWalletConnected ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/explorer"
                  className="text-sm font-medium text-[#f4f5ef] hover:text-white transition-colors"
                >
                  Explorer
                </Link>

                <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#0a1813] border border-[#163024]">
                  <button
                    onClick={() => {
                      setWalletDialogInitialTab("connect");
                      setWalletDialogOpen(true);
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-full bg-[#2ecc71] hover:bg-[#34d399] text-[#07130f] transition-all flex items-center gap-2 shadow-[0_2px_10px_rgba(46,204,113,0.3)] cursor-pointer"
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
                    className="px-2.5 py-1.5 text-xs text-[#fca5a5] hover:text-[#f87171] hover:bg-[#201818] rounded-full transition-colors cursor-pointer mr-1"
                    title="Disconnect wallet"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-5">
                {/* 1. Create wallet (Text action) */}
                <button
                  onClick={() => {
                    setWalletDialogInitialTab("create");
                    setWalletDialogOpen(true);
                  }}
                  className="text-sm font-medium text-[#f4f5ef] hover:text-white transition-colors cursor-pointer px-1 py-1"
                >
                  Create wallet
                </button>

                {/* 2. Connect wallet (Emerald Pill Button with Wallet Icon) */}
                <button
                  onClick={() => setAdapterModalVisible(true)}
                  className="px-5 py-2.5 rounded-full bg-[#2ecc71] hover:bg-[#34d399] text-[#07130f] font-semibold text-sm transition-all duration-200 flex items-center gap-2.5 shadow-[0_2px_14px_rgba(46,204,113,0.35)] hover:shadow-[0_4px_18px_rgba(46,204,113,0.45)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
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
              className="px-3 py-1.5 rounded-full bg-[#2ecc71] text-[#07130f] font-semibold text-xs flex items-center gap-1.5"
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
              className="p-2 text-[#a8c7b5] hover:text-[#f4f5ef] rounded-lg border border-[#162922] focus:outline-none"
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
          <div className="md:hidden bg-[#06120d] border-b border-[#0f241a] px-6 py-6 space-y-4">
            <nav className="flex flex-col space-y-3 text-sm font-medium text-[#8e9f96]">
              <a
                href="#how-it-works"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  setActiveSection("how-it-works");
                  smoothScrollTo("how-it-works", e);
                }}
                className="py-1 hover:text-white cursor-pointer"
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
                className="py-1 text-white font-semibold cursor-pointer"
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
                className="py-1 hover:text-white cursor-pointer"
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
                className="py-1 hover:text-white cursor-pointer"
              >
                About
              </a>
            </nav>
            <div className="pt-4 border-t border-[#0f241a] flex flex-col gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setWalletDialogInitialTab("create");
                  setWalletDialogOpen(true);
                }}
                className="w-full text-center py-2.5 text-xs font-semibold text-white bg-[#0a1813] border border-[#163024] rounded-full"
              >
                Create wallet
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAdapterModalVisible(true);
                }}
                className="w-full text-center py-2.5 text-xs font-semibold text-[#07130f] bg-[#2ecc71] hover:bg-[#34d399] rounded-full flex items-center justify-center gap-2 shadow-[0_2px_10px_rgba(46,204,113,0.3)]"
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

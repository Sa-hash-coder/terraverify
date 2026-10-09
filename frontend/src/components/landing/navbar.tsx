"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import WalletDialog from "../wallet/wallet-dialog";

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [localWalletPubkey, setLocalWalletPubkey] = useState<string | null>(null);

  const { connected, publicKey } = useWallet();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if a local wallet was generated and saved
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("terra_local_wallet");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed?.publicKey) {
            setLocalWalletPubkey(parsed.publicKey);
          }
        } catch {
          // ignore
        }
      }
    }
  }, [walletDialogOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-colors duration-200 ${
          scrolled
            ? "bg-[#07130f]/95 backdrop-blur-md border-b border-[#162922] shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
            : "bg-[#07130f]/80 backdrop-blur-sm border-b border-[#162922]/60"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo & Wordmark */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38b87c]"
            aria-label="TerraVerify Home"
          >
            {/* Scientific Minimalist Emblem */}
            <div className="w-8 h-8 rounded border border-[#38b87c]/40 bg-[#0d1714] flex items-center justify-center text-[#38b87c] group-hover:border-[#38b87c] transition-colors">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2a10 10 0 0 0-7.07 17.07" />
                <path d="M12 22a10 10 0 0 0 7.07-17.07" />
                <path d="m4.93 4.93 4.24 4.24" />
                <path d="m14.83 14.83 4.24 4.24" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold tracking-tight text-[#f4f5ef]">
                Terra<span className="text-[#a8c7b5]">Verify</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#718078] font-mono leading-none">
                Earth Observation Protocol
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-8 text-sm font-medium text-[#a8c7b5]"
            aria-label="Main Navigation"
          >
            <a
              href="#how-it-works"
              className="hover:text-[#f4f5ef] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#38b87c]"
            >
              How It Works
            </a>
            <a
              href="#verification"
              className="hover:text-[#f4f5ef] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#38b87c]"
            >
              Verification
            </a>
            <a
              href="#technology"
              className="hover:text-[#f4f5ef] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#38b87c]"
            >
              Technology
            </a>
            <a
              href="#about"
              className="hover:text-[#f4f5ef] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#38b87c]"
            >
              About
            </a>
          </nav>

          {/* Action Buttons & Rightmost Wallet Button */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/register"
              className="px-4 py-2 text-xs font-medium text-[#a8c7b5] hover:text-[#f4f5ef] rounded border border-[#162922] hover:border-[#a8c7b5]/40 transition-colors"
            >
              Verify a Project
            </Link>
            <Link
              href="/explorer"
              className="px-4 py-2 text-xs font-semibold text-[#07130f] bg-[#38b87c] hover:bg-[#42cb8a] rounded transition-colors flex items-center gap-1.5 shadow-[0_2px_8px_rgba(56,184,124,0.2)]"
            >
              <span>Launch App</span>
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>

            {/* Rightmost Option: Add or Create a Solana Wallet */}
            <button
              onClick={() => setWalletDialogOpen(true)}
              className={`px-3.5 py-2 text-xs font-mono font-medium rounded-lg border transition-all flex items-center gap-2 ${
                connected && publicKey
                  ? "bg-[#0d1f18] text-[#38b87c] border-[#38b87c]/40 hover:bg-[#122b22]"
                  : localWalletPubkey
                  ? "bg-[#0d1f18] text-[#a8c7b5] border-[#38b87c]/30 hover:border-[#38b87c]"
                  : "bg-[#0d1714] text-[#f4f5ef] border-[#1b352a] hover:border-[#38b87c] hover:bg-[#11231d] shadow-[0_2px_10px_rgba(56,184,124,0.12)]"
              }`}
              title="Add or create a Solana wallet"
            >
              <span className="w-2 h-2 rounded-full bg-[#38b87c] animate-pulse" />
              {connected && publicKey ? (
                <span>
                  {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
                </span>
              ) : localWalletPubkey ? (
                <span>
                  {localWalletPubkey.slice(0, 4)}...{localWalletPubkey.slice(-4)}
                </span>
              ) : (
                <>
                  <svg
                    className="w-3.5 h-3.5 text-[#38b87c]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                  </svg>
                  <span>+ Create Wallet</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile Buttons */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setWalletDialogOpen(true)}
              className="px-2.5 py-1.5 text-xs font-mono rounded bg-[#0d1714] border border-[#1b352a] text-[#38b87c] flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#38b87c]" />
              <span>Wallet</span>
            </button>
            <Link
              href="/explorer"
              className="px-3 py-1.5 text-xs font-semibold text-[#07130f] bg-[#38b87c] rounded"
            >
              App
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#a8c7b5] hover:text-[#f4f5ef] rounded border border-[#162922] focus:outline-none"
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

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a1813] border-b border-[#162922] px-6 py-6 space-y-4">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-[#a8c7b5]">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#f4f5ef]"
            >
              How It Works
            </a>
            <a
              href="#verification"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#f4f5ef]"
            >
              Verification
            </a>
            <a
              href="#technology"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#f4f5ef]"
            >
              Technology
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#f4f5ef]"
            >
              About
            </a>
          </nav>
          <div className="pt-4 border-t border-[#162922] flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setWalletDialogOpen(true);
              }}
              className="w-full text-center py-2.5 text-xs font-mono font-medium text-[#38b87c] bg-[#0d1714] border border-[#38b87c]/30 rounded flex items-center justify-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-[#38b87c]" />
              <span>
                {connected && publicKey
                  ? `Wallet: ${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
                  : localWalletPubkey
                  ? `Wallet: ${localWalletPubkey.slice(0, 4)}...${localWalletPubkey.slice(-4)}`
                  : "+ Create / Connect Wallet"}
              </span>
            </button>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-xs font-medium text-[#a8c7b5] rounded border border-[#162922]"
            >
              Verify a Project
            </Link>
            <Link
              href="/explorer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-xs font-semibold text-[#07130f] bg-[#38b87c] rounded"
            >
              Launch App →
            </Link>
          </div>
        </div>
      )}
    </header>

    {/* Wallet Creation & Connection Dialog Modal */}
    <WalletDialog
      isOpen={walletDialogOpen}
      onClose={() => setWalletDialogOpen(false)}
    />
  </>
  );
}

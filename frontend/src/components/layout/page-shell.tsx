"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import AppHeader from "./app-header";
import WalletDialog from "../wallet/wallet-dialog";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  noScroll?: boolean;
  requireAuth?: boolean;
}

export default function PageShell({
  children,
  className = "",
  fullWidth = false,
  noScroll = false,
  requireAuth = true,
}: PageShellProps) {
  const { connected, publicKey } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [localWalletPubkey, setLocalWalletPubkey] = useState<string | null>(null);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);

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
    setMounted(true);
    syncLocalWallet();

    const handleStorage = () => syncLocalWallet();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const isWalletConnected = Boolean(connected && publicKey) || Boolean(localWalletPubkey);

  return (
    <div
      className={`w-full flex flex-col bg-[var(--bg-app)] text-[var(--text)] antialiased ${
        noScroll ? "h-screen max-h-screen overflow-hidden" : "min-h-dvh"
      }`}
    >
      {/* Top Navigation Header */}
      <AppHeader />

      {/* Main Content Viewport */}
      <main
        className={`flex-1 min-w-0 min-h-0 flex flex-col ${
          noScroll ? "h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-hidden" : "overflow-y-auto"
        } ${
          fullWidth
            ? "p-0"
            : "max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
        } ${className}`}
      >
        {!mounted ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin motion-reduce:animate-none" />
              <span className="text-xs font-mono text-[var(--muted)]">Initializing TerraVerify Protocol...</span>
            </div>
          </div>
        ) : requireAuth && !isWalletConnected ? (
          <section
            aria-labelledby="auth-required-heading"
            className="flex-1 flex items-center justify-center py-16 px-4"
          >
            <div className="max-w-md w-full mx-auto p-8 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] shadow-[0_16px_40px_rgba(0,0,0,0.08)] text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner">
                <svg
                  className="w-8 h-8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>

              <div className="space-y-2">
                <h1
                  id="auth-required-heading"
                  className="text-xl font-bold tracking-tight text-[var(--foreground)]"
                >
                  Wallet Authentication Required
                </h1>
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  TerraVerify is an on-chain Earth observation protocol. You must connect an active Solana wallet or generate a devnet keypair to access this application.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setWalletDialogOpen(true)}
                  className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
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
                    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                  </svg>
                  <span>Connect or Create Wallet</span>
                </button>

                <Link
                  href="/"
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-medium rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors text-center cursor-pointer"
                >
                  Return to Home
                </Link>
              </div>

              <div className="pt-4 border-t border-[var(--border)] text-[11px] font-mono text-[var(--muted)] flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse motion-reduce:animate-none" />
                <span>Supports Phantom, Solflare &amp; In-Browser Devnet Wallets</span>
              </div>
            </div>
          </section>
        ) : (
          children
        )}
      </main>

      <WalletDialog
        isOpen={walletDialogOpen}
        onClose={() => setWalletDialogOpen(false)}
        onSuccess={() => {
          setWalletDialogOpen(false);
          syncLocalWallet();
        }}
      />
    </div>
  );
}

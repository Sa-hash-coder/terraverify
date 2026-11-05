"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Keypair } from "@solana/web3.js";
import {
  Wallet,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  Download,
  Eye,
  EyeOff,
  Droplet,
  Loader2,
  X,
  ArrowRight,
  LogOut,
  Key,
  Sparkles,
} from "lucide-react";

interface CreatedWallet {
  publicKey: string;
  secretKey: number[];
  secretKeyBase58: string;
  balance: number;
  explorerUrl: string;
  createdAt: string;
}

interface WalletDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (publicKey: string) => void;
  initialTab?: "create" | "connect";
  hideTabs?: boolean;
}

export default function WalletDialog({
  isOpen,
  onClose,
  onSuccess,
  initialTab = "connect",
  hideTabs = false,
}: WalletDialogProps) {
  const [mounted, setMounted] = useState(false);
  const { setVisible: setAdapterModalVisible } = useWalletModal();
  const { connected, publicKey, disconnect, select, wallets, connect } = useWallet();
  const { connection } = useConnection();

  const [activeTab, setActiveTab] = useState<"create" | "connect">(initialTab);
  const [isGenerating, setIsGenerating] = useState(false);
  const [connectingAdapter, setConnectingAdapter] = useState<string | null>(null);

  // Active saved wallet (already confirmed & persisted)
  const [savedWallet, setSavedWallet] = useState<CreatedWallet | null>(null);

  // Temporary draft wallet (generated, but NOT yet connected until user confirms)
  const [draftWallet, setDraftWallet] = useState<CreatedWallet | null>(null);

  const [showSecretKey, setShowSecretKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState<"public" | "secret" | null>(null);
  const [airdropLoading, setAirdropLoading] = useState(false);
  const [airdropMsg, setAirdropMsg] = useState<string | null>(null);
  const [adapterBalance, setAdapterBalance] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dispatchWalletUpdate = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("terra_wallet_change"));
    }
  };

  // Sync state when opening dialog
  useEffect(() => {
    if (isOpen) {
      setAirdropMsg(null);
      setActiveTab(initialTab);
      setDraftWallet(null); // Clear any unconfirmed draft

      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("terra_local_wallet");
        if (stored) {
          try {
            setSavedWallet(JSON.parse(stored));
          } catch {
            setSavedWallet(null);
          }
        } else {
          setSavedWallet(null);
        }
      }
    }
  }, [isOpen, initialTab]);

  // Prevent background scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Fetch balance for connected extension wallet
  useEffect(() => {
    let isCancelled = false;
    if (connected && publicKey) {
      connection
        .getBalance(publicKey)
        .then((lamports) => {
          if (!isCancelled) setAdapterBalance(lamports / 1e9);
        })
        .catch(() => {
          if (!isCancelled) setAdapterBalance(null);
        });
    } else {
      setAdapterBalance(null);
    }
    return () => {
      isCancelled = true;
    };
  }, [connected, publicKey, connection]);

  const handleClose = () => {
    setDraftWallet(null); // discard unconfirmed wallet
    setAirdropMsg(null);
    onClose();
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Disconnect / Forget active wallet immediately
  const handleDisconnectAll = () => {
    if (connected) {
      disconnect().catch(() => {});
    }
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("terra_local_wallet");
        localStorage.removeItem("walletName");
      } catch {}
      dispatchWalletUpdate();
    }
    setSavedWallet(null);
    setDraftWallet(null);
    setAirdropMsg(null);
  };

  // Connect extension adapter directly in 1 click (no double modal)
  const handleConnectAdapter = async (walletName: string) => {
    setConnectingAdapter(walletName);
    try {
      select(walletName as any);
      await new Promise((r) => setTimeout(r, 100));
      await connect();
      dispatchWalletUpdate();
      if (onSuccess && publicKey) {
        onSuccess(publicKey.toBase58());
      }
      onClose();
    } catch (err) {
      console.warn("Direct connect failed, opening adapter modal:", err);
      onClose();
      setAdapterModalVisible(true);
    } finally {
      setConnectingAdapter(null);
    }
  };

  // Generate a draft devnet keypair (DOES NOT CONNECT AUTOMATICALLY)
  const handleGenerateDraft = async () => {
    setIsGenerating(true);
    setAirdropMsg(null);
    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", airdrop: true }),
      });
      const data = await res.json();

      let walletData: CreatedWallet;
      if (data.success && data.wallet) {
        walletData = data.wallet;
      } else {
        const kp = Keypair.generate();
        walletData = {
          publicKey: kp.publicKey.toBase58(),
          secretKey: Array.from(kp.secretKey),
          secretKeyBase58: kp.publicKey.toBase58(),
          balance: 1.0,
          explorerUrl: `https://explorer.solana.com/address/${kp.publicKey.toBase58()}?cluster=devnet`,
          createdAt: new Date().toISOString(),
        };
      }

      // Set ONLY as draft - do NOT save to localStorage yet!
      setDraftWallet(walletData);
    } catch {
      try {
        const kp = Keypair.generate();
        const fallbackWallet: CreatedWallet = {
          publicKey: kp.publicKey.toBase58(),
          secretKey: Array.from(kp.secretKey),
          secretKeyBase58: kp.publicKey.toBase58(),
          balance: 1.0,
          explorerUrl: `https://explorer.solana.com/address/${kp.publicKey.toBase58()}?cluster=devnet`,
          createdAt: new Date().toISOString(),
        };
        setDraftWallet(fallbackWallet);
      } catch (err) {
        console.error("Local wallet generation error:", err);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // User explicitly clicks "Confirm & Connect Wallet"
  const handleConfirmConnectDraft = () => {
    if (!draftWallet) return;
    try {
      localStorage.setItem("terra_local_wallet", JSON.stringify(draftWallet));
      dispatchWalletUpdate();
      setSavedWallet(draftWallet);
      setDraftWallet(null);
      if (onSuccess) {
        onSuccess(draftWallet.publicKey);
      }
      onClose();
    } catch (err) {
      console.error("Failed to save wallet:", err);
    }
  };

  // Discard draft without connecting
  const handleDiscardDraft = () => {
    setDraftWallet(null);
  };

  // Request 1 SOL airdrop
  const handleRequestAirdrop = async () => {
    const targetWallet = draftWallet || savedWallet;
    if (!targetWallet) return;
    setAirdropLoading(true);
    setAirdropMsg(null);

    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "airdrop", publicKey: targetWallet.publicKey }),
      });
      const data = await res.json();

      if (data.success) {
        const newBalance = data.balance ?? targetWallet.balance + 1.0;
        const updated = { ...targetWallet, balance: newBalance };
        if (draftWallet) {
          setDraftWallet(updated);
        } else {
          setSavedWallet(updated);
          localStorage.setItem("terra_local_wallet", JSON.stringify(updated));
          dispatchWalletUpdate();
        }
        setAirdropMsg("+1.0 SOL airdropped!");
      } else {
        setAirdropMsg(data.error || "Faucet busy, retry shortly");
      }
    } catch {
      setAirdropMsg("Network request failed");
    } finally {
      setAirdropLoading(false);
    }
  };

  // Copy helper
  const handleCopy = (text: string, type: "public" | "secret") => {
    navigator.clipboard.writeText(text);
    setCopiedKey(type);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Download keypair JSON
  const handleDownloadKeypair = (wallet: CreatedWallet) => {
    const blob = new Blob([JSON.stringify(wallet.secretKey)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `solana-devnet-keypair-${wallet.publicKey.slice(0, 6)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wallet-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop with smooth fade in */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-backdrop-fade cursor-pointer"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Original Sleek Dark Dialogue Window with Pop Up & Zoom Animation */}
      <div className="relative w-full max-w-md bg-[#111312] border border-[#272b28] rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] text-[#f4f4f5] z-10 overflow-hidden flex flex-col animate-modal-zoom">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#1e211f] bg-[#0d0f0e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#18261e] border border-[#23422f] flex items-center justify-center text-[#4ade80]">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h2 id="wallet-modal-title" className="text-sm font-bold text-white tracking-tight">
                {hideTabs ? "Solana Devnet Wallet" : "Connect Solana Wallet"}
              </h2>
              <p className="text-[11px] text-[#71717a] font-mono">Solana Devnet Network</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-[#71717a] hover:text-white hover:bg-[#1c201d] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons (Dark theme) */}
        {!hideTabs && (
          <div className="px-5 pt-3 pb-2 border-b border-[#1e211f] bg-[#0d0f0e]">
            <div className="p-1 rounded-xl bg-[#070908] border border-[#1e2320] flex gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("connect")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                  activeTab === "connect"
                    ? "bg-[#18261e] text-[#4ade80] border border-[#23422f] shadow-xs"
                    : "text-[#8a918d] hover:text-white"
                }`}
              >
                Browser Extension
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("create")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                  activeTab === "create"
                    ? "bg-[#18261e] text-[#4ade80] border border-[#23422f] shadow-xs"
                    : "text-[#8a918d] hover:text-white"
                }`}
              >
                Instant Devnet Keypair
              </button>
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5">
          {activeTab === "connect" && (
            <div className="space-y-4 text-left text-xs">
              {connected && publicKey ? (
                /* Connected via Extension */
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-[11px] text-[#4ade80] bg-[#14231a] px-3 py-2 rounded-xl border border-[#204a30]">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#4ade80]" />
                      Browser Extension Connected
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#161917] border border-[#272b28] space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-[#8a918d]">
                      <span>SOL Balance</span>
                      <span className="font-mono text-sm font-bold text-[#4ade80]">
                        {adapterBalance !== null ? `${adapterBalance.toFixed(3)} SOL` : "—"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] text-[#71717a] font-mono uppercase">Public Address</div>
                      <div className="font-mono text-xs text-[#e4e4e7] bg-[#0c0d0c] p-2.5 rounded-lg border border-[#222623] break-all select-all">
                        {publicKey.toBase58()}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(publicKey.toBase58(), "public")}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#1c201d] hover:bg-[#252b27] border border-[#272b28] text-xs font-semibold text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {copiedKey === "public" ? <Check className="w-3.5 h-3.5 text-[#4ade80]" /> : <Copy className="w-3.5 h-3.5 text-[#8a918d]" />}
                      <span>{copiedKey === "public" ? "Copied" : "Copy Address"}</span>
                    </button>
                    <button
                      onClick={handleDisconnectAll}
                      className="py-2 px-3 rounded-xl bg-[#2a1717] hover:bg-[#3d1e1e] border border-[#522525] text-xs font-semibold text-rose-300 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Disconnect</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (onSuccess) onSuccess(publicKey.toBase58());
                      else onClose();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#1e4632] hover:bg-[#285e43] border border-[#317755] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>Done &amp; Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Not connected: 1-click Direct Extension Connect (no asking twice!) */
                <div className="space-y-3.5">
                  <p className="text-xs text-[#9ca3af] leading-relaxed">
                    Connect an installed Solana browser extension directly to sign transactions:
                  </p>

                  <div className="space-y-2">
                    {wallets && wallets.length > 0 ? (
                      wallets.map((w) => (
                        <button
                          key={w.adapter.name}
                          onClick={() => handleConnectAdapter(w.adapter.name)}
                          disabled={connectingAdapter === w.adapter.name}
                          className="w-full p-3 rounded-xl bg-[#161917] hover:bg-[#1f2420] border border-[#272b28] hover:border-[#38b87c]/50 transition-all flex items-center justify-between cursor-pointer group disabled:opacity-60"
                        >
                          <div className="flex items-center gap-3">
                            {w.adapter.icon ? (
                              <img src={w.adapter.icon} alt={w.adapter.name} className="w-6 h-6 rounded-md" />
                            ) : (
                              <Wallet className="w-5 h-5 text-[#4ade80]" />
                            )}
                            <span className="font-semibold text-white text-xs">{w.adapter.name}</span>
                          </div>
                          <span className="text-[11px] font-bold text-[#4ade80] group-hover:underline">
                            {connectingAdapter === w.adapter.name ? "Connecting..." : "Connect →"}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="p-3 rounded-xl bg-[#161917] border border-[#272b28] text-center text-xs text-[#8a918d]">
                        No installed Solana extension detected in your browser.
                      </div>
                    )}

                    <button
                      onClick={() => {
                        onClose();
                        setAdapterModalVisible(true);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#0f1110] hover:bg-[#181c19] border border-[#272b28] text-[#9ca3af] hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Wallet className="w-4 h-4 text-[#4ade80]" />
                      <span>More Solana Wallets</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-[#1e211f] text-center">
                    <p className="text-[11px] text-[#71717a] mb-2">No browser extension installed?</p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("create")}
                      className="text-xs font-semibold text-[#4ade80] hover:underline cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Key className="w-3.5 h-3.5 text-[#4ade80]" />
                      <span>Use Instant Devnet Keypair instead</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "create" && (
            <div className="space-y-4 text-left text-xs">
              {/* STATE 1: Draft Keypair generated but not yet confirmed */}
              {draftWallet ? (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-[11px] text-[#fbbf24] bg-[#261f0f] px-3 py-2 rounded-xl border border-[#4d3c1c]">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
                      New Devnet Keypair Generated (Draft)
                    </span>
                    <span className="text-[10px] uppercase font-mono tracking-wider">Unconfirmed</span>
                  </div>

                  {/* Balance info */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#161917] border border-[#272b28]">
                    <div>
                      <div className="text-[10px] text-[#71717a] font-mono uppercase">Devnet Balance</div>
                      <div className="font-mono text-sm font-bold text-[#4ade80]">
                        {draftWallet.balance.toFixed(2)} SOL
                      </div>
                    </div>
                    <button
                      onClick={handleRequestAirdrop}
                      disabled={airdropLoading}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#18261e] hover:bg-[#23382c] text-[#4ade80] border border-[#274835] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {airdropLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Droplet className="w-3 h-3" />}
                      <span>+1 SOL Faucet</span>
                    </button>
                  </div>

                  {airdropMsg && (
                    <div className="text-[11px] font-mono text-[#4ade80] bg-[#14231a] px-3 py-1.5 rounded-lg border border-[#204a30] text-center">
                      {airdropMsg}
                    </div>
                  )}

                  {/* Public Key */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#8a918d]">
                      <span>Public Address</span>
                      <button
                        onClick={() => handleCopy(draftWallet.publicKey, "public")}
                        className="text-[#4ade80] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        {copiedKey === "public" ? <Check className="w-3 h-3 text-[#4ade80]" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === "public" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <div className="font-mono text-xs text-[#e4e4e7] bg-[#0c0d0c] p-2.5 rounded-lg border border-[#222623] break-all select-all">
                      {draftWallet.publicKey}
                    </div>
                  </div>

                  {/* Secret Key */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#8a918d]">
                      <span>Private Key</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowSecretKey(!showSecretKey)}
                          className="hover:text-white cursor-pointer flex items-center gap-1 text-[#8a918d]"
                        >
                          {showSecretKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{showSecretKey ? "Hide" : "Show"}</span>
                        </button>
                        {showSecretKey && (
                          <button
                            onClick={() => handleCopy(draftWallet.secretKeyBase58, "secret")}
                            className="text-[#4ade80] hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedKey === "secret" ? "Copied" : "Copy"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="font-mono text-xs text-[#71717a] bg-[#0c0d0c] p-2.5 rounded-lg border border-[#222623] break-all select-all">
                      {showSecretKey ? draftWallet.secretKeyBase58 : "••••••••••••••••••••••••••••••••••••••••••••"}
                    </div>
                  </div>

                  {/* Download Backup */}
                  <div className="pt-0.5">
                    <button
                      onClick={() => handleDownloadKeypair(draftWallet)}
                      className="w-full py-1.5 px-3 rounded-lg bg-[#161917] hover:bg-[#1f2420] border border-[#272b28] text-xs font-semibold text-[#8a918d] hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-[#8a918d]" />
                      <span>Download Keypair JSON (Backup)</span>
                    </button>
                  </div>

                  {/* Explicit Confirmation Buttons - Never Connects Without User Explicit Click */}
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={handleConfirmConnectDraft}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#1e4632] hover:bg-[#285e43] border border-[#317755] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Check className="w-4 h-4 text-[#4ade80]" />
                      <span>Confirm &amp; Connect Wallet</span>
                    </button>
                    <button
                      onClick={handleDiscardDraft}
                      className="py-2.5 px-3.5 rounded-xl bg-[#201818] hover:bg-[#2c1e1e] border border-[#3a2222] text-xs font-semibold text-[#fca5a5] hover:text-white transition-colors cursor-pointer"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              ) : savedWallet ? (
                /* STATE 2: Already has an active, confirmed Devnet keypair */
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-[11px] text-[#4ade80] bg-[#14231a] px-3 py-2 rounded-xl border border-[#204a30]">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#4ade80]" />
                      Devnet Keypair Connected
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
                  </div>

                  {/* Balance & Airdrop row */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#161917] border border-[#272b28]">
                    <div>
                      <div className="text-[10px] text-[#71717a] font-mono uppercase">Devnet Balance</div>
                      <div className="font-mono text-sm font-bold text-[#4ade80]">
                        {savedWallet.balance.toFixed(2)} SOL
                      </div>
                    </div>

                    <button
                      onClick={handleRequestAirdrop}
                      disabled={airdropLoading}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#18261e] hover:bg-[#23382c] text-[#4ade80] border border-[#274835] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {airdropLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Droplet className="w-3.5 h-3.5 text-[#4ade80]" />
                      )}
                      <span>+1 SOL Faucet</span>
                    </button>
                  </div>

                  {airdropMsg && (
                    <div className="text-[11px] font-mono text-[#4ade80] bg-[#14231a] px-3 py-1.5 rounded-lg border border-[#204a30] text-center">
                      {airdropMsg}
                    </div>
                  )}

                  {/* Public Key */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#8a918d]">
                      <span>Public Address</span>
                      <button
                        onClick={() => handleCopy(savedWallet.publicKey, "public")}
                        className="text-[#4ade80] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        {copiedKey === "public" ? <Check className="w-3 h-3 text-[#4ade80]" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === "public" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <div className="font-mono text-xs text-[#e4e4e7] bg-[#0c0d0c] p-2.5 rounded-lg border border-[#222623] break-all select-all">
                      {savedWallet.publicKey}
                    </div>
                  </div>

                  {/* Secret Key */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#8a918d]">
                      <span>Private Key</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowSecretKey(!showSecretKey)}
                          className="hover:text-white cursor-pointer flex items-center gap-1 text-[#8a918d]"
                        >
                          {showSecretKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{showSecretKey ? "Hide" : "Show"}</span>
                        </button>
                        {showSecretKey && (
                          <button
                            onClick={() => handleCopy(savedWallet.secretKeyBase58, "secret")}
                            className="text-[#4ade80] hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedKey === "secret" ? "Copied" : "Copy"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="font-mono text-xs text-[#71717a] bg-[#0c0d0c] p-2.5 rounded-lg border border-[#222623] break-all select-all">
                      {showSecretKey ? savedWallet.secretKeyBase58 : "••••••••••••••••••••••••••••••••••••••••••••"}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-1 flex gap-2">
                    <button
                      onClick={() => handleDownloadKeypair(savedWallet)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-[#161917] hover:bg-[#1f2420] border border-[#272b28] text-xs font-semibold text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-[#8a918d]" />
                      <span>Download id.json</span>
                    </button>
                    <a
                      href={savedWallet.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-3 rounded-lg bg-[#161917] hover:bg-[#1f2420] border border-[#272b28] text-xs font-semibold text-[#8a918d] hover:text-white transition-colors flex items-center gap-1"
                    >
                      <span>Explorer</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Done / Continue & Disconnect */}
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => {
                        if (onSuccess) onSuccess(savedWallet.publicKey);
                        else onClose();
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#1e4632] hover:bg-[#285e43] border border-[#317755] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <span>Done &amp; Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleDisconnectAll}
                      className="py-2.5 px-3 rounded-xl bg-[#2a1717] hover:bg-[#3d1e1e] border border-[#522525] text-xs font-semibold text-rose-300 transition-colors cursor-pointer"
                      title="Disconnect and clear this wallet"
                    >
                      Disconnect
                    </button>
                  </div>

                  <div className="text-center pt-1">
                    <button
                      onClick={handleGenerateDraft}
                      disabled={isGenerating}
                      className="text-[11px] text-[#71717a] hover:text-[#4ade80] transition-colors cursor-pointer"
                    >
                      + Generate Different Keypair
                    </button>
                  </div>
                </div>
              ) : (
                /* STATE 3: No keypair yet - prompt to generate */
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-[#161917] border border-[#272b28] space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-[#4ade80] text-xs">
                      <Key className="w-4 h-4 text-[#4ade80]" />
                      <span>Instant Devnet Testing Keypair</span>
                    </div>
                    <p className="text-[11px] text-[#8a918d] leading-relaxed">
                      Generates a Solana ed25519 keypair and pre-funds it with 1.0 test SOL on Devnet. Perfect for instant trading and verification testing without browser extensions.
                    </p>
                  </div>

                  <button
                    onClick={handleGenerateDraft}
                    disabled={isGenerating}
                    className="w-full py-3 px-4 rounded-xl bg-[#1e4632] hover:bg-[#285e43] border border-[#317755] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Generating &amp; Funding Keypair...</span>
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4" />
                        <span>Generate Devnet Keypair</span>
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setActiveTab("connect")}
                      className="text-[11px] text-[#71717a] hover:text-[#4ade80] transition-colors cursor-pointer"
                    >
                      Or connect an existing browser extension →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#0d0f0e] border-t border-[#1e211f] flex items-center justify-between text-[11px] text-[#71717a]">
          <span>Non-custodial Solana Devnet</span>
          <button
            onClick={handleClose}
            className="hover:text-white transition-colors cursor-pointer font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

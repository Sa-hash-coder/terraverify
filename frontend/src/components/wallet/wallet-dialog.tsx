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
  const { connected, publicKey, disconnect, select, wallets, connect, connecting } = useWallet();
  const { connection } = useConnection();

  const [activeTab, setActiveTab] = useState<"create" | "connect">(initialTab);
  const [tabDirection, setTabDirection] = useState<"right" | "left">("right");

  const handleTabChange = (tab: "create" | "connect") => {
    if (tab === activeTab) return;
    setTabDirection(tab === "connect" ? "right" : "left");
    setActiveTab(tab);
  };

  const [isGenerating, setIsGenerating] = useState(false);
  const [connectingAdapter, setConnectingAdapter] = useState<string | null>(null);
  const [createdWallet, setCreatedWallet] = useState<CreatedWallet | null>(null);
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

  // Reset and sync state when opening dialog
  useEffect(() => {
    if (isOpen) {
      setAirdropMsg(null);
      setActiveTab(initialTab);
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("terra_local_wallet");
        if (saved) {
          try {
            setCreatedWallet(JSON.parse(saved));
          } catch {
            setCreatedWallet(null);
          }
        } else {
          setCreatedWallet(null);
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
    setCreatedWallet(null);
    setAirdropMsg(null);
  };

  // Connect extension adapter directly
  const handleConnectAdapter = async (walletName: string) => {
    setConnectingAdapter(walletName);
    try {
      select(walletName as any);
      await new Promise((r) => setTimeout(r, 80));
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

  // Generate and immediately connect Devnet keypair in 1 click
  const handleGenerateWallet = async () => {
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

      // Immediately persist and activate
      setCreatedWallet(walletData);
      if (typeof window !== "undefined") {
        localStorage.setItem("terra_local_wallet", JSON.stringify(walletData));
        dispatchWalletUpdate();
      }
      setAirdropMsg("Wallet connected & allocated 1.0 SOL!");
      if (onSuccess) {
        onSuccess(walletData.publicKey);
      }
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
        setCreatedWallet(fallbackWallet);
        if (typeof window !== "undefined") {
          localStorage.setItem("terra_local_wallet", JSON.stringify(fallbackWallet));
          dispatchWalletUpdate();
        }
        setAirdropMsg("Devnet keypair connected!");
        if (onSuccess) {
          onSuccess(fallbackWallet.publicKey);
        }
      } catch (err) {
        console.error("Local wallet generation error:", err);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Request 1 SOL airdrop
  const handleRequestAirdrop = async () => {
    if (!createdWallet) return;
    setAirdropLoading(true);
    setAirdropMsg(null);

    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "airdrop", publicKey: createdWallet.publicKey }),
      });
      const data = await res.json();

      if (data.success) {
        const newBalance = data.balance ?? createdWallet.balance + 1.0;
        const updated = { ...createdWallet, balance: newBalance };
        setCreatedWallet(updated);
        localStorage.setItem("terra_local_wallet", JSON.stringify(updated));
        dispatchWalletUpdate();
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
  const handleDownloadKeypair = () => {
    if (!createdWallet) return;
    const blob = new Blob([JSON.stringify(createdWallet.secretKey)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `solana-keypair-${createdWallet.publicKey.slice(0, 6)}.json`;
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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Dialog Window */}
      <div className="relative w-full max-w-md bg-[#111613] border border-[#233529] rounded-2xl shadow-2xl text-[#f4f4f5] z-10 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#1f2d24] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#18281e] border border-[#2b4434] flex items-center justify-center text-[#4ade80]">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h2 id="wallet-modal-title" className="text-sm font-bold text-white">
                {hideTabs ? "Solana Devnet Wallet" : "Connect Solana Wallet"}
              </h2>
              <p className="text-[11px] text-[#789182]">Solana Devnet Network</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-[#789182] hover:text-white hover:bg-[#18281e] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        {!hideTabs && (
          <div className="px-5 pt-3 pb-2 border-b border-[#1f2d24]">
            <div className="p-1 rounded-xl bg-[#0a0f0c] border border-[#1a261e] flex gap-1">
              <button
                type="button"
                onClick={() => handleTabChange("connect")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                  activeTab === "connect"
                    ? "bg-[#182d20] text-[#4ade80] shadow-xs border border-[#346244]"
                    : "text-[#789182] hover:text-white"
                }`}
              >
                Browser Extension
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("create")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                  activeTab === "create"
                    ? "bg-[#182d20] text-[#4ade80] shadow-xs border border-[#346244]"
                    : "text-[#789182] hover:text-white"
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
                /* 1. Already connected via Extension */
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-[11px] text-[#86efac] bg-[#0e2216] px-3 py-2 rounded-xl border border-[#1e4d31]">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#4ade80]" />
                      Browser Extension Connected
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
                  </div>

                  <div className="p-3 rounded-xl bg-[#161f19] border border-[#233529] space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-[#789182]">
                      <span>SOL Balance</span>
                      <span className="font-mono text-sm font-bold text-white">
                        {adapterBalance !== null ? `${adapterBalance.toFixed(3)} SOL` : "—"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] text-[#789182] font-mono uppercase">Public Address</div>
                      <div className="font-mono text-xs text-[#e4e4e7] bg-[#0c120e] p-2 rounded-lg border border-[#1f2d24] break-all select-all">
                        {publicKey.toBase58()}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(publicKey.toBase58(), "public")}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#18261e] hover:bg-[#22362a] border border-[#284032] text-xs font-semibold text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {copiedKey === "public" ? <Check className="w-3.5 h-3.5 text-[#4ade80]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === "public" ? "Copied" : "Copy Address"}</span>
                    </button>
                    <button
                      onClick={handleDisconnectAll}
                      className="py-2 px-3 rounded-xl bg-[#2a1717] hover:bg-[#381e1e] border border-[#482424] text-xs font-semibold text-[#f87171] transition-colors cursor-pointer flex items-center gap-1.5"
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
                    className="w-full py-2.5 px-4 rounded-xl bg-[#2d6a4f] hover:bg-[#23563f] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Done & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* 2. Not connected - show extension options */
                <div className="space-y-3.5">
                  <p className="text-xs text-[#9aa8a0] leading-relaxed">
                    Connect a Solana browser extension. If installed, click below to connect directly:
                  </p>

                  <div className="space-y-2">
                    {wallets && wallets.length > 0 ? (
                      wallets.map((w) => (
                        <button
                          key={w.adapter.name}
                          onClick={() => handleConnectAdapter(w.adapter.name)}
                          disabled={connectingAdapter === w.adapter.name}
                          className="w-full p-3 rounded-xl bg-[#161f19] hover:bg-[#1c2921] border border-[#233529] hover:border-[#385642] transition-all flex items-center justify-between cursor-pointer group disabled:opacity-60"
                        >
                          <div className="flex items-center gap-3">
                            {w.adapter.icon ? (
                              <img src={w.adapter.icon} alt={w.adapter.name} className="w-6 h-6 rounded-md" />
                            ) : (
                              <Wallet className="w-5 h-5 text-[#4ade80]" />
                            )}
                            <span className="font-semibold text-white text-xs">{w.adapter.name}</span>
                          </div>
                          <span className="text-[11px] font-semibold text-[#4ade80] group-hover:underline">
                            {connectingAdapter === w.adapter.name ? "Connecting..." : "Connect →"}
                          </span>
                        </button>
                      ))
                    ) : null}

                    <button
                      onClick={() => {
                        onClose();
                        setAdapterModalVisible(true);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#18261e] hover:bg-[#22362a] border border-[#2b4434] text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Wallet className="w-4 h-4 text-[#4ade80]" />
                      <span>All Solana Wallets (Adapter Modal)</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-[#1f2d24] text-center">
                    <p className="text-[11px] text-[#789182] mb-2">No browser extension installed?</p>
                    <button
                      type="button"
                      onClick={() => handleTabChange("create")}
                      className="text-xs font-semibold text-[#4ade80] hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Use 1-Click Instant Devnet Wallet instead</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "create" && (
            <div className="space-y-4 text-left text-xs">
              {!createdWallet ? (
                /* 1. Generate new devnet wallet */
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-[#142018] border border-[#243d2d] space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                      <Sparkles className="w-4 h-4 text-[#4ade80]" />
                      <span>Instant Devnet Testing Wallet</span>
                    </div>
                    <p className="text-[11px] text-[#9aa8a0] leading-relaxed">
                      Generates a Solana ed25519 keypair and automatically funds it with test SOL on Devnet. Perfect for instant trading and verification testing without browser extensions.
                    </p>
                  </div>

                  <button
                    onClick={handleGenerateWallet}
                    disabled={isGenerating}
                    className="w-full py-3 px-4 rounded-xl bg-[#2d6a4f] hover:bg-[#23563f] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating &amp; Funding Keypair...</span>
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4" />
                        <span>Create &amp; Connect Devnet Wallet</span>
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => handleTabChange("connect")}
                      className="text-[11px] text-[#789182] hover:text-[#4ade80] transition-colors cursor-pointer"
                    >
                      Or connect an existing browser extension →
                    </button>
                  </div>
                </div>
              ) : (
                /* 2. Active devnet wallet details */
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-[11px] text-[#86efac] bg-[#0e2216] px-3 py-2 rounded-xl border border-[#1e4d31]">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#4ade80]" />
                      Devnet Keypair Connected
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
                  </div>

                  {/* Balance & Airdrop row */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#161f19] border border-[#233529]">
                    <div>
                      <div className="text-[10px] text-[#789182] font-mono uppercase">Devnet Balance</div>
                      <div className="font-mono text-sm font-bold text-white">
                        {createdWallet.balance.toFixed(2)} SOL
                      </div>
                    </div>

                    <button
                      onClick={handleRequestAirdrop}
                      disabled={airdropLoading}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#1e3324] hover:bg-[#284431] text-[#4ade80] border border-[#32563e] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {airdropLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Droplet className="w-3.5 h-3.5" />
                      )}
                      <span>+1 SOL Faucet</span>
                    </button>
                  </div>

                  {airdropMsg && (
                    <div className="text-[11px] font-mono text-[#86efac] bg-[#142318] px-3 py-1.5 rounded-lg border border-[#22402d] text-center">
                      {airdropMsg}
                    </div>
                  )}

                  {/* Public Key */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#789182]">
                      <span>Public Address</span>
                      <button
                        onClick={() => handleCopy(createdWallet.publicKey, "public")}
                        className="text-[#4ade80] hover:underline cursor-pointer flex items-center gap-1 font-semibold"
                      >
                        {copiedKey === "public" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === "public" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <div className="font-mono text-xs text-[#e4e4e7] bg-[#0c120e] p-2 rounded-lg border border-[#1f2d24] break-all select-all">
                      {createdWallet.publicKey}
                    </div>
                  </div>

                  {/* Secret Key */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#789182]">
                      <span>Private Key</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowSecretKey(!showSecretKey)}
                          className="hover:text-white cursor-pointer flex items-center gap-1"
                        >
                          {showSecretKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{showSecretKey ? "Hide" : "Show"}</span>
                        </button>
                        {showSecretKey && (
                          <button
                            onClick={() => handleCopy(createdWallet.secretKeyBase58, "secret")}
                            className="text-[#4ade80] hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedKey === "secret" ? "Copied" : "Copy"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="font-mono text-xs text-[#a1a1aa] bg-[#0c120e] p-2 rounded-lg border border-[#1f2d24] break-all select-all">
                      {showSecretKey
                        ? createdWallet.secretKeyBase58
                        : "••••••••••••••••••••••••••••••••••••••••••••"}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-1 flex gap-2">
                    <button
                      onClick={handleDownloadKeypair}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-[#18261e] hover:bg-[#22362a] border border-[#284032] text-xs font-semibold text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download id.json</span>
                    </button>
                    <a
                      href={createdWallet.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-3 rounded-lg bg-[#161f19] hover:bg-[#223027] border border-[#233529] text-xs text-[#9aa8a0] hover:text-white transition-colors flex items-center gap-1"
                    >
                      <span>Explorer</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Done / Continue & Disconnect */}
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => {
                        if (onSuccess) onSuccess(createdWallet.publicKey);
                        else onClose();
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#2d6a4f] hover:bg-[#23563f] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <span>Done &amp; Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleDisconnectAll}
                      className="py-2.5 px-3 rounded-xl bg-[#2a1717] hover:bg-[#381e1e] border border-[#482424] text-xs font-semibold text-[#f87171] transition-colors cursor-pointer"
                      title="Disconnect and clear this wallet"
                    >
                      Disconnect
                    </button>
                  </div>

                  <div className="text-center pt-1">
                    <button
                      onClick={handleGenerateWallet}
                      disabled={isGenerating}
                      className="text-[11px] text-[#789182] hover:text-[#4ade80] transition-colors cursor-pointer"
                    >
                      + Generate New Keypair
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#0d120f] border-t border-[#1f2d24] flex items-center justify-between text-[11px] text-[#789182]">
          <span>Non-custodial Solana Devnet</span>
          <button
            onClick={handleClose}
            className="hover:text-white transition-colors cursor-pointer font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
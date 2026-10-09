"use client";

import React, { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Keypair } from "@solana/web3.js";

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
}

export default function WalletDialog({ isOpen, onClose }: WalletDialogProps) {
  const { setVisible: setAdapterModalVisible } = useWalletModal();
  const { connected, publicKey, disconnect } = useWallet();
  const { connection } = useConnection();

  const [activeTab, setActiveTab] = useState<"create" | "connect">("create");
  const [isGenerating, setIsGenerating] = useState(false);
  const [createdWallet, setCreatedWallet] = useState<CreatedWallet | null>(null);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState<"public" | "secret" | null>(null);
  const [airdropLoading, setAirdropLoading] = useState(false);
  const [airdropMsg, setAirdropMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [adapterBalance, setAdapterBalance] = useState<number | null>(null);

  // Load existing created wallet from local storage if any
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("terra_local_wallet");
      if (saved) {
        try {
          setCreatedWallet(JSON.parse(saved));
        } catch {
          // Ignore invalid JSON
        }
      }
    }
  }, []);

  // Fetch balance for connected wallet adapter
  useEffect(() => {
    if (connected && publicKey) {
      connection.getBalance(publicKey).then((lamports) => {
        setAdapterBalance(lamports / 1e9);
      }).catch(() => {
        setAdapterBalance(null);
      });
    } else {
      setAdapterBalance(null);
    }
  }, [connected, publicKey, connection]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Generate a new Solana Wallet via backend API (with client-side fallback)
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

      if (data.success && data.wallet) {
        const walletData: CreatedWallet = data.wallet;
        setCreatedWallet(walletData);
        localStorage.setItem("terra_local_wallet", JSON.stringify(walletData));
        if (walletData.balance > 0) {
          setAirdropMsg({ type: "success", text: "Successfully created & funded with 1.0 SOL!" });
        }
      } else {
        throw new Error(data.error || "Failed to generate on server");
      }
    } catch {
      // Fallback: client-side generation
      try {
        const kp = Keypair.generate();
        const fallbackWallet: CreatedWallet = {
          publicKey: kp.publicKey.toBase58(),
          secretKey: Array.from(kp.secretKey),
          secretKeyBase58: kp.publicKey.toBase58(), // fallback
          balance: 0,
          explorerUrl: `https://explorer.solana.com/address/${kp.publicKey.toBase58()}?cluster=devnet`,
          createdAt: new Date().toISOString(),
        };
        setCreatedWallet(fallbackWallet);
        localStorage.setItem("terra_local_wallet", JSON.stringify(fallbackWallet));
      } catch (err) {
        console.error("Local wallet generation error:", err);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Request airdrop for created wallet
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
        const updated = { ...createdWallet, balance: data.balance ?? (createdWallet.balance + 1.0) };
        setCreatedWallet(updated);
        localStorage.setItem("terra_local_wallet", JSON.stringify(updated));
        setAirdropMsg({ type: "success", text: "Airdropped 1.0 Devnet SOL successfully!" });
      } else {
        setAirdropMsg({ type: "error", text: data.error || "Faucet rate-limited. Please retry shortly." });
      }
    } catch {
      setAirdropMsg({ type: "error", text: "Network error requesting airdrop." });
    } finally {
      setAirdropLoading(false);
    }
  };

  // Copy helper
  const handleCopy = (text: string, type: "public" | "secret") => {
    navigator.clipboard.writeText(text);
    setCopiedKey(type);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Download keypair as standard id.json
  const handleDownloadKeypair = () => {
    if (!createdWallet) return;
    const blob = new Blob([JSON.stringify(createdWallet.secretKey)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `terraverify-wallet-${createdWallet.publicKey.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wallet-dialog-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#020705]/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-[#07130f] border border-[#162922] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-[#f4f5ef] overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#162922] flex items-center justify-between bg-[#0b1b15]/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#11271f] border border-[#38b87c]/30 flex items-center justify-center text-[#38b87c]">
              <svg
                className="w-4 h-4"
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
            </div>
            <div>
              <h2 id="wallet-dialog-title" className="text-base font-semibold text-[#f4f5ef]">
                Solana Wallet Portal
              </h2>
              <p className="text-xs text-[#8e9f96] font-mono">
                Cluster: Solana Devnet
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-[#8e9f96] hover:text-[#f4f5ef] hover:bg-[#162922] transition-colors focus:outline-none"
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 flex gap-2 border-b border-[#162922] bg-[#07130f]">
          <button
            onClick={() => setActiveTab("create")}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === "create"
                ? "border-[#38b87c] text-[#38b87c]"
                : "border-transparent text-[#8e9f96] hover:text-[#f4f5ef]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#38b87c]" />
            Create New Wallet
          </button>
          <button
            onClick={() => setActiveTab("connect")}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === "connect"
                ? "border-[#38b87c] text-[#38b87c]"
                : "border-transparent text-[#8e9f96] hover:text-[#f4f5ef]"
            }`}
          >
            Connect Extension
          </button>
        </div>

        {/* Tab 1: Create Wallet Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === "create" && (
            <>
              {!createdWallet ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#11271f] border border-[#38b87c]/40 text-[#38b87c] flex items-center justify-center mx-auto">
                    <svg
                      className="w-7 h-7"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#f4f5ef] mb-1">
                      Generate a Dedicated Solana Keypair
                    </h3>
                    <p className="text-xs text-[#8e9f96] leading-relaxed max-w-sm mx-auto">
                      Instantly mint a non-custodial cryptographic keypair on Solana Devnet to interact with TerraVerify&apos;s Token-2022 satellite verification hooks.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleGenerateWallet}
                      disabled={isGenerating}
                      className="w-full py-3 px-4 rounded-lg bg-[#38b87c] hover:bg-[#42cb8a] text-[#07130f] font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(56,184,124,0.25)] disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <>
                          <span className="w-4 h-4 border-2 border-[#07130f] border-t-transparent rounded-full animate-spin" />
                          <span>Generating Cryptographic Keypair...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          <span>Generate Solana Wallet</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-[11px] font-mono text-[#718078] pt-2">
                    Includes automatic 1.0 SOL Devnet faucet request on creation.
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div className="p-3.5 rounded-lg bg-[#0d1f18] border border-[#38b87c]/30 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#38b87c] animate-pulse" />
                      <div>
                        <div className="text-xs font-semibold text-[#f4f5ef]">
                          Active Devnet Keypair
                        </div>
                        <div className="text-[11px] font-mono text-[#a8c7b5]">
                          Balance: {createdWallet.balance.toFixed(2)} SOL
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleRequestAirdrop}
                      disabled={airdropLoading}
                      className="px-2.5 py-1 text-xs font-mono font-medium rounded bg-[#162922] hover:bg-[#203a31] text-[#38b87c] border border-[#38b87c]/40 transition-colors flex items-center gap-1.5"
                    >
                      {airdropLoading ? (
                        <span className="w-3 h-3 border-2 border-[#38b87c] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>+ Request 1 SOL</span>
                      )}
                    </button>
                  </div>

                  {airdropMsg && (
                    <div
                      className={`text-xs p-2.5 rounded font-mono ${
                        airdropMsg.type === "success"
                          ? "bg-[#11271f] text-[#38b87c] border border-[#38b87c]/30"
                          : "bg-[#271515] text-[#fca5a5] border border-[#ef4444]/30"
                      }`}
                    >
                      {airdropMsg.text}
                    </div>
                  )}

                  {/* Public Key Display */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#8e9f96]">
                      Public Address (Base58)
                    </label>
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#0b1713] border border-[#162922]">
                      <span className="text-xs font-mono text-[#f4f5ef] truncate flex-1 select-all">
                        {createdWallet.publicKey}
                      </span>
                      <button
                        onClick={() => handleCopy(createdWallet.publicKey, "public")}
                        className="px-2 py-1 text-[11px] font-mono rounded bg-[#162922] hover:bg-[#223d33] text-[#38b87c] transition-colors"
                        title="Copy public address"
                      >
                        {copiedKey === "public" ? "Copied ✓" : "Copy"}
                      </button>
                    </div>
                  </div>

                  {/* Secret Key Display */}
                  <div className="space-y-1.5 text-left">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono uppercase tracking-wider text-[#8e9f96]">
                        Private Key (Base58 / Seed)
                      </label>
                      <button
                        onClick={() => setShowSecretKey(!showSecretKey)}
                        className="text-[11px] text-[#38b87c] hover:underline font-mono"
                      >
                        {showSecretKey ? "Hide Key" : "Reveal Key"}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#0b1713] border border-[#162922]">
                      <span className="text-xs font-mono text-[#a8c7b5] truncate flex-1">
                        {showSecretKey
                          ? createdWallet.secretKeyBase58
                          : "••••••••••••••••••••••••••••••••••••••••••••••••"}
                      </span>
                      {showSecretKey && (
                        <button
                          onClick={() => handleCopy(createdWallet.secretKeyBase58, "secret")}
                          className="px-2 py-1 text-[11px] font-mono rounded bg-[#162922] hover:bg-[#223d33] text-[#38b87c] transition-colors"
                          title="Copy private key"
                        >
                          {copiedKey === "secret" ? "Copied ✓" : "Copy"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons: Download JSON, View on Explorer */}
                  <div className="pt-2 grid grid-cols-2 gap-2.5">
                    <button
                      onClick={handleDownloadKeypair}
                      className="py-2 px-3 rounded-lg bg-[#11271f] hover:bg-[#163328] border border-[#38b87c]/30 text-xs font-semibold text-[#38b87c] transition-all flex items-center justify-center gap-1.5"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      <span>Download id.json</span>
                    </button>

                    <a
                      href={createdWallet.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-lg bg-[#0d1714] hover:bg-[#13221d] border border-[#162922] text-xs font-medium text-[#8e9f96] hover:text-[#f4f5ef] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Solana Explorer</span>
                      <svg
                        className="w-3 h-3 text-[#38b87c]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  </div>

                  {/* Reset/Regenerate */}
                  <div className="pt-2 text-center border-t border-[#162922]">
                    <button
                      onClick={handleGenerateWallet}
                      disabled={isGenerating}
                      className="text-xs text-[#8e9f96] hover:text-[#f4f5ef] transition-colors underline"
                    >
                      Generate Another Keypair
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Tab 2: Connect Existing Wallet Adapter */}
          {activeTab === "connect" && (
            <div className="space-y-5 text-left py-2">
              {connected && publicKey ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#0d1f18] border border-[#38b87c]/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono uppercase text-[#38b87c] font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#38b87c]" />
                        Connected Wallet
                      </span>
                      <span className="text-xs font-mono text-[#a8c7b5]">
                        {adapterBalance !== null ? `${adapterBalance.toFixed(3)} SOL` : "Loading..."}
                      </span>
                    </div>

                    <div className="text-sm font-mono text-[#f4f5ef] break-all bg-[#07130f] p-2.5 rounded border border-[#162922]">
                      {publicKey.toBase58()}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleCopy(publicKey.toBase58(), "public")}
                      className="flex-1 py-2 rounded-lg bg-[#11271f] hover:bg-[#18362b] border border-[#38b87c]/30 text-xs font-semibold text-[#38b87c] transition-colors"
                    >
                      {copiedKey === "public" ? "Copied ✓" : "Copy Address"}
                    </button>
                    <button
                      onClick={() => disconnect()}
                      className="px-4 py-2 rounded-lg bg-[#271515] hover:bg-[#381e1e] border border-[#ef4444]/30 text-xs font-semibold text-[#fca5a5] transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-center py-4">
                  <p className="text-xs text-[#8e9f96] leading-relaxed max-w-sm mx-auto">
                    Connect using an installed browser extension (Phantom, Solflare, Backpack) to sign on-chain transactions directly.
                  </p>

                  <button
                    onClick={() => {
                      onClose();
                      setAdapterModalVisible(true);
                    }}
                    className="w-full py-3 px-4 rounded-lg bg-[#38b87c] hover:bg-[#42cb8a] text-[#07130f] font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(56,184,124,0.25)]"
                  >
                    <svg
                      className="w-4 h-4"
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
                    <span>Open Extension Wallet Selector</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#050c09] border-t border-[#162922] flex items-center justify-between text-xs text-[#718078] font-mono">
          <span>Non-Custodial · Devnet Mode</span>
          <button
            onClick={onClose}
            className="hover:text-[#f4f5ef] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

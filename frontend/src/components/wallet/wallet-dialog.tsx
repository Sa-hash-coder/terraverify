"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  onSuccess?: (publicKey: string) => void;
  initialTab?: "create" | "connect";
  hideTabs?: boolean;
}

export default function WalletDialog({
  isOpen,
  onClose,
  onSuccess,
  initialTab = "create",
  hideTabs = false,
}: WalletDialogProps) {
  const [mounted, setMounted] = useState(false);
  const { setVisible: setAdapterModalVisible } = useWalletModal();
  const { connected, publicKey, disconnect } = useWallet();
  const { connection } = useConnection();

  const [activeTab, setActiveTab] = useState<"create" | "connect">(initialTab);
  const [tabDirection, setTabDirection] = useState<"right" | "left">("right");

  const handleTabChange = (tab: "create" | "connect") => {
    if (tab === activeTab) return;
    setTabDirection(tab === "connect" ? "right" : "left");
    setActiveTab(tab);
  };

  const [isGenerating, setIsGenerating] = useState(false);
  const [createdWallet, setCreatedWallet] = useState<CreatedWallet | null>(null);
  const [draftWallet, setDraftWallet] = useState<CreatedWallet | null>(null);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState<"public" | "secret" | null>(null);
  const [airdropLoading, setAirdropLoading] = useState(false);
  const [airdropMsg, setAirdropMsg] = useState<string | null>(null);
  const [adapterBalance, setAdapterBalance] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset draft wallet and active tab when opening dialog
  useEffect(() => {
    if (isOpen) {
      setDraftWallet(null);
      setAirdropMsg(null);
      setActiveTab(initialTab);
      // Sync stored wallet
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

  const handleClose = () => {
    setDraftWallet(null);
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

  // Disconnect / Forget active wallet
  const handleDisconnectAll = async () => {
    if (connected) {
      try {
        await disconnect();
      } catch {}
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("terra_local_wallet");
    }
    setCreatedWallet(null);
    setDraftWallet(null);
    window.dispatchEvent(new Event("storage"));
  };

  // Generate wallet into draft state ONLY - DO NOT commit to localStorage until confirmed
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
        setDraftWallet(walletData);
        if (walletData.balance > 0) {
          setAirdropMsg("Funded with 1.0 SOL");
        }
      } else {
        throw new Error(data.error || "Failed on server");
      }
    } catch {
      try {
        const kp = Keypair.generate();
        const fallbackWallet: CreatedWallet = {
          publicKey: kp.publicKey.toBase58(),
          secretKey: Array.from(kp.secretKey),
          secretKeyBase58: kp.publicKey.toBase58(),
          balance: 0,
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

  // Explicit user confirmation to save and connect the generated keypair
  const handleConfirmConnect = () => {
    if (!draftWallet) return;
    localStorage.setItem("terra_local_wallet", JSON.stringify(draftWallet));
    setCreatedWallet(draftWallet);
    const pubkey = draftWallet.publicKey;
    setDraftWallet(null);
    window.dispatchEvent(new Event("storage"));
    if (onSuccess) {
      onSuccess(pubkey);
    } else {
      onClose();
    }
  };

  const handleDiscardDraft = () => {
    setDraftWallet(null);
    setAirdropMsg(null);
  };

  // Request 1 SOL airdrop
  const handleRequestAirdrop = async () => {
    const targetWallet = draftWallet || createdWallet;
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
        const newBalance = data.balance ?? (targetWallet.balance + 1.0);
        if (draftWallet) {
          setDraftWallet({ ...draftWallet, balance: newBalance });
        } else if (createdWallet) {
          const updated = { ...createdWallet, balance: newBalance };
          setCreatedWallet(updated);
          localStorage.setItem("terra_local_wallet", JSON.stringify(updated));
        }
        setAirdropMsg("+1.0 SOL airdropped");
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
    const targetWallet = draftWallet || createdWallet;
    if (!targetWallet) return;
    const blob = new Blob([JSON.stringify(targetWallet.secretKey)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `solana-keypair-${targetWallet.publicKey.slice(0, 6)}.json`;
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
      {/* Backdrop with smooth fade in */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-backdrop-fade transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Dialog Window with prompt zoom-in animation */}
      <div className="relative w-full max-w-md bg-[#111312] border border-[#272b28] rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] text-[#f4f4f5] z-10 overflow-hidden flex flex-col animate-modal-zoom">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#222623] flex items-center justify-between">
          <div>
            <h2 id="wallet-modal-title" className="text-sm font-semibold text-white">
              {hideTabs ? "Create Solana Wallet" : "Solana Wallet"}
            </h2>
            <p className="text-xs text-[#8a918d]">
              Devnet environment
            </p>
          </div>

          <button
            onClick={handleClose}
            aria-label="Close"
            className="p-1 rounded text-[#8a918d] hover:text-white hover:bg-[#1c201d] transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tab Buttons - Only show if not in dedicated single-mode */}
        {!hideTabs && (
          <div className="px-5 pt-3 pb-2 border-b border-[#222623]">
            <div className="p-1 rounded-xl bg-[#090d0b] border border-[#1d2621] flex gap-1">
              <button
                type="button"
                onClick={() => handleTabChange("create")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer text-center ${
                  activeTab === "create"
                    ? "bg-[#18261e] text-[#38b87c] font-bold shadow-xs border border-[#38b87c]/30"
                    : "text-[#8a918d] hover:text-white"
                }`}
              >
                Create Wallet
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("connect")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer text-center ${
                  activeTab === "connect"
                    ? "bg-[#18261e] text-[#38b87c] font-bold shadow-xs border border-[#38b87c]/30"
                    : "text-[#8a918d] hover:text-white"
                }`}
              >
                Connect Extension
              </button>
            </div>
          </div>
        )}

        {/* Body Content with slide animation */}
        <div className="p-5 overflow-hidden">
          <div
            key={activeTab}
            className={
              tabDirection === "right"
                ? "animate-tab-slide-right space-y-4"
                : "animate-tab-slide-left space-y-4"
            }
          >
            {activeTab === "create" && (
            <>
              {draftWallet ? (
                /* 1. Newly generated keypair pending user confirmation */
                <div className="space-y-3.5 text-left text-xs">
                  <div className="p-2.5 rounded-lg bg-[#0e2216] border border-[#1e4d31] flex items-center gap-2 text-[#86efac]">
                    <svg className="w-4 h-4 text-[#38b87c] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-[11px] font-medium leading-tight">Keypair generated. Review details and confirm below to connect.</span>
                  </div>

                  {/* Balance & Airdrop row */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#161917] border border-[#272b28]">
                    <div>
                      <div className="text-[11px] text-[#8a918d]">Devnet Balance</div>
                      <div className="font-mono text-sm font-semibold text-white">
                        {draftWallet.balance.toFixed(2)} SOL
                      </div>
                    </div>

                    <button
                      onClick={handleRequestAirdrop}
                      disabled={airdropLoading}
                      className="px-2.5 py-1 text-xs rounded bg-[#202522] hover:bg-[#282f2a] text-[#86efac] border border-[#2e3731] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {airdropLoading ? (
                        <span className="w-3 h-3 border-2 border-[#86efac] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>+ Request 1 SOL</span>
                      )}
                    </button>
                  </div>

                  {airdropMsg && (
                    <div className="text-[11px] font-mono text-[#86efac] bg-[#16221a] px-2.5 py-1.5 rounded border border-[#22392a]">
                      {airdropMsg}
                    </div>
                  )}

                  {/* Public Key */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#8a918d]">
                      <span>Public Address</span>
                      <button
                        onClick={() => handleCopy(draftWallet.publicKey, "public")}
                        className="text-[#86efac] hover:underline cursor-pointer"
                      >
                        {copiedKey === "public" ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <div className="font-mono text-xs text-[#e4e4e7] bg-[#0c0d0c] p-2 rounded border border-[#222623] break-all select-all">
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
                          className="hover:text-white cursor-pointer"
                        >
                          {showSecretKey ? "Hide" : "Show"}
                        </button>
                        {showSecretKey && (
                          <button
                            onClick={() => handleCopy(draftWallet.secretKeyBase58, "secret")}
                            className="text-[#86efac] hover:underline cursor-pointer"
                          >
                            {copiedKey === "secret" ? "Copied" : "Copy"}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="font-mono text-xs text-[#a1a1aa] bg-[#0c0d0c] p-2 rounded border border-[#222623] break-all select-all">
                      {showSecretKey
                        ? draftWallet.secretKeyBase58
                        : "••••••••••••••••••••••••••••••••••••••••••••"}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-1 flex gap-2">
                    <button
                      onClick={handleDownloadKeypair}
                      className="flex-1 py-1.5 px-3 rounded bg-[#1c201d] hover:bg-[#252b27] border border-[#272b28] text-xs text-white transition-colors cursor-pointer text-center"
                    >
                      Download id.json
                    </button>
                    <a
                      href={draftWallet.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-3 rounded bg-[#161917] hover:bg-[#202522] border border-[#272b28] text-xs text-[#a1a1aa] hover:text-white transition-colors text-center"
                    >
                      Explorer ↗
                    </a>
                  </div>

                  {/* Confirm & Connect vs Cancel */}
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={handleConfirmConnect}
                      className="flex-1 py-2.5 px-4 rounded-lg bg-[#38b87c] hover:bg-[#42cb8a] text-[#07130f] font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Confirm &amp; Connect Wallet</span>
                    </button>
                    <button
                      onClick={handleDiscardDraft}
                      className="py-2.5 px-3 rounded-lg bg-[#201818] hover:bg-[#2c1e1e] border border-[#3a2222] text-xs text-[#fca5a5] hover:text-[#f87171] transition-colors cursor-pointer"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              ) : !createdWallet ? (
                /* 2. No wallet yet - ready to generate */
                <div className="py-3 space-y-4 text-left">
                  <p className="text-xs text-[#a1a1aa] leading-relaxed">
                    Generate a new Solana keypair to test on-chain verification, minting, and transfer hooks.
                  </p>

                  <button
                    onClick={handleGenerateWallet}
                    disabled={isGenerating}
                    className="w-full py-2.5 px-4 rounded-lg bg-white text-black font-semibold text-xs hover:bg-[#e4e4e7] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Generating Keypair...</span>
                      </>
                    ) : (
                      <span>Generate Solana Wallet</span>
                    )}
                  </button>

                  <p className="text-[11px] text-[#71717a]">
                    Generates a standard 64-byte ed25519 keypair and requests 1 SOL on Devnet.
                  </p>
                </div>
              ) : (
                /* 3. Already confirmed and active connected local wallet */
                <div className="space-y-3.5 text-left text-xs">
                  <div className="flex items-center justify-between text-[11px] text-[#86efac] bg-[#0e2216] px-2.5 py-1.5 rounded border border-[#1e4d31]">
                    <span>Connected Local Wallet</span>
                    <span className="w-2 h-2 rounded-full bg-[#38b87c] animate-pulse motion-reduce:animate-none" />
                  </div>

                  {/* Balance & Airdrop row */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#161917] border border-[#272b28]">
                    <div>
                      <div className="text-[11px] text-[#8a918d]">Devnet Balance</div>
                      <div className="font-mono text-sm font-semibold text-white">
                        {createdWallet.balance.toFixed(2)} SOL
                      </div>
                    </div>

                    <button
                      onClick={handleRequestAirdrop}
                      disabled={airdropLoading}
                      className="px-2.5 py-1 text-xs rounded bg-[#202522] hover:bg-[#282f2a] text-[#86efac] border border-[#2e3731] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {airdropLoading ? (
                        <span className="w-3 h-3 border-2 border-[#86efac] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>+ Request 1 SOL</span>
                      )}
                    </button>
                  </div>

                  {airdropMsg && (
                    <div className="text-[11px] font-mono text-[#86efac] bg-[#16221a] px-2.5 py-1.5 rounded border border-[#22392a]">
                      {airdropMsg}
                    </div>
                  )}

                  {/* Public Key */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#8a918d]">
                      <span>Public Address</span>
                      <button
                        onClick={() => handleCopy(createdWallet.publicKey, "public")}
                        className="text-[#86efac] hover:underline cursor-pointer"
                      >
                        {copiedKey === "public" ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <div className="font-mono text-xs text-[#e4e4e7] bg-[#0c0d0c] p-2 rounded border border-[#222623] break-all select-all">
                      {createdWallet.publicKey}
                    </div>
                  </div>

                  {/* Secret Key */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#8a918d]">
                      <span>Private Key</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowSecretKey(!showSecretKey)}
                          className="hover:text-white cursor-pointer"
                        >
                          {showSecretKey ? "Hide" : "Show"}
                        </button>
                        {showSecretKey && (
                          <button
                            onClick={() => handleCopy(createdWallet.secretKeyBase58, "secret")}
                            className="text-[#86efac] hover:underline cursor-pointer"
                          >
                            {copiedKey === "secret" ? "Copied" : "Copy"}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="font-mono text-xs text-[#a1a1aa] bg-[#0c0d0c] p-2 rounded border border-[#222623] break-all select-all">
                      {showSecretKey
                        ? createdWallet.secretKeyBase58
                        : "••••••••••••••••••••••••••••••••••••••••••••"}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-1 flex gap-2">
                    <button
                      onClick={handleDownloadKeypair}
                      className="flex-1 py-1.5 px-3 rounded bg-[#1c201d] hover:bg-[#252b27] border border-[#272b28] text-xs text-white transition-colors cursor-pointer text-center"
                    >
                      Download id.json
                    </button>
                    <a
                      href={createdWallet.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-3 rounded bg-[#161917] hover:bg-[#202522] border border-[#272b28] text-xs text-[#a1a1aa] hover:text-white transition-colors text-center"
                    >
                      Explorer ↗
                    </a>
                  </div>

                  {/* Continue / Log In & Disconnect Buttons */}
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => {
                        if (onSuccess) onSuccess(createdWallet.publicKey);
                        else onClose();
                      }}
                      className="flex-1 py-2.5 px-4 rounded-lg bg-[#38b87c] hover:bg-[#42cb8a] text-[#07130f] font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <span>Continue to Explorer →</span>
                    </button>
                    <button
                      onClick={handleDisconnectAll}
                      className="py-2.5 px-3 rounded-lg bg-[#201818] hover:bg-[#2c1e1e] border border-[#3a2222] text-xs text-[#fca5a5] hover:text-[#f87171] transition-colors cursor-pointer"
                      title="Disconnect and remove this wallet"
                    >
                      Disconnect
                    </button>
                  </div>

                  <div className="pt-1 text-center">
                    <button
                      onClick={handleGenerateWallet}
                      disabled={isGenerating}
                      className="text-[11px] text-[#71717a] hover:text-white transition-colors cursor-pointer"
                    >
                      Generate New Keypair
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "connect" && (
            <div className="space-y-3.5 text-left text-xs py-1">
              {connected && publicKey ? (
                <div className="space-y-3">
                  <div className="p-2.5 rounded-lg bg-[#161917] border border-[#272b28]">
                    <div className="flex items-center justify-between text-[11px] text-[#8a918d] mb-1">
                      <span>Connected Extension</span>
                      <span>{adapterBalance !== null ? `${adapterBalance.toFixed(3)} SOL` : "—"}</span>
                    </div>
                    <div className="font-mono text-xs text-white break-all">
                      {publicKey.toBase58()}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(publicKey.toBase58(), "public")}
                      className="flex-1 py-1.5 rounded bg-[#1c201d] hover:bg-[#252b27] border border-[#272b28] text-xs text-white transition-colors cursor-pointer"
                    >
                      {copiedKey === "public" ? "Copied" : "Copy Address"}
                    </button>
                    <button
                      onClick={handleDisconnectAll}
                      className="py-1.5 px-3 rounded bg-[#201818] hover:bg-[#2c1e1e] border border-[#3a2222] text-xs text-[#fca5a5] hover:text-[#f87171] transition-colors cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </div>

                  {/* Continue / Log In Button */}
                  <div className="pt-1">
                    <button
                      onClick={() => {
                        if (onSuccess) onSuccess(publicKey.toBase58());
                        else onClose();
                      }}
                      className="w-full py-2.5 px-4 rounded-lg bg-[#38b87c] hover:bg-[#42cb8a] text-[#07130f] font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <span>Continue to Explorer →</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-2 space-y-3 text-left">
                  <p className="text-xs text-[#a1a1aa] leading-relaxed">
                    Connect an installed wallet extension (Phantom, Solflare, Backpack).
                  </p>

                  <button
                    onClick={() => {
                      onClose();
                      setAdapterModalVisible(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-lg bg-white text-black font-semibold text-xs hover:bg-[#e4e4e7] transition-all cursor-pointer"
                  >
                    Select Wallet Extension
                  </button>
                </div>
              )}
            </div>
          )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#0d0e0d] border-t border-[#1e211f] flex items-center justify-between text-[11px] text-[#71717a]">
          <span>Non-custodial</span>
          <button
            onClick={handleClose}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

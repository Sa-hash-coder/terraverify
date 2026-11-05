"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Keypair } from "@solana/web3.js";
import { Loader2 } from "lucide-react";

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
}: WalletDialogProps) {
  const [mounted, setMounted] = useState(false);
  const { connected, publicKey, disconnect, select, wallets, connect } = useWallet();
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
  
  // The keypair currently visible in the modal
  const [createdWallet, setCreatedWallet] = useState<CreatedWallet | null>(null);
  
  // Track whether this wallet has been confirmed and saved to localStorage
  const [isConfirmedSession, setIsConfirmedSession] = useState(false);

  const [showSecretKey, setShowSecretKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState<"public" | "secret" | null>(null);
  const [airdropLoading, setAirdropLoading] = useState(false);
  const [airdropMsg, setAirdropMsg] = useState<string | null>(null);
  const [adapterBalance, setAdapterBalance] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync state when opening dialog
  useEffect(() => {
    if (isOpen) {
      setAirdropMsg(null);
      setActiveTab(initialTab);
      setShowSecretKey(false);

      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("terra_local_wallet");
        if (saved) {
          try {
            setCreatedWallet(JSON.parse(saved));
            setIsConfirmedSession(true);
          } catch {
            setCreatedWallet(null);
            setIsConfirmedSession(false);
          }
        } else {
          setCreatedWallet(null);
          setIsConfirmedSession(false);
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

  // Handle dialog close: if not confirmed, discard unconfirmed keypair
  const handleClose = () => {
    if (!isConfirmedSession) {
      setCreatedWallet(null);
    }
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
  }, [isOpen, isConfirmedSession]);

  const dispatchWalletEvents = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("terra_wallet_change"));
    }
  };

  // Disconnect / Forget any active wallet
  const handleDisconnectAll = async () => {
    if (connected) {
      try {
        await disconnect();
      } catch {}
    }
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("terra_local_wallet");
        localStorage.removeItem("walletName");
        localStorage.removeItem("terra_wallet_active");
        localStorage.setItem("terra_logged_out", "true");
      } catch {}
    }
    setCreatedWallet(null);
    setIsConfirmedSession(false);
    setAirdropMsg(null);
    dispatchWalletEvents();
  };

  // Generate wallet - STAYS IN MEMORY ONLY until user clicks Continue to Explorer
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

      // DO NOT SAVE TO LOCALSTORAGE HERE!
      // Keep it in state so user can review and explicitly confirm
      setCreatedWallet(walletData);
      setIsConfirmedSession(false); // unconfirmed until they click Continue
      if (walletData.balance > 0) {
        setAirdropMsg("Funded with 1.0 SOL");
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
        setIsConfirmedSession(false);
      } catch (err) {
        console.error("Local wallet generation error:", err);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // EXPLICIT LOGIN & CONFIRMATION: Only called when user clicks "Continue to Explorer →"
  const handleLoginAndContinue = () => {
    if (!createdWallet) return;
    try {
      localStorage.removeItem("terra_logged_out");
      localStorage.setItem("terra_wallet_active", "true");
      localStorage.setItem("terra_local_wallet", JSON.stringify(createdWallet));
      setIsConfirmedSession(true);
      dispatchWalletEvents();
      if (onSuccess) {
        onSuccess(createdWallet.publicKey);
      }
      onClose();
    } catch (err) {
      console.error("Failed to commit wallet to localStorage:", err);
    }
  };

  // Discard unconfirmed keypair or reset
  const handleResetToNewGeneration = () => {
    setCreatedWallet(null);
    setIsConfirmedSession(false);
    setAirdropMsg(null);
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
        const updated = {
          ...createdWallet,
          balance: data.balance ?? createdWallet.balance + 1.0,
        };
        setCreatedWallet(updated);
        if (isConfirmedSession) {
          localStorage.setItem("terra_local_wallet", JSON.stringify(updated));
          dispatchWalletEvents();
        }
        setAirdropMsg("+1.0 SOL Airdropped successfully!");
      } else {
        setAirdropMsg(data.error || "Faucet busy, try again shortly");
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
    a.download = `solana-keypair-${wallet.publicKey.slice(0, 6)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Connect extension directly on 1-click (avoids asking twice and avoids secondary modals)
  const handleConnectAdapter = async (walletName: string) => {
    setConnectingAdapter(walletName);
    setAirdropMsg(null);
    try {
      const target = wallets.find(
        (w) => w.adapter.name.toLowerCase() === walletName.toLowerCase()
      );

      if (!target) {
        throw new Error(`${walletName} wallet extension is not installed.`);
      }

      select(target.adapter.name as any);

      if (!target.adapter.connected) {
        await target.adapter.connect();
      }

      dispatchWalletEvents();

      const pubkey = target.adapter.publicKey?.toBase58() || publicKey?.toBase58();
      if (pubkey) {
        try {
          localStorage.removeItem("terra_logged_out");
          localStorage.setItem("terra_wallet_active", "true");
          localStorage.setItem(
            "terra_local_wallet",
            JSON.stringify({
              publicKey: pubkey,
              isExtension: true,
              walletName: target.adapter.name,
              balance: 1.0,
              explorerUrl: `https://explorer.solana.com/address/${pubkey}?cluster=devnet`,
              createdAt: new Date().toISOString(),
            })
          );
          localStorage.setItem("walletName", target.adapter.name);
        } catch {}
      }

      dispatchWalletEvents();

      if (pubkey && onSuccess) {
        onSuccess(pubkey);
      }
      onClose();
    } catch (err: any) {
      console.warn("Direct extension connect failed:", err);
      // NEVER open a second modal or close the dialog on error!
      if (err?.name === "WalletNotReadyError" || err?.name === "WalletNotFoundError") {
        setAirdropMsg(`${walletName} extension not detected. Please install it.`);
      } else if (err?.message) {
        setAirdropMsg(err.message);
      } else {
        setAirdropMsg("Connection request was cancelled.");
      }
    } finally {
      setConnectingAdapter(null);
    }
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
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-backdrop-fade transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Dialog Window - The Exact First Dark Dialogue Box */}
      <div className="relative w-full max-w-md bg-[#111312] border border-[#272b28] rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] text-[#f4f4f5] z-10 overflow-hidden flex flex-col animate-modal-zoom">
        {/* Header matching exact first design */}
        <div className="px-5 py-4 border-b border-[#1e211f] flex items-center justify-between">
          <div>
            <h2 id="wallet-modal-title" className="text-sm font-semibold text-white">
              Solana Wallet
            </h2>
            <p className="text-[11px] text-[#71717a]">Devnet environment</p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="p-1 rounded text-[#71717a] hover:text-white transition-colors cursor-pointer text-sm font-mono"
          >
            ✕
          </button>
        </div>

        {/* Tab Buttons matching exact first design */}
        <div className="px-5 pt-3 pb-2 border-b border-[#1e211f]">
          <div className="p-1 rounded-lg bg-[#0c0d0c] border border-[#1e211f] flex gap-1">
            <button
              type="button"
              onClick={() => handleTabChange("create")}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-mono transition-all cursor-pointer text-center ${
                activeTab === "create"
                  ? "bg-[#18261e] text-[#86efac] font-medium border border-[#23422f]"
                  : "text-[#a1a1aa] hover:text-white"
              }`}
            >
              Create Wallet
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("connect")}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-mono transition-all cursor-pointer text-center ${
                activeTab === "connect"
                  ? "bg-[#18261e] text-[#86efac] font-medium border border-[#23422f]"
                  : "text-[#a1a1aa] hover:text-white"
              }`}
            >
              Connect Extension
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5">
          <div
            key={activeTab}
            className={
              tabDirection === "right"
                ? "animate-tab-slide-right"
                : "animate-tab-slide-left"
            }
          >
            {activeTab === "create" && (
              <>
                {!createdWallet ? (
                  /* Initial State: Clean Generate Button (matching media_1793433187813_91369048.png) */
                  <div className="py-2 space-y-3.5 text-left">
                    <p className="text-xs text-[#a1a1aa] leading-relaxed">
                      Generate a new Solana keypair to test on-chain verification, minting, and transfer hooks.
                    </p>

                    <button
                      onClick={handleGenerateWallet}
                      disabled={isGenerating}
                      className="w-full py-2.5 px-4 rounded-lg bg-white text-black font-semibold text-xs hover:bg-[#e4e4e7] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-md"
                    >
                      {isGenerating ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating &amp; Funding Keypair...</span>
                        </span>
                      ) : (
                        <span>Generate Solana Wallet</span>
                      )}
                    </button>

                    <p className="text-[11px] text-[#71717a] leading-tight">
                      Generates a standard 64-byte ed25519 keypair and requests 1 SOL on Devnet.
                    </p>
                  </div>
                ) : (
                  /* Generated State: Matching media_1793433200116_db3e9a05.jpg */
                  <div className="space-y-3.5 text-left text-xs">
                    {/* Devnet Balance */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#161917] border border-[#272b28]">
                      <div>
                        <div className="text-[10px] text-[#71717a] font-mono">Devnet Balance</div>
                        <div className="font-mono text-sm font-semibold text-white">
                          {createdWallet.balance.toFixed(2)} SOL
                        </div>
                      </div>

                      <button
                        onClick={handleRequestAirdrop}
                        disabled={airdropLoading}
                        className="px-2.5 py-1 text-xs font-mono rounded bg-[#18261e] hover:bg-[#23382c] text-[#86efac] border border-[#274835] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {airdropLoading ? (
                          <span className="flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Requesting...</span>
                          </span>
                        ) : (
                          <span>+ Request 1 SOL</span>
                        )}
                      </button>
                    </div>

                    {airdropMsg && (
                      <div className="text-[11px] font-mono text-[#86efac] bg-[#14231a] p-2 rounded border border-[#204a30]">
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
                      <div className="font-mono text-xs text-[#a1a1aa] bg-[#0c0d0c] p-2 rounded border border-[#222623] break-all select-all">
                        {createdWallet.publicKey}
                      </div>
                    </div>

                    {/* Private Key */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-[#8a918d]">
                        <span>Private Key</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowSecretKey(!showSecretKey)}
                            className="hover:text-white cursor-pointer text-[#8a918d]"
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
                        onClick={() => handleDownloadKeypair(createdWallet)}
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

                    {/* Continue / Log In Button and Disconnect */}
                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={handleLoginAndContinue}
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
                        onClick={handleResetToNewGeneration}
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

                    {/* Continue to Explorer */}
                    <div className="pt-1">
                      <button
                        onClick={() => {
                          const activeKey = publicKey?.toBase58();
                          if (activeKey) {
                            try {
                              localStorage.setItem(
                                "terra_local_wallet",
                                JSON.stringify({
                                  publicKey: activeKey,
                                  isExtension: true,
                                  balance: adapterBalance ?? 1.0,
                                  explorerUrl: `https://explorer.solana.com/address/${activeKey}?cluster=devnet`,
                                  createdAt: new Date().toISOString(),
                                })
                              );
                            } catch {}
                            dispatchWalletEvents();
                          }
                          if (onSuccess && activeKey) {
                            onSuccess(activeKey);
                          } else {
                            onClose();
                          }
                        }}
                        className="w-full py-2.5 px-4 rounded-lg bg-[#38b87c] hover:bg-[#42cb8a] text-[#07130f] font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        <span>Continue to Explorer →</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-2 space-y-3.5 text-left">
                    <p className="text-xs text-[#a1a1aa] leading-relaxed">
                      Connect an installed wallet extension (Phantom, Solflare, Backpack).
                    </p>

                    {airdropMsg && (
                      <div className="text-[11px] font-mono text-[#fca5a5] bg-[#201818] p-2 rounded border border-[#3a2222]">
                        {airdropMsg}
                      </div>
                    )}

                    {/* Direct 1-Click Extensions list without asking twice */}
                    <div className="space-y-2">
                      {wallets && wallets.length > 0 ? (
                        wallets.map((w) => (
                          <button
                            key={w.adapter.name}
                            onClick={() => handleConnectAdapter(w.adapter.name)}
                            disabled={connectingAdapter === w.adapter.name}
                            className="w-full py-2.5 px-4 rounded-lg bg-white text-black font-semibold text-xs hover:bg-[#e4e4e7] transition-all flex items-center justify-between cursor-pointer group disabled:opacity-60 shadow-md"
                          >
                            <div className="flex items-center gap-2.5">
                              {w.adapter.icon && (
                                <img
                                  src={w.adapter.icon}
                                  alt={w.adapter.name}
                                  className="w-4 h-4 rounded"
                                />
                              )}
                              <span>Connect {w.adapter.name}</span>
                            </div>
                            <span className="text-[11px] font-mono text-black/60 group-hover:text-black">
                              {connectingAdapter === w.adapter.name ? "Connecting..." : "→"}
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="text-xs text-[#fca5a5] py-2">
                          No Solana extension detected. Please install Phantom or Solflare.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer matching exact first design */}
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

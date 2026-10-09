"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { 
  Sun, 
  Moon, 
  Wallet, 
  Copy, 
  Check, 
  ExternalLink, 
  LogOut, 
  Droplet, 
  ChevronDown,
  Menu,
  X
} from "lucide-react";
import WalletDialog from "../wallet/wallet-dialog";

export default function AppHeader() {
  const pathname = usePathname();
  const { connection } = useConnection();
  const { publicKey, connected, disconnect, connecting } = useWallet();
  const { setVisible: setAdapterModalVisible } = useWalletModal();

  const [balance, setBalance] = useState<number | null>(null);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [requestingFaucet, setRequestingFaucet] = useState(false);
  const [faucetSuccess, setFaucetSuccess] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [createWalletOpen, setCreateWalletOpen] = useState(false);
  const [localWallet, setLocalWallet] = useState<{ publicKey: string; balance?: number } | null>(null);

  // Sync saved local wallet from localStorage
  const syncLocalWallet = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("terra_local_wallet");
      if (saved) {
        try {
          setLocalWallet(JSON.parse(saved));
          return;
        } catch {}
      }
      setLocalWallet(null);
    }
  };

  useEffect(() => {
    syncLocalWallet();
    const handleStorage = () => syncLocalWallet();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const isWalletConnected = Boolean(connected && publicKey) || Boolean(localWallet?.publicKey);
  const activePubkey = publicKey ? publicKey.toBase58() : localWallet?.publicKey || null;

  const handleDisconnectWallet = () => {
    if (connected) {
      try {
        disconnect();
      } catch {}
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("terra_local_wallet");
    }
    setLocalWallet(null);
    setBalance(null);
    setWalletMenuOpen(false);
    window.dispatchEvent(new Event("storage"));
  };

  const menuRef = useRef<HTMLDivElement>(null);

  // Theme synchronization
  useEffect(() => {
    const saved = (localStorage.getItem("terra_theme") as "dark" | "light") || "dark";
    setTheme(saved);
    if (saved === "light") {
      document.body.classList.add("light");
    } else {
      document.body.classList.remove("light");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("terra_theme", next);
    if (next === "light") {
      document.body.classList.add("light");
    } else {
      document.body.classList.remove("light");
    }
  };

  // Close wallet dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setWalletMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch balance
  useEffect(() => {
    if (connected && publicKey) {
      const fetchBalance = async () => {
        try {
          const bal = await connection.getBalance(publicKey);
          setBalance(bal / 1e9);
        } catch {
          // fail silently
        }
      };

      fetchBalance();
      const interval = setInterval(fetchBalance, 6000);
      return () => clearInterval(interval);
    } else if (localWallet?.publicKey) {
      try {
        const pk = new PublicKey(localWallet.publicKey);
        connection.getBalance(pk).then((bal) => setBalance(bal / 1e9)).catch(() => {
          setBalance(localWallet.balance ?? 1.0);
        });
      } catch {
        setBalance(localWallet.balance ?? 1.0);
      }
    } else {
      setBalance(null);
    }
  }, [connected, publicKey, localWallet, connection]);

  // Handle Faucet
  const handleRequestFaucet = async () => {
    if (!publicKey) return;
    try {
      setRequestingFaucet(true);
      const signature = await connection.requestAirdrop(publicKey, 1000000000);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        "confirmed"
      );
      setFaucetSuccess(true);
      const newBal = await connection.getBalance(publicKey);
      setBalance(newBal / 1e9);
      setTimeout(() => setFaucetSuccess(false), 3500);
    } catch (err) {
      console.error("Faucet error:", err);
    } finally {
      setRequestingFaucet(false);
    }
  };

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Explorer", href: "/explorer" },
    { label: "Marketplace", href: "/marketplace" },
    { label: "Retire", href: "/retire" },
    { label: "Register", href: "/register" },
  ];

  const handleCopyAddress = () => {
    if (activePubkey) {
      navigator.clipboard.writeText(activePubkey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#0a1410] backdrop-blur-md border-b border-[#182921] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Brand Wordmark */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded border border-[#38b87c]/40 bg-[#12221b] flex items-center justify-center text-[#38b87c] group-hover:border-[#38b87c] transition-colors">
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2a10 10 0 0 0-7.07 17.07" />
                <path d="M12 22a10 10 0 0 0 7.07-17.07" />
              </svg>
            </div>
            <span className="text-base font-semibold tracking-tight text-white">
              Terra<span className="text-[#38b87c]">Verify</span>
            </span>
          </Link>

          {/* Center: Desktop Navigation with Lightened Buttons */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#14261f] p-1.5 rounded-xl border border-[#274538] shadow-inner">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-500 text-white shadow-sm border border-emerald-400/50"
                      : "bg-[#203a2e] hover:bg-[#2b4c3e] text-slate-100 hover:text-white border border-[#2e5242] shadow-xs"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Theme Toggle & Unified Wallet Component */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
              className="p-2 rounded-lg bg-[#13231c] hover:bg-[#1a3026] border border-[#233c30] text-slate-200 hover:text-white transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Wallet Integration Widget */}
            {!isWalletConnected || !activePubkey ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCreateWalletOpen(true)}
                  disabled={connecting}
                  className="px-3.5 py-1.5 rounded-lg bg-[#38b87c] hover:bg-[#42cb8a] text-[#07130f] font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>{connecting ? "Connecting..." : "Connect Wallet"}</span>
                </button>
                <button
                  onClick={() => setCreateWalletOpen(true)}
                  className="hidden sm:flex px-2.5 py-1.5 rounded-lg bg-[#0d1714] hover:bg-[#162922] light:bg-slate-100 light:hover:bg-slate-200 border border-[#162922] light:border-slate-200 text-xs font-mono text-[#a8c7b5] light:text-slate-700 transition-colors cursor-pointer"
                  title="Generate Devnet Wallet"
                >
                  + New
                </button>
              </div>
            ) : (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setWalletMenuOpen(!walletMenuOpen)}
                  className="px-3 py-1.5 rounded-lg bg-[#0d1714] hover:bg-[#162922] light:bg-slate-100 light:hover:bg-slate-200 border border-[#162922] light:border-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                  aria-expanded={walletMenuOpen}
                >
                  <span className="w-2 h-2 rounded-full bg-[#38b87c]" />
                  <span className="text-xs font-mono font-medium text-[#f4f5ef] light:text-slate-900">
                    {activePubkey.slice(0, 4)}...{activePubkey.slice(-4)}
                  </span>
                  {balance !== null && (
                    <span className="text-xs font-mono text-[#8e9f96] light:text-slate-500 hidden sm:inline">
                      {balance.toFixed(2)} SOL
                    </span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-[#8e9f96]" />
                </button>

                {/* Wallet Dropdown Menu */}
                {walletMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0d1714] light:bg-white border border-[#162922] light:border-slate-200 shadow-xl p-3 z-50 text-xs space-y-3">
                    <div>
                      <div className="text-[11px] text-[#8e9f96] light:text-slate-400 font-mono uppercase">
                        Solana Devnet
                      </div>
                      <div className="text-sm font-mono font-bold text-[#f4f5ef] light:text-slate-900 mt-0.5">
                        {balance !== null ? `${balance.toFixed(3)} SOL` : "Loading..."}
                      </div>
                      <div className="text-[11px] font-mono text-[#718078] light:text-slate-500 truncate select-all mt-1 p-1.5 rounded bg-[#07130f] light:bg-slate-50 border border-[#162922] light:border-slate-200">
                        {activePubkey}
                      </div>
                    </div>

                    <div className="space-y-1 pt-1 border-t border-[#162922] light:border-slate-100">
                      <button
                        onClick={handleCopyAddress}
                        className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-[#162922] light:hover:bg-slate-100 text-[#f4f5ef] light:text-slate-700 transition-colors text-left cursor-pointer"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-[#38b87c]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-[#8e9f96]" />
                        )}
                        <span>{copied ? "Address Copied" : "Copy Address"}</span>
                      </button>

                      <a
                        href={`https://explorer.solana.com/address/${activePubkey}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-[#162922] light:hover:bg-slate-100 text-[#f4f5ef] light:text-slate-700 transition-colors text-left"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#8e9f96]" />
                        <span>View on Solana Explorer</span>
                      </a>

                      <button
                        onClick={handleRequestFaucet}
                        disabled={requestingFaucet}
                        className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-[#162922] light:hover:bg-slate-100 text-[#38b87c] transition-colors text-left cursor-pointer disabled:opacity-50"
                      >
                        <Droplet className="w-3.5 h-3.5" />
                        <span>
                          {requestingFaucet
                            ? "Requesting 1 SOL..."
                            : faucetSuccess
                            ? "✓ Funded 1 SOL"
                            : "Request 1 Devnet SOL"}
                        </span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-[#162922] light:border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setWalletMenuOpen(false);
                          setCreateWalletOpen(true);
                        }}
                        className="text-[11px] text-[#8e9f96] hover:text-white transition-colors cursor-pointer"
                      >
                        Keypair Tools
                      </button>
                      <button
                        onClick={handleDisconnectWallet}
                        className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                        title="Disconnect connected wallet"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Disconnect</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Nav Toggle */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden p-2 rounded-lg bg-[#13231c] border border-[#233c30] text-slate-200 hover:text-white"
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="md:hidden border-t border-[#182921] bg-[#0a1410] px-4 py-3 space-y-1.5">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`block px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-500 text-white shadow-sm border border-emerald-400/50"
                      : "bg-[#1d352b] hover:bg-[#28483b] text-slate-100 hover:text-white border border-[#2b4c3e]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Portal-based Wallet Dialog */}
      <WalletDialog
        isOpen={createWalletOpen}
        onClose={() => setCreateWalletOpen(false)}
      />
    </>
  );
}

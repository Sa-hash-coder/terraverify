"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

// Module-level persistent cache across route changes in SPA session
let cachedLocalWallet: { publicKey: string; balance?: number } | null = null;
let cachedBalance: number | null = null;

const getInitialLocalWallet = (): { publicKey: string; balance?: number } | null => {
  if (cachedLocalWallet) return cachedLocalWallet;
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("terra_local_wallet");
      if (saved) {
        cachedLocalWallet = JSON.parse(saved);
        if (typeof cachedLocalWallet?.balance === "number") {
          cachedBalance = cachedLocalWallet.balance;
        }
        return cachedLocalWallet;
      }
    } catch {}
  }
  return null;
};

const getInitialBalance = (): number | null => {
  if (cachedBalance !== null) return cachedBalance;
  const lw = getInitialLocalWallet();
  if (typeof lw?.balance === "number") {
    cachedBalance = lw.balance;
    return lw.balance;
  }
  return 1.0;
};

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { connection } = useConnection();
  const { publicKey, connected, disconnect, connecting } = useWallet();
  const { setVisible: setAdapterModalVisible } = useWalletModal();

  const [balance, setBalanceState] = useState<number | null>(getInitialBalance);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [requestingFaucet, setRequestingFaucet] = useState(false);
  const [faucetSuccess, setFaucetSuccess] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [createWalletOpen, setCreateWalletOpen] = useState(false);
  const [localWallet, setLocalWalletState] = useState<{ publicKey: string; balance?: number } | null>(getInitialLocalWallet);

  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
    opacity: number;
  }>({ left: 0, width: 0, opacity: 0 });

  const setBalance = (bal: number | null) => {
    cachedBalance = bal;
    setBalanceState(bal);
    if (typeof window !== "undefined" && bal !== null) {
      try {
        const saved = localStorage.getItem("terra_local_wallet");
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.balance = bal;
          localStorage.setItem("terra_local_wallet", JSON.stringify(parsed));
        }
      } catch {}
    }
  };

  const setLocalWallet = (wallet: { publicKey: string; balance?: number } | null) => {
    cachedLocalWallet = wallet;
    setLocalWalletState(wallet);
    if (wallet && typeof wallet.balance === "number") {
      cachedBalance = wallet.balance;
      setBalanceState(wallet.balance);
    }
  };

  // Sync saved local wallet from localStorage
  const syncLocalWallet = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("terra_local_wallet");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setLocalWallet(parsed);
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

  const handleLogout = () => {
    handleDisconnectWallet();
    setMobileNavOpen(false);
    router.push("/");
  };

  const menuRef = useRef<HTMLDivElement>(null);

  // Theme synchronization
  useEffect(() => {
    const saved = (localStorage.getItem("terra_theme") as "dark" | "light") || "light";
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
    { label: "Explorer", href: "/explorer" },
    { label: "Marketplace", href: "/marketplace" },
    { label: "Retire", href: "/retire" },
    { label: "Register", href: "/register" },
  ];

  useEffect(() => {
    const updateIndicator = () => {
      const activeIdx = navItems.findIndex((item) => pathname.startsWith(item.href));
      if (activeIdx !== -1 && tabRefs.current[activeIdx]) {
        const el = tabRefs.current[activeIdx];
        if (el) {
          setIndicatorStyle({
            left: el.offsetLeft,
            width: el.offsetWidth,
            opacity: 1,
          });
        }
      } else {
        setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      }
    };

    const frameId = requestAnimationFrame(updateIndicator);
    window.addEventListener("resize", updateIndicator);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updateIndicator);
    };
  }, [pathname]);

  const handleCopyAddress = () => {
    if (activePubkey) {
      navigator.clipboard.writeText(activePubkey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#f2f5ef]/95 backdrop-blur-md border-b border-[#e1e7de] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Left: Brand Logo & Wordmark matching exact uploaded screenshot */}
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

          {/* Center: Inner Navigation Tabs in Rounded Container with Smooth Gliding Indicator */}
          <nav
            className="hidden md:flex items-center gap-1 bg-[#fafcf8] p-1.5 rounded-2xl border border-[#d8ded4] shadow-[0_1px_4px_rgba(0,0,0,0.03)] shrink-0 relative"
            aria-label="Inner App Navigation"
          >
            {/* Sliding Active Pill */}
            <div
              className="absolute top-1.5 bottom-1.5 rounded-xl bg-[#e0ebe2] shadow-2xs pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                opacity: indicatorStyle.opacity,
              }}
              aria-hidden="true"
            />

            {navItems.map((item, idx) => {
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  ref={(el) => {
                    tabRefs.current[idx] = el;
                  }}
                  href={item.href}
                  className={`relative z-10 px-5 py-1.5 rounded-xl text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                    isActive
                      ? "text-[#0a3d2a] font-bold"
                      : "text-[#4a6356] hover:text-[#0a3d2a] font-medium"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Theme Toggle, Logout & Wallet matching Light Eco Theme */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
              className="p-2 rounded-full bg-white hover:bg-[#edf2ea] border border-[#d8ded4] text-[#4a6356] hover:text-[#0a3d2a] transition-colors cursor-pointer shadow-2xs"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Logout / Return to Home Button */}
            <button
              onClick={handleLogout}
              title="Logout and return to Home"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-[#fee2e2] border border-[#d8ded4] hover:border-rose-400 text-[#4a6356] hover:text-rose-600 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            {/* Wallet Integration Widget matching Theme */}
            {!isWalletConnected || !activePubkey ? (
              <div className="flex items-center gap-4 shrink-0">
                <button
                  onClick={() => setCreateWalletOpen(true)}
                  disabled={connecting}
                  className="text-sm font-medium text-[#2d4d3d] hover:text-[#0a3d2a] transition-colors cursor-pointer px-1 py-1"
                >
                  Create wallet
                </button>
                <button
                  onClick={() => setAdapterModalVisible(true)}
                  className="px-5 py-2.5 rounded-full bg-[#0a3d2a] hover:bg-[#114d36] text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-[0_2px_8px_rgba(10,61,42,0.2)] cursor-pointer"
                >
                  <Wallet className="w-4 h-4 text-white" />
                  <span>Connect wallet</span>
                </button>
              </div>
            ) : (
              <div className="relative shrink-0" ref={menuRef}>
                <button
                  onClick={() => setWalletMenuOpen(!walletMenuOpen)}
                  className="h-10 px-4 rounded-full bg-[#0a3d2a] hover:bg-[#114d36] text-white font-semibold flex items-center justify-between gap-3 cursor-pointer shadow-[0_2px_8px_rgba(10,61,42,0.2)] transition-all select-none"
                  aria-expanded={walletMenuOpen}
                >
                  <div className="flex items-center gap-2 shrink-0 min-w-0">
                    <Wallet className="w-4 h-4 text-white shrink-0" />
                    <span className="text-xs font-bold font-mono tracking-wide truncate">
                      {activePubkey.slice(0, 4)}...{activePubkey.slice(-4)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 pl-1 border-l border-white/20">
                    <span className="text-xs font-mono font-bold text-white">
                      {(balance ?? 1.0).toFixed(2)} SOL
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-white shrink-0" />
                  </div>
                </button>

                {/* Wallet Dropdown Menu */}
                {walletMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#d8ded4] shadow-xl p-3 z-50 text-xs space-y-3">
                    <div>
                      <div className="text-[11px] text-[#5c7366] font-mono uppercase">
                        Solana Devnet
                      </div>
                      <div className="text-sm font-mono font-bold text-[#0a3d2a] mt-0.5">
                        {balance !== null ? `${balance.toFixed(3)} SOL` : "Loading..."}
                      </div>
                      <div className="text-[11px] font-mono text-[#5c7366] truncate select-all mt-1 p-1.5 rounded-lg bg-[#f2f5ef] border border-[#d8ded4]">
                        {activePubkey}
                      </div>
                    </div>

                    <div className="space-y-1 pt-1 border-t border-[#e1e7de]">
                      <button
                        onClick={handleCopyAddress}
                        className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#f2f5ef] text-[#111e16] transition-colors text-left cursor-pointer"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-[#0a3d2a]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-[#5c7366]" />
                        )}
                        <span>{copied ? "Address Copied" : "Copy Address"}</span>
                      </button>

                      <a
                        href={`https://explorer.solana.com/address/${activePubkey}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#f2f5ef] text-[#111e16] transition-colors text-left"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#5c7366]" />
                        <span>View on Solana Explorer</span>
                      </a>

                      <button
                        onClick={handleRequestFaucet}
                        disabled={requestingFaucet}
                        className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#f2f5ef] text-[#0a3d2a] transition-colors text-left cursor-pointer disabled:opacity-50"
                      >
                        {faucetSuccess ? (
                          <span className="flex items-center gap-1.5 text-[#0a3d2a]">
                            <Check className="w-3.5 h-3.5" />
                            <span>Funded 1 SOL</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <Droplet className="w-3.5 h-3.5" />
                            <span>{requestingFaucet ? "Requesting 1 SOL..." : "Request 1 Devnet SOL"}</span>
                          </span>
                        )}
                      </button>
                    </div>

                    <div className="pt-2 border-t border-[#e1e7de] flex items-center justify-between">
                      <button
                        onClick={() => {
                          setWalletMenuOpen(false);
                          setCreateWalletOpen(true);
                        }}
                        className="text-[11px] text-[#5c7366] hover:text-[#0a3d2a] transition-colors cursor-pointer"
                      >
                        Keypair Tools
                      </button>
                      <button
                        onClick={() => {
                          setWalletMenuOpen(false);
                          handleLogout();
                        }}
                        className="text-[11px] text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Nav Toggle */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="md:hidden border-t border-slate-800 bg-[#080d12] px-4 py-3 space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`block px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                      : "bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer mt-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout & Return Home</span>
            </button>
          </div>
        )}
      </header>

      {/* Portal-based Wallet Dialog */}
      <WalletDialog
        isOpen={createWalletOpen}
        onClose={() => setCreateWalletOpen(false)}
        hideTabs={true}
        initialTab="create"
      />
    </>
  );
}

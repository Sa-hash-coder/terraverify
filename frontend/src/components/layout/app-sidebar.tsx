"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import {
  Compass,
  Satellite,
  Store,
  Flame,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Wallet,
  LogOut,
  Copy,
  Check,
  Menu,
  X,
  ExternalLink
} from "lucide-react";
import WalletDialog from "../wallet/wallet-dialog";

export interface AppSidebarProps {
  onToggleCollapse?: (collapsed: boolean) => void;
}

export default function AppSidebar({ onToggleCollapse }: AppSidebarProps) {
  const pathname = usePathname();
  const { connection } = useConnection();
  const { publicKey, connected, disconnect, connecting } = useWallet();
  const { setVisible: setAdapterModalVisible } = useWalletModal();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [balance, setBalance] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [createWalletOpen, setCreateWalletOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load persisted sidebar state & theme
  useEffect(() => {
    setMounted(true);
    try {
      const savedCollapsed = localStorage.getItem("terra_sidebar_collapsed") === "true";
      setCollapsed(savedCollapsed);
      if (onToggleCollapse) onToggleCollapse(savedCollapsed);

      const savedTheme = (localStorage.getItem("terra_theme") as "dark" | "light") || "dark";
      setTheme(savedTheme);
      if (savedTheme === "light") {
        document.documentElement.classList.add("light");
        document.documentElement.style.colorScheme = "light";
      } else {
        document.documentElement.classList.remove("light");
        document.documentElement.style.colorScheme = "dark";
      }
    } catch {}
  }, []);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem("terra_sidebar_collapsed", String(next));
    } catch {}
    if (onToggleCollapse) onToggleCollapse(next);
  };

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName === "width") {
      window.dispatchEvent(new Event("resize"));
      window.dispatchEvent(new Event("terra_sidebar_resize"));
    }
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("terra_theme", next);
    } catch {}
    if (next === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.style.colorScheme = "light";
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.style.colorScheme = "dark";
    }
  };

  // Fetch balance
  useEffect(() => {
    if (!connected || !publicKey) {
      setBalance(null);
      return;
    }
    const fetchBalance = async () => {
      try {
        const bal = await connection.getBalance(publicKey);
        setBalance(bal / 1e9);
      } catch {}
    };
    fetchBalance();
    const interval = setInterval(fetchBalance, 8000);
    return () => clearInterval(interval);
  }, [connected, publicKey, connection]);

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const navItems = [
    { label: "Home", href: "/", icon: Compass },
    { label: "Explorer", href: "/explorer", icon: Satellite },
    { label: "Marketplace", href: "/marketplace", icon: Store },
    { label: "Retire", href: "/retire", icon: Flame },
    { label: "Register", href: "/register", icon: PlusCircle },
  ];

  const activeIndex = navItems.findIndex((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
  );

  return (
    <>
      {/* Mobile Top Bar (<768px) */}
      <div className="md:hidden sticky top-0 z-40 w-full h-14 bg-[var(--surface)] border-b border-[var(--border)] px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)]"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border border-[var(--accent)]/40 bg-[var(--surface-raised)] flex items-center justify-center text-[var(--accent)]">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2a10 10 0 0 0-7.07 17.07" />
                <path d="M12 22a10 10 0 0 0 7.07-17.07" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-[var(--text)]">
              Terra<span className="text-[var(--accent)]">Verify</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {!connected ? (
            <button
              onClick={() => setAdapterModalVisible(true)}
              className="px-2.5 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--bg-app)] font-semibold text-xs flex items-center gap-1.5"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--text)] bg-[var(--surface-raised)] border border-[var(--border)] px-2 py-1 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <span>{publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Slide-Over Drawer */}
      <div
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[var(--surface)] border-r border-[var(--border)] p-4 flex flex-col justify-between transition-transform duration-250 ease-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded border border-[var(--accent)]/40 bg-[var(--surface-raised)] flex items-center justify-center text-[var(--accent)]">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2a10 10 0 0 0-7.07 17.07" />
                  <path d="M12 22a10 10 0 0 0 7.07-17.07" />
                </svg>
              </div>
              <span className="text-base font-bold tracking-tight text-[var(--text)]">
                Terra<span className="text-[var(--accent)]">Verify</span>
              </span>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)]"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold"
                      : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)]"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Drawer Bottom */}
        <div className="space-y-3 pt-4 border-t border-[var(--border)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[var(--text-muted)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              Solana Devnet
            </span>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>

          {!connected ? (
            <button
              onClick={() => {
                setMobileOpen(false);
                setAdapterModalVisible(true);
              }}
              className="w-full py-2.5 px-3 rounded-lg bg-[var(--accent)] text-[var(--bg-app)] font-semibold text-xs flex items-center justify-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </button>
          ) : (
            <div className="p-3 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--text-muted)]">Wallet</span>
                <span className="text-[var(--text)]">{publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}</span>
              </div>
              {balance !== null && (
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--text-muted)]">Balance</span>
                  <span className="text-[var(--accent)] font-bold">{balance.toFixed(3)} SOL</span>
                </div>
              )}
              <button
                onClick={() => disconnect()}
                className="w-full mt-2 py-1.5 rounded text-xs text-[var(--danger)] hover:bg-[var(--danger-subtle)] transition-colors flex items-center justify-center gap-1.5 font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Persistent Sidebar (>=768px) */}
      <aside
        onTransitionEnd={handleTransitionEnd}
        className={`hidden md:flex flex-col justify-between shrink-0 h-dvh bg-[var(--surface)] border-r border-[var(--border)] select-none transition-[width] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] z-30 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        {/* Top: Logo Header */}
        <div className="h-16 px-4 flex items-center border-b border-[var(--border)] overflow-hidden">
          <Link
            href="/"
            className={`flex items-center gap-2.5 transition-all ${
              collapsed ? "justify-center w-full" : ""
            }`}
            title="TerraVerify Home"
          >
            <div className="w-8 h-8 rounded-lg border border-[var(--accent)]/40 bg-[var(--surface-raised)] flex items-center justify-center text-[var(--accent)] shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2a10 10 0 0 0-7.07 17.07" />
                <path d="M12 22a10 10 0 0 0 7.07-17.07" />
              </svg>
            </div>
            {!collapsed && (
              <span className="text-base font-bold tracking-tight text-[var(--text)] whitespace-nowrap overflow-hidden">
                Terra<span className="text-[var(--accent)]">Verify</span>
              </span>
            )}
          </Link>
        </div>

        {/* Middle: Navigation with Sliding Active Indicator */}
        <div className="flex-1 py-4 px-2 overflow-y-auto overflow-x-hidden">
          <nav className="relative flex flex-col gap-1">
            {/* Sliding Indicator for Active item */}
            {activeIndex !== -1 && (
              <div
                className="absolute left-0 right-0 h-10 rounded-lg bg-[var(--accent-subtle)] border-l-2 border-[var(--accent)] pointer-events-none transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  top: `${activeIndex * 44}px`,
                }}
              />
            )}

            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`relative z-10 h-10 flex items-center rounded-lg text-xs font-medium transition-colors ${
                    collapsed ? "justify-center px-0" : "px-3 gap-3"
                  } ${
                    isActive
                      ? "text-[var(--accent)] font-semibold"
                      : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)]/60"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && (
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Network, Theme, Wallet & Collapse Button */}
        <div className="p-3 border-t border-[var(--border)] flex flex-col gap-2.5">
          {/* Network & Theme Row */}
          {!collapsed ? (
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-mono text-[var(--text-muted)] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                Solana Devnet
              </span>
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-md hover:bg-[var(--surface-raised)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md hover:bg-[var(--surface-raised)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
              </button>
            </div>
          )}

          {/* Wallet Block */}
          {!connected || !publicKey ? (
            collapsed ? (
              <button
                onClick={() => setAdapterModalVisible(true)}
                className="w-10 h-10 mx-auto rounded-lg bg-[var(--accent)] text-[var(--bg-app)] flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer"
                title="Connect Wallet"
              >
                <Wallet className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setAdapterModalVisible(true)}
                className="w-full py-2 px-3 rounded-lg bg-[var(--accent)] hover:opacity-90 text-[var(--bg-app)] font-semibold text-xs flex items-center justify-center gap-2 transition-opacity cursor-pointer shadow-xs"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Connect Wallet</span>
              </button>
            )
          ) : (
            collapsed ? (
              <div className="flex justify-center">
                <button
                  onClick={() => disconnect()}
                  className="w-10 h-10 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--accent)] hover:text-[var(--danger)] flex items-center justify-center transition-colors cursor-pointer relative"
                  title={`${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)} (${balance !== null ? balance.toFixed(2) + " SOL" : ""}) - Click to Disconnect`}
                >
                  <span className="w-2 h-2 rounded-full bg-[var(--accent)] absolute top-2 right-2" />
                  <Wallet className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-xs font-mono space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--text)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                    <span>{publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleCopyAddress}
                      className="p-1 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                      title="Copy Address"
                    >
                      {copied ? <Check className="w-3 h-3 text-[var(--accent)]" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => disconnect()}
                      className="p-1 text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors cursor-pointer"
                      title="Disconnect Wallet"
                    >
                      <LogOut className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                {balance !== null && (
                  <div className="text-[11px] text-[var(--accent)] font-semibold flex justify-between items-center pt-0.5 border-t border-[var(--border-subtle)]">
                    <span className="text-[var(--text-muted)] font-normal text-[10px]">SOL Balance</span>
                    <span>{balance.toFixed(3)} SOL</span>
                  </div>
                )}
              </div>
            )
          )}

          {/* Collapse Toggle Button */}
          <button
            onClick={toggleCollapse}
            className={`flex items-center rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)] transition-colors cursor-pointer ${
              collapsed ? "justify-center p-2" : "justify-between px-2.5 py-1.5"
            }`}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {!collapsed && <span className="text-[11px]">Collapse sidebar</span>}
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Wallet Keypair Modal */}
      <WalletDialog
        isOpen={createWalletOpen}
        onClose={() => setCreateWalletOpen(false)}
      />
    </>
  );
}

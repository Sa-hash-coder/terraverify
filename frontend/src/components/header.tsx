"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

interface HeaderProps {
  activeTab: "dashboard" | "explorer" | "marketplace" | "retire" | "register";
}

export default function Header({ activeTab }: HeaderProps) {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [requestingFaucet, setRequestingFaucet] = useState(false);
  const [faucetSuccess, setFaucetSuccess] = useState(false);

  // Fetch balance when wallet connects or changes
  useEffect(() => {
    if (!connected || !publicKey) {
      setBalance(null);
      return;
    }

    const fetchBalance = async () => {
      try {
        const bal = await connection.getBalance(publicKey);
        setBalance(bal / 1000000000); // Convert lamports to SOL
      } catch (err) {
        console.error("Failed to fetch balance:", err);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 5000); // Update balance every 5s
    return () => clearInterval(interval);
  }, [publicKey, connected, connection]);

  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Load and apply theme from localStorage
  useEffect(() => {
    const savedTheme = (localStorage.getItem("terra_theme") as "dark" | "light") || "dark";
    setTheme(savedTheme);
    if (savedTheme === "light") {
      document.body.classList.add("light");
    } else {
      document.body.classList.remove("light");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("terra_theme", nextTheme);
    if (nextTheme === "light") {
      document.body.classList.add("light");
    } else {
      document.body.classList.remove("light");
    }
  };

  // Request 1 SOL Faucet Airdrop directly on Devnet
  const handleRequestFaucet = async () => {
    if (!publicKey) return;
    try {
      setRequestingFaucet(true);
      const signature = await connection.requestAirdrop(publicKey, 1000000000); // 1 SOL
      
      // Confirm transaction
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      }, "confirmed");

      setFaucetSuccess(true);
      
      // Trigger instant balance check
      const newBal = await connection.getBalance(publicKey);
      setBalance(newBal / 1000000000);
      
      setTimeout(() => setFaucetSuccess(false), 4000);
    } catch (err) {
      console.error("Faucet request failed:", err);
    } finally {
      setRequestingFaucet(false);
    }
  };

  const navLinks = [
    { id: "dashboard", label: "Dashboard", href: "/" },
    { id: "explorer", label: "Explorer", href: "/explorer" },
    { id: "marketplace", label: "Marketplace", href: "/marketplace" },
    { id: "retire", label: "Retire Credits", href: "/retire" },
    { id: "register", label: "Register Project", href: "/register" },
  ];

  return (
    <nav className="flex flex-col lg:flex-row justify-between items-center gap-4 lg:gap-0 mb-8 md:mb-12 border-b border-gray-800 pb-5">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
        <Link href="/" className="flex items-center gap-3.5 sm:gap-4 group select-none">
          <img 
            src="/logo.png" 
            alt="TerraVerify Logo" 
            className="h-14 sm:h-16 lg:h-18 w-auto object-contain drop-shadow-[0_0_25px_rgba(0,242,254,0.6)] group-hover:scale-105 transition-transform duration-300 shrink-0 translate-x-1 translate-y-1" 
          />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-none flex items-center">
            Terra<span className="text-gradient">Verify</span>
          </h1>
        </Link>
        
        {/* Tiny mobile badge showing address if connected */}
        {connected && publicKey && (
          <div className="lg:hidden text-[10px] bg-cyan-500/10 text-cyan-400 font-mono px-2 py-1 rounded-md border border-cyan-500/20">
            {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
          </div>
        )}
      </div>

      {/* Nav Menu & Actions Container */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
        
        {/* Standardized Responsive Links (Horizontal scroll on mobile, wrap on tablet) */}
        <div className="flex overflow-x-auto w-full sm:w-auto items-center justify-start sm:justify-center gap-4 sm:gap-6 text-sm font-medium text-gray-300 pb-2 sm:pb-0 scrollbar-none whitespace-nowrap px-1">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return isActive ? (
              <span key={link.id} className="text-cyan-400 border-b-2 border-cyan-400 pb-1 font-semibold cursor-default">
                {link.label}
              </span>
            ) : (
              <Link key={link.id} href={link.href} className="hover:text-white transition-colors pb-1">
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Action Buttons: Faucet, Theme Toggle & Wallet MultiButton */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          
          {/* pulsing green Devnet Faucet Button for low balances (< 0.05 SOL) */}
          {connected && balance !== null && balance < 0.05 && (
            <button
              onClick={handleRequestFaucet}
              disabled={requestingFaucet}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md flex items-center gap-1.5 border border-cyan-500/30 ${
                faucetSuccess 
                  ? "bg-cyan-500 text-black border-transparent"
                  : "bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25 animate-pulse"
              }`}
            >
              {requestingFaucet ? (
                <>
                  <span className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></span>
                  Requesting...
                </>
              ) : faucetSuccess ? (
                <>✓ Funded 1 SOL!</>
              ) : (
                <>🛰️ Airdrop 1 Test SOL</>
              )}
            </button>
          )}

          {/* Theme Toggle Button (Light/Dark) */}
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-yellow-400 hover:scale-105 transition-all shadow-md flex items-center justify-center cursor-pointer shrink-0"
          >
            {theme === "dark" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          <WalletMultiButton className="!px-5 !py-2 !rounded-full !bg-white/10 !border !border-white/20 hover:!bg-white/20 !transition-all !shadow-lg !backdrop-blur-md !text-white !font-medium !text-sm !h-auto !line-height-normal" />
        </div>
      </div>
    </nav>
  );
}

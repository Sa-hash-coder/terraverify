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
      
      setTimeout(() => setFaucetSuccess(false), 3000);
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
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(0,242,254,0.4)] hologram-glow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Terra<span className="text-gradient">Verify</span></h1>
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

        {/* Action Buttons: Faucet & Wallet MultiButton */}
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

          <WalletMultiButton className="!px-5 !py-2 !rounded-full !bg-white/10 !border !border-white/20 hover:!bg-white/20 !transition-all !shadow-lg !backdrop-blur-md !text-white !font-medium !text-sm !h-auto !line-height-normal" />
        </div>
      </div>
    </nav>
  );
}

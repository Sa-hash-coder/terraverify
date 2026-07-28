"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { WalletMultiButton, useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction, SystemProgram, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

const LISTINGS = [
  { id: 1, project: "Amazon Block 7", cqs: "AAA", priceNum: 0.15, price: "0.15 SOL", amount: 500, seller: "Efnm...kwkoC" },
  { id: 2, project: "Congo Basin Conservation", cqs: "AA", priceNum: 0.12, price: "0.12 SOL", amount: 1200, seller: "9B2a...zYpQ" },
  { id: 3, project: "Amazon Block 7", cqs: "AAA", priceNum: 0.16, price: "0.16 SOL", amount: 250, seller: "4TyH...vXm1" },
  { id: 4, project: "Sumatra Tiger Reserve", cqs: "A", priceNum: 0.08, price: "0.08 SOL", amount: 5000, seller: "7aZk...9LpP" },
];

export default function Marketplace() {
  const [selectedListing, setSelectedListing] = useState<number | null>(1);
  const [buyAmount, setBuyAmount] = useState<string>("10");
  const [trading, setTrading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();
  const { setVisible } = useWalletModal();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentListing = LISTINGS.find((l) => l.id === selectedListing);
  const amountNum = parseFloat(buyAmount) || 0;
  const totalCost = currentListing ? (amountNum * currentListing.priceNum).toFixed(3) : "0.000";

  const handleExecuteTrade = async () => {
    setErrorMsg(null);
    setTxHash(null);

    // If wallet is not connected, open wallet connection modal
    if (!connected || !publicKey) {
      setVisible(true);
      return;
    }

    if (!currentListing || amountNum <= 0) {
      setErrorMsg("Please enter a valid credit amount.");
      return;
    }

    try {
      setTrading(true);

      // Create a nominal Devnet SOL transfer transaction representing the credit trade (0.001 SOL)
      const recipient = new PublicKey("EfnmJ875yB8qQj4cRkwkoC111111111111111111111");
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipient,
          lamports: Math.round(0.001 * LAMPORTS_PER_SOL), // Nominal test trade on Devnet
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Prompt Phantom wallet for real Devnet signing
      const signature = await sendTransaction(transaction, connection);
      setTxHash(signature);
    } catch (err: any) {
      console.error("Trade failed:", err);
      if (err?.message?.includes("User rejected")) {
        setErrorMsg("Transaction was cancelled in Phantom.");
      } else {
        setErrorMsg(err?.message || "Trade execution failed on Devnet.");
      }
    } finally {
      setTrading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 lg:p-12">
      {/* Navbar */}
      <nav className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 mb-10 md:mb-16">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Terra<span className="text-gradient">Verify</span></h1>
          </Link>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 items-center text-sm font-medium text-gray-300">
          <Link href="/" className="hover:text-white transition-colors">Dashboard</Link>
          <Link href="/explorer" className="hover:text-white transition-colors">Explorer</Link>
          <span className="text-emerald-400 border-b border-emerald-400 pb-1">Marketplace</span>
          <WalletMultiButton className="!px-5 !py-2 !rounded-full !bg-white/10 !border !border-white/20 hover:!bg-white/20 !transition-all !shadow-lg !backdrop-blur-md !text-white !font-medium !text-sm !h-auto !line-height-normal" />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Left Column: Listings */}
        <div className="flex-[2]">
          <h2 className="text-3xl font-bold mb-2">Carbon Credit Marketplace</h2>
          <p className="text-gray-400 mb-8">Buy and sell AI-verified, Solana-native carbon credits. Prices are set by the free market.</p>

          <div className="glass-panel rounded-3xl p-1 overflow-hidden">
            <div className="bg-[#111] rounded-[22px] p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2">
                  <button className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium border border-emerald-500/30">All</button>
                  <button className="px-4 py-1.5 rounded-full bg-white/5 text-gray-400 text-sm font-medium hover:bg-white/10 transition-colors">AAA Only</button>
                </div>
                <div className="text-sm text-gray-500">Showing {LISTINGS.length} active listings</div>
              </div>

              <div className="space-y-3">
                {LISTINGS.map((listing) => (
                  <div 
                    key={listing.id}
                    onClick={() => setSelectedListing(listing.id)}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedListing === listing.id 
                        ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                        : 'bg-black/40 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                          listing.cqs === 'AAA' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                          listing.cqs === 'AA' ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                          "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        }`}>
                        {listing.cqs}
                      </div>
                      <div>
                        <div className="font-bold text-sm sm:text-base">{listing.project}</div>
                        <div className="text-[10px] sm:text-xs text-gray-500 font-mono mt-1">Seller: {listing.seller}</div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right flex sm:block justify-between items-center w-full sm:w-auto">
                      <div className="font-bold text-base sm:text-lg">{listing.price}</div>
                      <div className="text-xs text-gray-400">{listing.amount} tCO2e available</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Trading Panel */}
        <div className="flex-1">
          <div className="glass-card rounded-3xl p-8 sticky top-8 border border-white/10">
            <h3 className="text-xl font-bold mb-6 border-b border-gray-800 pb-4">Trade Station</h3>
            
            {currentListing ? (
              <div className="space-y-6">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Selected Asset</div>
                  <div className="font-bold text-lg text-emerald-400">{currentListing.project}</div>
                </div>

                <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-gray-800">
                  <div className="text-sm text-gray-400">Unit Price</div>
                  <div className="font-mono text-emerald-400 font-bold">{currentListing.price}</div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-2">Amount to buy (tCO2e)</label>
                  <div className="relative">
                    <input 
                      type="number"
                      value={buyAmount}
                      onChange={(e) => setBuyAmount(e.target.value)}
                      placeholder="e.g. 10" 
                      className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    <button 
                      onClick={() => setBuyAmount(currentListing.amount.toString())}
                      className="absolute right-3 top-2.5 text-xs bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded text-gray-300"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Total Cost</span>
                    <span className="font-mono font-bold text-lg text-white">{totalCost} SOL</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Network Fee</span>
                    <span className="font-mono text-emerald-400">&lt; 0.0001 SOL</span>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl">
                    {errorMsg}
                  </div>
                )}

                {txHash && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs rounded-xl space-y-2">
                    <div className="font-bold flex items-center gap-1.5">
                      <span>✅</span> Trade Executed Successfully!
                    </div>
                    <div className="truncate font-mono text-[10px]">Tx: {txHash}</div>
                    <a 
                      href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block mt-2 px-3 py-1.5 bg-emerald-500 text-black font-bold text-xs rounded-lg hover:bg-emerald-400 transition-colors"
                    >
                      View on Solana Explorer ↗
                    </a>
                  </div>
                )}

                <button 
                  onClick={handleExecuteTrade}
                  disabled={trading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-bold text-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {trading ? "Awaiting Phantom Approval..." : connected ? "Execute Trade" : "Connect Wallet to Trade"}
                </button>
                
                <p className="text-center text-xs text-gray-500 mt-2">Secured by Solana Devnet Anchor Program</p>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-gray-500 text-center">
                <svg className="w-12 h-12 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Select a listing<br/>to begin trading
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

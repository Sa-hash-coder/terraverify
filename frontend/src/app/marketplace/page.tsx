"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  ArrowUpDown, 
  ShieldAlert, 
  ShieldCheck, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  ShoppingBag, 
  Tag, 
  Layers, 
  ChevronRight,
  TrendingUp,
  Plus,
  Minus,
  Sparkles,
  Flame,
  LogOut
} from "lucide-react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Transaction, SystemProgram, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

import PageShell from "../../components/layout/page-shell";
import { 
  PageHeader, 
  Panel, 
  DataRow, 
  Stat, 
  StatusBadge, 
  GradeBadge, 
  AddressChip, 
  Skeleton, 
  EmptyState,
  SegmentedControl
} from "../../components/shared/design-system";

export interface MarketplaceListing {
  id: number;
  project: string;
  region: string;
  grade: "AAA" | "AA" | "A" | "B" | "C";
  ndvi: number;
  status: "Verified" | "Suspended" | "Revoked";
  priceNum: number;
  amount: number;
  seller: string;
  image: string;
  lastVerified: string;
  revocationReason?: string;
}

const INITIAL_LISTINGS: MarketplaceListing[] = [
  {
    id: 1,
    project: "Amazon Reforestation Block 7",
    region: "Amazonas, Brazil",
    grade: "AAA",
    ndvi: 0.845,
    status: "Verified",
    priceNum: 0.15,
    amount: 500,
    seller: "Efnm4SRpWogLYYMXnrrwbJ1i7WFbM343rtoASXkxwkoC",
    image: "/amazon.png",
    lastVerified: "2 hours ago",
  },
  {
    id: 2,
    project: "Congo Basin Conservation",
    region: "Équateur, DRC",
    grade: "AA",
    ndvi: 0.812,
    status: "Verified",
    priceNum: 0.12,
    amount: 1200,
    seller: "9B2aRt55wQpxNMJ928YzpQ111111111111111111111",
    image: "/satellite_hero.jpg",
    lastVerified: "5 hours ago",
  },
  {
    id: 3,
    project: "Amazon Reforestation Block 7",
    region: "Amazonas, Brazil",
    grade: "AAA",
    ndvi: 0.845,
    status: "Verified",
    priceNum: 0.16,
    amount: 250,
    seller: "4TyH89kLM12389PqaVb1111111111111111111111111",
    image: "/amazon.png",
    lastVerified: "2 hours ago",
  },
  {
    id: 4,
    project: "Borneo Peatland Protection",
    region: "Central Kalimantan, ID",
    grade: "C",
    ndvi: 0.584,
    status: "Suspended",
    priceNum: 0.05,
    amount: 820,
    seller: "7aZk9LpPeN4392Mka14441111111111111111111111",
    image: "/borneo.png",
    lastVerified: "12 hours ago",
    revocationReason:
      "Canopy fell below 80% baseline threshold. Token-2022 transfer hook prohibits all buy/transfer trades.",
  },
  {
    id: 5,
    project: "Sumatra Tiger Reserve",
    region: "Sumatra, Indonesia",
    grade: "A",
    ndvi: 0.760,
    status: "Verified",
    priceNum: 0.08,
    amount: 3500,
    seller: "3KqmRt88xPqLM09187111111111111111111111111",
    image: "/amazon.png",
    lastVerified: "1 day ago",
  },
];

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<"market" | "holdings" | "list">("market");
  const [listings, setListings] = useState<MarketplaceListing[]>(INITIAL_LISTINGS);
  const [selectedListingId, setSelectedListingId] = useState<number>(1);
  const [buyAmount, setBuyAmount] = useState<string>("10");
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [showSuspended, setShowSuspended] = useState(true);
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "amount-desc">("price-asc");

  // Trading status
  const [trading, setTrading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New listing form state
  const [newProjectName, setNewProjectName] = useState("Amazon Reforestation Block 7");
  const [newAmount, setNewAmount] = useState("100");
  const [newPrice, setNewPrice] = useState("0.15");
  const [listSuccess, setListSuccess] = useState(false);

  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
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

  const isWalletActive = Boolean(connected && publicKey) || Boolean(localWallet?.publicKey);
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
    setWalletBalance(null);
    window.dispatchEvent(new Event("storage"));
  };

  // Fetch wallet SOL balance (from adapter or local wallet)
  useEffect(() => {
    if (connected && publicKey) {
      connection.getBalance(publicKey).then((lamports) => {
        setWalletBalance(lamports / 1e9);
      }).catch(() => {
        setWalletBalance(null);
      });
    } else if (localWallet?.publicKey) {
      try {
        const pk = new PublicKey(localWallet.publicKey);
        connection.getBalance(pk).then((lamports) => {
          setWalletBalance(lamports / 1e9);
        }).catch(() => {
          setWalletBalance(localWallet.balance ?? 1.0);
        });
      } catch {
        setWalletBalance(localWallet.balance ?? 1.0);
      }
    } else {
      setWalletBalance(null);
    }
  }, [connected, publicKey, localWallet, connection, txHash]);

  const selectedListing = useMemo(
    () => listings.find((l) => l.id === selectedListingId) || listings[0],
    [listings, selectedListingId]
  );

  const amountNum = parseFloat(buyAmount) || 0;
  const unitPrice = selectedListing ? selectedListing.priceNum : 0;
  const totalCost = (amountNum * unitPrice).toFixed(3);
  const totalCostNum = parseFloat(totalCost);
  const isSuspended = selectedListing?.status === "Suspended" || selectedListing?.status === "Revoked";
  const hasInsufficientBalance = walletBalance !== null && totalCostNum > walletBalance;

  // Filter & Sort
  const filteredListings = useMemo(() => {
    return listings
      .filter((l) => {
        const matchesSearch =
          l.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.seller.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGrade = gradeFilter === "all" ? true : l.grade === gradeFilter;
        const matchesSuspended = showSuspended ? true : l.status === "Verified";
        return matchesSearch && matchesGrade && matchesSuspended;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.priceNum - b.priceNum;
        if (sortBy === "price-desc") return b.priceNum - a.priceNum;
        if (sortBy === "amount-desc") return b.amount - a.amount;
        return 0;
      });
  }, [listings, searchQuery, gradeFilter, showSuspended, sortBy]);

  // Execute on-chain trade
  const handleExecuteTrade = async () => {
    setErrorMsg(null);
    setTxHash(null);

    if (!connected || !publicKey) {
      setVisible(true);
      return;
    }

    if (isSuspended) {
      setErrorMsg("Trade blocked by Token-2022 transfer hook. Parcel canopy is degraded.");
      return;
    }

    if (!selectedListing || amountNum <= 0) {
      setErrorMsg("Please enter a valid credit quantity.");
      return;
    }

    if (amountNum > selectedListing.amount) {
      setErrorMsg(`Maximum available for this listing is ${selectedListing.amount} tCO2e.`);
      return;
    }

    if (hasInsufficientBalance) {
      setErrorMsg(`Insufficient balance: you need ${totalCost} SOL but have ${walletBalance?.toFixed(3)} SOL.`);
      return;
    }

    try {
      setTrading(true);

      const recipient = new PublicKey("Efnm4SRpWogLYYMXnrrwbJ1i7WFbM343rtoASXkxwkoC");
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipient,
          lamports: Math.round(0.001 * LAMPORTS_PER_SOL), // Nominal Devnet test trade
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      setTxHash(signature);

      // Decrement available amount locally
      setListings((prev) =>
        prev.map((l) => (l.id === selectedListing.id ? { ...l, amount: Math.max(0, l.amount - amountNum) } : l))
      );
    } catch (err: unknown) {
      const errStr = err instanceof Error ? err.message : String(err);
      if (errStr.includes("User rejected")) {
        setErrorMsg("Transaction was declined in your wallet.");
      } else {
        setErrorMsg(errStr || "Trade execution failed on Solana Devnet.");
      }
    } finally {
      setTrading(false);
    }
  };

  // Handle new listing submission
  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(newAmount);
    const prc = parseFloat(newPrice);
    if (!qty || !prc) return;

    const newEntry: MarketplaceListing = {
      id: Date.now(),
      project: newProjectName,
      region: newProjectName.includes("Amazon") ? "Amazonas, Brazil" : "Équateur, DRC",
      grade: "AAA",
      ndvi: 0.845,
      status: "Verified",
      priceNum: prc,
      amount: qty,
      seller: publicKey ? publicKey.toBase58() : "Self (Connected)",
      image: "/amazon.png",
      lastVerified: "Just now",
    };

    setListings([newEntry, ...listings]);
    setListSuccess(true);
    setTimeout(() => {
      setListSuccess(false);
      setActiveTab("market");
      setSelectedListingId(newEntry.id);
    }, 1500);
  };

  return (
    <PageShell>
      <PageHeader
        title="Carbon Credit Marketplace"
        description="Buy and sell satellite-verified, on-chain carbon credits settled on Solana."
        actions={
          <SegmentedControl
            value={activeTab}
            onChange={setActiveTab}
            options={[
              { value: "market", label: "Catalog" },
              { value: "holdings", label: "My Holdings" },
              { value: "list", label: "List Credits" },
            ]}
          />
        }
      />

      {/* Tab 1: Market Catalog */}
      {activeTab === "market" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Table / List (8 Columns) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Filter Toolbar */}
            <Panel className="p-3.5 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                {/* Search */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search project or seller..."
                    className="w-full bg-[var(--surface-raised)] border border-[var(--border)] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>

                {/* Grade Chips */}
                <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  <span className="text-[11px] text-[var(--text-muted)] mr-1 hidden sm:inline">Grade:</span>
                  {["all", "AAA", "AA", "A", "C"].map((grade) => (
                    <button
                      key={grade}
                      onClick={() => setGradeFilter(grade)}
                      className={`px-2 py-0.5 rounded text-xs font-mono transition-colors cursor-pointer ${
                        gradeFilter === grade
                          ? "bg-[var(--accent-subtle)] text-[var(--accent)] font-bold border border-[var(--accent)]/30"
                          : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)]"
                      }`}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status and Sort Bar */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border-subtle)]">
                <label className="flex items-center gap-2 cursor-pointer text-[var(--text-muted)] hover:text-[var(--text)]">
                  <input
                    type="checkbox"
                    checked={showSuspended}
                    onChange={(e) => setShowSuspended(e.target.checked)}
                    className="rounded accent-[var(--accent)] w-3.5 h-3.5"
                  />
                  <span>Show suspended projects (Oracle Hook)</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-muted)] text-[11px]">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "price-asc" | "price-desc" | "amount-desc")}
                    className="bg-[var(--surface-raised)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="amount-desc">Volume: High to Low</option>
                  </select>
                </div>
              </div>
            </Panel>

            {/* Listings Table */}
            <Panel className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--surface-raised)] border-b border-[var(--border)] text-[var(--text-muted)] font-mono text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Project</th>
                      <th className="py-3 px-3">Grade</th>
                      <th className="py-3 px-3">NDVI</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Price (SOL)</th>
                      <th className="py-3 px-3 text-right">Available</th>
                      <th className="py-3 px-4 text-right">Seller</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {filteredListings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-[var(--text-muted)]">
                          No carbon credit listings found matching the selected criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredListings.map((item) => {
                        const isSelected = selectedListingId === item.id;
                        const isRevoked = item.status === "Suspended" || item.status === "Revoked";

                        return (
                          <tr
                            key={item.id}
                            onClick={() => setSelectedListingId(item.id)}
                            className={`transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-[var(--accent-subtle)]/50"
                                : isRevoked
                                ? "bg-[var(--danger-subtle)]/40 hover:bg-[var(--danger-subtle)]/60"
                                : "hover:bg-[var(--surface-raised)]/60"
                            }`}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.image}
                                  alt={item.project}
                                  className="w-9 h-9 rounded object-cover border border-[var(--border)] shrink-0"
                                />
                                <div>
                                  <div className="font-semibold text-[var(--text)] leading-tight">
                                    {item.project}
                                  </div>
                                  <div className="text-[11px] text-[var(--text-muted)]">
                                    {item.region}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <GradeBadge grade={item.grade} />
                            </td>
                            <td className="py-3 px-3 font-mono text-[var(--text)]">
                              {item.ndvi.toFixed(3)}
                            </td>
                            <td className="py-3 px-3">
                              <StatusBadge status={item.status} size="sm" />
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-[var(--text)]">
                              {item.priceNum.toFixed(2)} SOL
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-[var(--text-muted)]">
                              {item.amount.toLocaleString()} t
                            </td>
                            <td className="py-3 px-4 text-right">
                              <AddressChip address={item.seller} truncateLen={3} />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>

          {/* Right Sticky Trade Panel (4 Columns) */}
          <div className="lg:col-span-4 sticky top-24">
            <Panel className="p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                  Trade Execution
                </span>
                <span className="text-xs font-mono text-[var(--accent)] font-medium">
                  SPL Token-2022
                </span>
              </div>

              {selectedListing ? (
                <>
                  {/* Selected Item Card */}
                  <div className="flex gap-3 items-center p-3 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)]">
                    <img
                      src={selectedListing.image}
                      alt={selectedListing.project}
                      className="w-12 h-12 rounded object-cover border border-[var(--border)]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <GradeBadge grade={selectedListing.grade} />
                        <span className="text-xs font-bold text-[var(--text)] truncate">
                          {selectedListing.project}
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] font-mono">
                        {selectedListing.priceNum.toFixed(2)} SOL / tCO2e
                      </div>
                    </div>
                  </div>

                  {/* Suspended Hook Warning Banner */}
                  {isSuspended && (
                    <div className="p-3.5 rounded-lg bg-[var(--danger-subtle)] border border-[var(--danger)]/30 text-xs text-[var(--danger)] space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>Trading Prohibited by Oracle</span>
                      </div>
                      <p className="text-[11px] text-[var(--text)] leading-relaxed">
                        {selectedListing.revocationReason ||
                          "This project has been suspended due to canopy telemetry loss. Token-2022 Transfer Hook refuses settlement."}
                      </p>
                    </div>
                  )}

                  {/* Quantity Input */}
                  <div className="space-y-1.5 text-left">
                    <div className="flex items-center justify-between text-xs">
                      <label className="text-[var(--text-muted)] font-medium">Quantity (tCO2e)</label>
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">
                        Avail: {selectedListing.amount} t
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-[var(--border)] rounded-lg bg-[var(--surface-raised)] px-3 py-2 flex-1 focus-within:border-[var(--accent)] transition-colors">
                        <input
                          type="number"
                          min="1"
                          max={selectedListing.amount}
                          value={buyAmount}
                          onChange={(e) => setBuyAmount(e.target.value)}
                          disabled={isSuspended}
                          className="w-full bg-transparent text-sm font-mono text-[var(--text)] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setBuyAmount(String(selectedListing.amount))}
                          disabled={isSuspended}
                          className="text-[11px] font-mono font-bold text-[var(--accent)] hover:underline px-1 cursor-pointer"
                        >
                          MAX
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Cost Summary Breakdown */}
                  <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)] text-xs font-mono">
                    <div className="flex justify-between text-[var(--text-muted)]">
                      <span>Subtotal</span>
                      <span className="text-[var(--text)] font-medium">{totalCost} SOL</span>
                    </div>
                    <div className="flex justify-between text-[var(--text-muted)]">
                      <span>Network Fee</span>
                      <span className="text-[var(--text-muted)]">~0.00005 SOL</span>
                    </div>
                    <div className="flex justify-between text-[var(--text-muted)]">
                      <span>Wallet Balance</span>
                      <div className="flex items-center gap-2">
                        <span className={hasInsufficientBalance ? "text-[var(--danger)] font-bold" : "text-[var(--text)] font-medium"}>
                          {walletBalance !== null ? `${walletBalance.toFixed(3)} SOL` : "Not connected"}
                        </span>
                        {isWalletActive && (
                          <button
                            type="button"
                            onClick={handleDisconnectWallet}
                            className="text-[10px] text-[var(--danger)] hover:underline cursor-pointer"
                            title="Disconnect connected wallet"
                          >
                            [Disconnect]
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-[var(--text)] pt-2 border-t border-[var(--border-subtle)]">
                      <span>Total</span>
                      <span className="text-[var(--accent)]">{totalCost} SOL</span>
                    </div>
                  </div>

                  {/* Feedback Message */}
                  {errorMsg && (
                    <div className="p-2.5 rounded bg-[var(--danger-subtle)] border border-[var(--danger)]/30 text-xs text-[var(--danger)] flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {txHash && (
                    <div className="p-3 rounded bg-[var(--accent-subtle)] border border-[var(--accent)]/30 text-xs text-[var(--accent)] space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[var(--accent)]" />
                        <span>Trade Confirmed on Solana Devnet</span>
                      </div>
                      <a
                        href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] underline flex items-center gap-1 break-all text-[var(--accent)]"
                      >
                        <span>View signature: {txHash.slice(0, 16)}...</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {/* Action Button */}
                  {!isWalletActive ? (
                    <button
                      onClick={() => setVisible(true)}
                      className="w-full py-3 px-4 rounded-lg bg-[var(--accent)] hover:opacity-90 text-[var(--bg-app)] font-semibold text-xs transition-opacity cursor-pointer shadow-xs"
                    >
                      Connect Wallet to Trade
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={handleExecuteTrade}
                        disabled={trading || isSuspended || hasInsufficientBalance}
                        className={`w-full py-3 px-4 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                          isSuspended
                            ? "bg-[var(--surface-raised)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border)]"
                            : hasInsufficientBalance
                            ? "bg-[var(--danger-subtle)] text-[var(--danger)] cursor-not-allowed border border-[var(--danger)]/30"
                            : "bg-[var(--accent)] hover:opacity-90 text-[var(--bg-app)]"
                        }`}
                      >
                        {trading ? (
                          <span>Submitting to Solana...</span>
                        ) : isSuspended ? (
                          <span>Trading Blocked by Hook</span>
                        ) : hasInsufficientBalance ? (
                          <span>Insufficient SOL Balance</span>
                        ) : (
                          <span>Execute Buy Order ({totalCost} SOL)</span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleDisconnectWallet}
                        className="w-full py-2 px-3 rounded-lg border border-[var(--danger)]/30 hover:bg-[var(--danger-subtle)] text-[var(--danger)] font-medium text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        title="Disconnect current wallet"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Disconnect Wallet {activePubkey ? `(${activePubkey.slice(0, 4)}...${activePubkey.slice(-4)})` : ""}</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <EmptyState
                  title="No Listing Selected"
                  description="Click on any row in the catalog to prepare a trade."
                />
              )}
            </Panel>
          </div>
        </div>
      )}

      {/* Tab 2: My Holdings */}
      {activeTab === "holdings" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Stat label="Total Holdings" value="300 tCO2e" subtext="Across 2 verified projects" />
            <Stat label="Estimated Value" value="45.00 SOL" subtext="Current market midpoint" />
            <Stat label="Retired to Date" value="12,500 tCO2e" subtext="Permanent on-chain burns" />
          </div>

          <Panel className="p-6">
            <h3 className="text-sm font-bold text-[var(--text)] mb-4">
              Active Ecological Token Balances
            </h3>

            <div className="divide-y divide-[var(--border-subtle)] text-xs">
              <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src="/amazon.png"
                    alt="Amazon Block 7"
                    className="w-10 h-10 rounded object-cover border border-[var(--border)]"
                  />
                  <div>
                    <div className="font-bold text-[var(--text)]">
                      Amazon Reforestation Block 7
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      Token ID: TCO2-AMZ7 · Grade AAA · 100% Intact
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right font-mono">
                    <div className="font-bold text-[var(--text)]">250 tCO2e</div>
                    <div className="text-[11px] text-[var(--accent)]">~37.5 SOL value</div>
                  </div>
                  <Link
                    href="/retire?project=Amazon%20Reforestation%20Block%207&amount=250"
                    className="px-3.5 py-1.5 rounded-lg bg-[var(--accent)] hover:opacity-90 text-[var(--bg-app)] font-semibold text-xs transition-opacity flex items-center gap-1.5 shadow-xs"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Retire Credits</span>
                  </Link>
                </div>
              </div>

              <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src="/satellite_hero.jpg"
                    alt="Congo Basin"
                    className="w-10 h-10 rounded object-cover border border-[var(--border)]"
                  />
                  <div>
                    <div className="font-bold text-[var(--text)]">
                      Congo Basin Conservation
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      Token ID: TCO2-CGO2 · Grade AA · 100% Intact
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right font-mono">
                    <div className="font-bold text-[var(--text)]">50 tCO2e</div>
                    <div className="text-[11px] text-[var(--accent)]">~6.0 SOL value</div>
                  </div>
                  <Link
                    href="/retire?project=Congo%20Basin%20Conservation&amount=50"
                    className="px-3.5 py-1.5 rounded-lg bg-[var(--accent)] hover:opacity-90 text-[var(--bg-app)] font-semibold text-xs transition-opacity flex items-center gap-1.5 shadow-xs"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Retire Credits</span>
                  </Link>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {/* Tab 3: List Credits For Sale */}
      {activeTab === "list" && (
        <div className="max-w-2xl mx-auto">
          <Panel className="p-8 space-y-6">
            <div>
              <h3 className="text-base font-bold text-[var(--text)]">
                Create Carbon Credit Sell Order
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                List verified credits from your wallet on the decentralized order book.
              </p>
            </div>

            {listSuccess && (
              <div className="p-3 rounded bg-[var(--accent-subtle)] border border-[var(--accent)]/30 text-xs text-[var(--accent)] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--accent)]" />
                <span>Order published! Redirecting to catalog...</span>
              </div>
            )}

            <form onSubmit={handleCreateListing} className="space-y-4 text-xs text-left">
              <div>
                <label className="text-[var(--text-muted)] block mb-1.5 font-medium">Select Monitored Project</label>
                <select
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="Amazon Reforestation Block 7" className="bg-[var(--surface)]">Amazon Reforestation Block 7 (Grade AAA)</option>
                  <option value="Congo Basin Conservation" className="bg-[var(--surface)]">Congo Basin Conservation (Grade AA)</option>
                  <option value="Sumatra Tiger Reserve" className="bg-[var(--surface)]">Sumatra Tiger Reserve (Grade A)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[var(--text-muted)] block mb-1.5 font-medium">Quantity to Sell (tCO2e)</label>
                  <input
                    type="number"
                    min="1"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text)] font-mono focus:outline-none focus:border-[var(--accent)]"
                    placeholder="100"
                    required
                  />
                </div>

                <div>
                  <label className="text-[var(--text-muted)] block mb-1.5 font-medium">Asking Price per Ton (SOL)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text)] font-mono focus:outline-none focus:border-[var(--accent)]"
                    placeholder="0.15"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-subtle)]">
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-[var(--accent)] hover:opacity-90 text-[var(--bg-app)] font-semibold text-xs transition-opacity cursor-pointer shadow-xs"
                >
                  Publish Sell Order to Solana Order Book
                </button>
              </div>
            </form>
          </Panel>
        </div>
      )}
    </PageShell>
  );
}

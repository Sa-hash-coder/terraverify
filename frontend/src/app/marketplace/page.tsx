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
  Flame,
  LogOut,
  Droplet,
  Loader2,
  Wallet,
  CreditCard,
  Trees,
  Leaf,
  Sparkles,
  Award,
  Globe,
  Receipt
} from "lucide-react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Transaction, SystemProgram, LAMPORTS_PER_SOL, PublicKey, TransactionInstruction } from "@solana/web3.js";

import PageShell from "../../components/layout/page-shell";
import ForestMarketSimulation from "../../components/marketplace/forest-market-simulation";
import WalletDialog from "../../components/wallet/wallet-dialog";
import FiatOnrampModal, { FiatOnrampAsset } from "../../components/marketplace/fiat-onramp-modal";
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
  assetType: "forest_share" | "carbon_credit";
  unit: "ha" | "tCO2e";
  carbonYieldApy?: number;
  parcelId?: string;
  totalHectares?: number;
}

const INITIAL_LISTINGS: MarketplaceListing[] = [
  {
    id: 101,
    project: "Amazon Canopy Reserve Share",
    region: "Amazonas, Brazil",
    grade: "AAA",
    ndvi: 0.845,
    status: "Verified",
    priceNum: 0.15,
    amount: 150,
    seller: "Efnm4SRpWogLYYMXnrrwbJ1i7WFbM343rtoASXkxwkoC",
    image: "/amazon.png",
    lastVerified: "1 hour ago",
    assetType: "forest_share",
    unit: "ha",
    carbonYieldApy: 14.8,
    parcelId: "BR-07-AM",
    totalHectares: 12500,
  },
  {
    id: 102,
    project: "Valdivian Temperate Rainforest Share",
    region: "Los Ríos, Chile",
    grade: "AAA",
    ndvi: 0.862,
    status: "Verified",
    priceNum: 0.18,
    amount: 85,
    seller: "8xK9mPqr4441111111111111111111111111111111",
    image: "/satellite_hero.jpg",
    lastVerified: "3 hours ago",
    assetType: "forest_share",
    unit: "ha",
    carbonYieldApy: 16.4,
    parcelId: "CL-01-VAL",
    totalHectares: 8200,
  },
  {
    id: 103,
    project: "Congo Basin Old-Growth Forest Share",
    region: "Équateur, DRC",
    grade: "AA",
    ndvi: 0.812,
    status: "Verified",
    priceNum: 0.12,
    amount: 320,
    seller: "9B2aRt55wQpxNMJ928YzpQ111111111111111111111",
    image: "/satellite_hero.jpg",
    lastVerified: "5 hours ago",
    assetType: "forest_share",
    unit: "ha",
    carbonYieldApy: 12.2,
    parcelId: "CG-02-IK",
    totalHectares: 24000,
  },
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
    assetType: "carbon_credit",
    unit: "tCO2e",
    parcelId: "BR-07-AM",
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
    assetType: "carbon_credit",
    unit: "tCO2e",
    parcelId: "CG-02-IK",
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
    assetType: "carbon_credit",
    unit: "tCO2e",
    parcelId: "ID-03-BOR",
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
    assetType: "carbon_credit",
    unit: "tCO2e",
    parcelId: "ID-05-SUM",
  },
];

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<"market" | "holdings" | "list">("market");
  const [listings, setListings] = useState<MarketplaceListing[]>(INITIAL_LISTINGS);
  const [selectedListingId, setSelectedListingId] = useState<number>(101);
  const [buyAmount, setBuyAmount] = useState<string>("0.25");
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [assetTypeFilter, setAssetTypeFilter] = useState<"all" | "forest_share" | "carbon_credit">("all");
  const [showSuspended, setShowSuspended] = useState(true);
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "amount-desc">("price-asc");

  // Trading status
  const [trading, setTrading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fiat onramp modal
  const [fiatModalOpen, setFiatModalOpen] = useState(false);
  const [fiatModalMode, setFiatModalMode] = useState<"buy_sol" | "buy_asset">("buy_asset");
  const [userHoldings, setUserHoldings] = useState<any[]>([]);

  // New listing form state
  const [newProjectName, setNewProjectName] = useState("Amazon Canopy Reserve Share");
  const [newAssetType, setNewAssetType] = useState<"forest_share" | "carbon_credit">("forest_share");
  const [newAmount, setNewAmount] = useState("50");
  const [newPrice, setNewPrice] = useState("0.15");
  const [listSuccess, setListSuccess] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);

  // Sync holdings from localStorage
  const syncHoldings = () => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("terra_user_holdings");
        if (saved) {
          setUserHoldings(JSON.parse(saved));
          return;
        }
      } catch {}
      setUserHoldings([]);
    }
  };

  useEffect(() => {
    syncHoldings();
    const handleHoldingsUpdate = () => syncHoldings();
    window.addEventListener("storage", handleHoldingsUpdate);
    window.addEventListener("terra_holdings_updated", handleHoldingsUpdate);
    return () => {
      window.removeEventListener("storage", handleHoldingsUpdate);
      window.removeEventListener("terra_holdings_updated", handleHoldingsUpdate);
    };
  }, []);

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
    window.addEventListener("terra_wallet_change", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("terra_wallet_change", handleStorage);
    };
  }, []);

  const isWalletActive = Boolean(connected && publicKey) || Boolean(localWallet?.publicKey);
  const activePubkey = publicKey ? publicKey.toBase58() : localWallet?.publicKey || null;

  const [airdropping, setAirdropping] = useState(false);
  const [airdropMsg, setAirdropMsg] = useState<string | null>(null);

  const handleRequestAirdrop = async () => {
    if (!activePubkey) return;
    setAirdropping(true);
    setAirdropMsg(null);
    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "airdrop",
          publicKey: activePubkey,
        }),
      });
      const data = await res.json();
      if (data.success && typeof data.balance === "number") {
        setWalletBalance(data.balance);
        setAirdropMsg("1.0 SOL funded!");
        setTimeout(() => setAirdropMsg(null), 3000);
      } else {
        const pk = new PublicKey(activePubkey);
        const sig = await connection.requestAirdrop(pk, LAMPORTS_PER_SOL);
        const latest = await connection.getLatestBlockhash();
        await connection.confirmTransaction({ signature: sig, ...latest }, "confirmed");
        const bal = await connection.getBalance(pk);
        setWalletBalance(bal / LAMPORTS_PER_SOL);
        setAirdropMsg("1.0 SOL funded!");
        setTimeout(() => setAirdropMsg(null), 3000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("429")) {
        setAirdropMsg("Faucet rate limit. Please retry in 1m.");
      } else {
        setAirdropMsg("Airdrop request failed");
      }
      setTimeout(() => setAirdropMsg(null), 4000);
    } finally {
      setAirdropping(false);
    }
  };

  const handleDisconnectWallet = () => {
    if (connected) {
      disconnect().catch(() => {});
    }
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("terra_local_wallet");
        localStorage.removeItem("walletName");
      } catch {}
    }
    setLocalWallet(null);
    setWalletBalance(null);
    window.dispatchEvent(new Event("storage"));
  };

  // Fetch wallet SOL balance with robust fallback
  useEffect(() => {
    let isCancelled = false;
    const fetchBal = async (pk: PublicKey) => {
      try {
        const balPromise = connection.getBalance(pk);
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000));
        const lamports = await Promise.race([balPromise, timeoutPromise]);
        if (!isCancelled) {
          if (typeof lamports === "number") {
            setWalletBalance(lamports / 1e9);
          } else {
            setWalletBalance((prev) => (prev !== null ? prev : localWallet?.balance ?? 1.0));
          }
        }
      } catch {
        if (!isCancelled) {
          setWalletBalance((prev) => (prev !== null ? prev : localWallet?.balance ?? 1.0));
        }
      }
    };

    if (connected && publicKey) {
      setWalletBalance((prev) => (prev !== null ? prev : localWallet?.balance ?? 1.0));
      fetchBal(publicKey);
    } else if (localWallet?.publicKey) {
      setWalletBalance((prev) => (prev !== null ? prev : localWallet.balance ?? 1.0));
      try {
        const pk = new PublicKey(localWallet.publicKey);
        fetchBal(pk);
      } catch {
        setWalletBalance(localWallet.balance ?? 1.0);
      }
    } else {
      setWalletBalance(null);
    }
    return () => {
      isCancelled = true;
    };
  }, [connected, publicKey, localWallet, connection, txHash]);

  const selectedListing = useMemo(
    () => listings.find((l) => l.id === selectedListingId) || listings[0],
    [listings, selectedListingId]
  );

  // Sync default quantity when selecting a different asset type
  useEffect(() => {
    if (selectedListing) {
      if (selectedListing.assetType === "forest_share") {
        setBuyAmount((prev) => (parseFloat(prev) > 10 || parseFloat(prev) <= 0 ? "0.25" : prev));
      } else {
        setBuyAmount((prev) => (parseFloat(prev) < 1 ? "10" : prev));
      }
    }
  }, [selectedListingId, selectedListing]);

  const amountNum = parseFloat(buyAmount) || 0;
  const unitPrice = selectedListing ? selectedListing.priceNum : 0;
  const totalCost = (amountNum * unitPrice).toFixed(3);
  const totalCostNum = parseFloat(totalCost);
  const isSuspended = selectedListing?.status === "Suspended" || selectedListing?.status === "Revoked";
  const effectiveBalance = walletBalance ?? localWallet?.balance ?? (isWalletActive ? 1.0 : 0);
  const hasInsufficientBalance = isWalletActive && totalCostNum > effectiveBalance;

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
        const matchesAssetType = assetTypeFilter === "all" ? true : l.assetType === assetTypeFilter;
        return matchesSearch && matchesGrade && matchesSuspended && matchesAssetType;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.priceNum - b.priceNum;
        if (sortBy === "price-desc") return b.priceNum - a.priceNum;
        if (sortBy === "amount-desc") return b.amount - a.amount;
        return 0;
      });
  }, [listings, searchQuery, gradeFilter, showSuspended, sortBy, assetTypeFilter]);

  // Execute on-chain trade
  const handleExecuteTrade = async () => {
    setErrorMsg(null);
    setTxHash(null);

    const hasActiveWallet = Boolean(connected && publicKey) || Boolean(localWallet?.publicKey);
    if (!hasActiveWallet) {
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
      setErrorMsg(`Insufficient balance: you need ${totalCost} SOL but have ${effectiveBalance.toFixed(3)} SOL.`);
      return;
    }

    try {
      setTrading(true);

      const recipient = new PublicKey(
        selectedListing.seller && selectedListing.seller.length >= 32 && !selectedListing.seller.includes(" ")
          ? selectedListing.seller
          : "Efnm4SRpWogLYYMXnrrwbJ1i7WFbM343rtoASXkxwkoC"
      );
      const memoProgram = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
      const memoText = `TerraVerify Purchase: ${amountNum} tCO2e of ${selectedListing.project} @ ${unitPrice} SOL`;

      let signature: string;

      if (connected && publicKey) {
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: recipient,
            lamports: Math.max(1000, Math.round(Math.min(0.005, totalCostNum) * LAMPORTS_PER_SOL)),
          }),
          new TransactionInstruction({
            keys: [{ pubkey: publicKey, isSigner: true, isWritable: false }],
            programId: memoProgram,
            data: Buffer.from(memoText, "utf-8"),
          })
        );

        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        signature = await sendTransaction(transaction, connection);
      } else if (localWallet?.publicKey) {
        // Transact via in-app wallet
        const saved = typeof window !== "undefined" ? localStorage.getItem("terra_local_wallet") : null;
        const parsed = saved ? JSON.parse(saved) : null;
        if (!parsed?.secretKey) {
          throw new Error("Local wallet keys not found in storage. Please generate or connect a wallet.");
        }

        const res = await fetch("/api/wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "transact",
            secretKey: parsed.secretKey,
            toPublicKey: recipient.toBase58(),
            amountSol: Math.min(0.005, totalCostNum || 0.001),
            memo: memoText,
          }),
        });

        const resData = await res.json();
        if (!resData.success) {
          throw new Error(resData.error || "Trade execution failed");
        }
        signature = resData.signature;
      } else {
        setVisible(true);
        return;
      }

      setTxHash(signature);

      // Persist in user holdings
      if (typeof window !== "undefined" && selectedListing) {
        try {
          const currentHoldings = JSON.parse(localStorage.getItem("terra_user_holdings") || "[]");
          const deedId = selectedListing.parcelId || `DEED-${Math.floor(1000 + Math.random() * 9000)}-AMZ`;
          currentHoldings.unshift({
            id: Date.now(),
            name: selectedListing.project,
            region: selectedListing.region,
            assetType: selectedListing.assetType,
            unit: selectedListing.unit,
            amount: amountNum,
            solValue: totalCostNum,
            grade: selectedListing.grade,
            ndvi: selectedListing.ndvi,
            parcelId: deedId,
            txSignature: signature,
            receiptId: `TV-SOL-${Date.now().toString().slice(-6)}`,
            acquiredAt: new Date().toISOString(),
          });
          localStorage.setItem("terra_user_holdings", JSON.stringify(currentHoldings));
          setUserHoldings(currentHoldings);
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("terra_holdings_updated"));
        } catch {}
      }

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
      assetType: newAssetType,
      unit: newAssetType === "forest_share" ? "ha" : "tCO2e",
      carbonYieldApy: newAssetType === "forest_share" ? 14.5 : undefined,
      parcelId: "BR-07-AM",
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
    <PageShell requireAuth={false}>
      {/* Public Market Announcement Banner & Fiat Instant Top-up */}
      <section
        aria-label="Public Marketplace Announcement"
        className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#e6f4ea] via-[#f1f7f2] to-[#e7f2eb] border border-[#a3cfbb] flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white border border-[#a3cfbb] text-[#1e6b3b] flex items-center justify-center shrink-0 shadow-xs">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#0a3d2a]">
                Public Earth Observation Marketplace
              </span>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#1e6b3b] text-white tracking-wide">
                PUBLIC ACCESS OPEN
              </span>
            </div>
            <p className="text-xs text-[#4a6356] leading-relaxed mt-0.5">
              Co-own fractional hectares in certified rainforest reserves or acquire audited carbon offsets. Settle directly with Solana Devnet or checkout with Credit Card, Apple Pay, &amp; Real Money.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              setFiatModalMode("buy_sol");
              setFiatModalOpen(true);
            }}
            className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-[#0a3d2a] hover:bg-[#114d36] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Buy SOL with Card / Cash</span>
          </button>
        </div>
      </section>

      <PageHeader
        title="Forest Shares & Carbon Credits"
        description="Public market for fractional forest land equity and satellite-audited carbon offsets settled on Solana."
        actions={
          <SegmentedControl
            value={activeTab}
            onChange={setActiveTab}
            options={[
              { value: "market", label: "Catalog" },
              { value: "holdings", label: `My Holdings (${userHoldings.length + 2})` },
              { value: "list", label: "List Assets" },
            ]}
          />
        }
      />

      {/* Tab 1: Market Catalog */}
      {activeTab === "market" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Table / List (8 Columns) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Ongoing Forest Prices & Carbon Credit Return Simulation */}
            <ForestMarketSimulation
              selectedListingId={selectedListingId}
              onSelectForest={(forestId) => {
                setSelectedListingId(forestId);
              }}
            />

            {/* Filter Toolbar */}
            <Panel className="p-3.5 space-y-3">
              {/* Asset Type Filter Tabs: All Assets / Forest Shares / Carbon Credits */}
              <div className="flex flex-wrap items-center gap-2 p-1 bg-[#edf2ea] rounded-xl border border-[#d8ded4]">
                <button
                  type="button"
                  onClick={() => setAssetTypeFilter("all")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    assetTypeFilter === "all"
                      ? "bg-white text-[#0a3d2a] shadow-xs font-bold"
                      : "text-[#5c7366] hover:text-[#111e16]"
                  }`}
                >
                  All Assets ({listings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAssetTypeFilter("forest_share")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    assetTypeFilter === "forest_share"
                      ? "bg-white text-[#0a3d2a] shadow-xs font-bold"
                      : "text-[#5c7366] hover:text-[#111e16]"
                  }`}
                >
                  <Trees className="w-3.5 h-3.5 text-[#1e6b3b]" />
                  <span>🌲 Forest Shares (Hectares)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAssetTypeFilter("carbon_credit")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    assetTypeFilter === "carbon_credit"
                      ? "bg-white text-[#0a3d2a] shadow-xs font-bold"
                      : "text-[#5c7366] hover:text-[#111e16]"
                  }`}
                >
                  <Leaf className="w-3.5 h-3.5 text-[#2d6a4f]" />
                  <span>🌿 Carbon Credits (tCO2e)</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-1">
                {/* Search */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search forest project, parcel or region..."
                    className="w-full bg-[var(--surface-raised)] border border-[var(--border)] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>

                {/* Grade Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  <span className="text-[11px] text-[#5c7366] mr-1 hidden sm:inline font-semibold">Grade:</span>
                  {["all", "AAA", "AA", "A", "C"].map((grade) => (
                    <button
                      key={grade}
                      onClick={() => setGradeFilter(grade)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        gradeFilter === grade
                          ? "bg-[#2d6a4f] text-white shadow-xs"
                          : "bg-white text-[#5c7366] hover:text-[#111e16] border border-[#d6ded2] hover:bg-[#f0f4ee]"
                      }`}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status and Sort Bar */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border-subtle)]">
                <label className="flex items-center gap-2 cursor-pointer text-[#5c7366] hover:text-[#111e16]">
                  <input
                    type="checkbox"
                    checked={showSuspended}
                    onChange={(e) => setShowSuspended(e.target.checked)}
                    className="rounded accent-[#2d6a4f] w-3.5 h-3.5"
                  />
                  <span className="font-medium">Show suspended projects (Oracle Hook)</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-[#5c7366] text-[11px] font-medium">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "price-asc" | "price-desc" | "amount-desc")}
                    className="bg-[#f0f4ee] border border-[#e1e8de] rounded-lg px-2.5 py-1 text-xs text-[#111e16] font-medium focus:outline-none focus:border-[#2d6a4f]"
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
                  <thead className="bg-[#f0f4ee] border-b border-[#dbe3d8] text-[#5c7366] font-mono text-[11px] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Project / Asset</th>
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Grade</th>
                      <th className="py-3 px-3">NDVI</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Price (SOL / USD)</th>
                      <th className="py-3 px-3 text-right">Available</th>
                      <th className="py-3 px-4 text-right">Seller</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {filteredListings.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-[#5c7366]">
                          No listings found matching the selected criteria.
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
                                ? "bg-[#e6f4ea]/70 border-l-4 border-l-[#2d6a4f]"
                                : isRevoked
                                ? "bg-[#fce8e8]/50 hover:bg-[#fce8e8]/70"
                                : "hover:bg-[#f4f6f3]"
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
                                    {item.region} {item.parcelId ? `· Parcel ${item.parcelId}` : ""}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              {item.assetType === "forest_share" ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#e6f4ea] text-[#1e6b3b] border border-[#a3cfbb]">
                                  <Trees className="w-3 h-3 shrink-0" />
                                  <span>Forest Share ({item.carbonYieldApy}% APY)</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#f4f7f4] text-[#4a6356] border border-[#d8ded4]">
                                  <Leaf className="w-3 h-3 text-[#2d6a4f] shrink-0" />
                                  <span>Carbon Credit</span>
                                </span>
                              )}
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
                            <td className="py-3 px-3 text-right font-mono">
                              <div className="font-bold text-[var(--text)]">
                                {item.priceNum.toFixed(2)} SOL
                              </div>
                              <div className="text-[10px] text-[#5c7366] font-normal">
                                ≈ ${(item.priceNum * 180).toFixed(2)}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-[var(--text-muted)]">
                              {item.amount.toLocaleString()} {item.unit}
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
            <Panel className="p-5 sm:p-6 space-y-4 shadow-xs border border-[#dbe3d8]">
              {/* Header with status and wallet chip */}
              <div className="flex items-center justify-between pb-3 border-b border-[#e1e8de]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#111e16] font-bold">
                    Trade Execution
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#e6f4ea] text-[#1e6b3b] border border-[#a3cfbb]">
                    SPL Token-2022
                  </span>
                </div>
                {isWalletActive && activePubkey ? (
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#5c7366] bg-[#f0f4ee] px-2 py-0.5 rounded-lg border border-[#dbe3d8]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1e6b3b]" />
                    <span>{activePubkey.slice(0, 4)}...{activePubkey.slice(-4)}</span>
                    <button
                      type="button"
                      onClick={handleDisconnectWallet}
                      className="text-[#c92a2a] hover:text-[#991b1b] p-0.5 rounded transition-colors cursor-pointer ml-1"
                      title="Disconnect wallet"
                    >
                      <LogOut className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] font-mono text-[#1e6b3b] font-bold bg-[#e6f4ea] px-2 py-0.5 rounded border border-[#a3cfbb]">
                    Public Guest
                  </span>
                )}
              </div>

              {selectedListing ? (
                <>
                  {/* Selected Item Card */}
                  <div className="flex gap-3 items-center p-3 rounded-xl bg-[#f0f4ee] border border-[#dbe3d8]">
                    <img
                      src={selectedListing.image}
                      alt={selectedListing.project}
                      className="w-12 h-12 rounded-lg object-cover border border-[#dbe3d8] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <GradeBadge grade={selectedListing.grade} />
                        {selectedListing.assetType === "forest_share" ? (
                          <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-[#e6f4ea] text-[#1e6b3b] border border-[#a3cfbb] flex items-center gap-1">
                            <Trees className="w-3 h-3" />
                            <span>Forest Share ({selectedListing.carbonYieldApy}% APY)</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-[#f4f7f4] text-[#4a6356] border border-[#d8ded4] flex items-center gap-1">
                            <Leaf className="w-3 h-3 text-[#2d6a4f]" />
                            <span>Carbon Credit</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-[#111e16] truncate">
                        {selectedListing.project}
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono mt-0.5">
                        <span className="text-[#5c7366] truncate">{selectedListing.region}</span>
                        <span className="font-bold text-[#2d6a4f] shrink-0 ml-1">
                          {selectedListing.priceNum.toFixed(2)} SOL / {selectedListing.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Forest Share Perks Banner */}
                  {selectedListing.assetType === "forest_share" && (
                    <div className="p-3 rounded-xl bg-[#fafcf8] border border-[#d8ded4] text-[11px] space-y-1.5">
                      <div className="font-bold text-[#0a3d2a] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#1e6b3b]" />
                        <span>Fractional Deed Anchored on Solana</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[#5c7366] font-mono text-[10px]">
                        <div>• Parcel: <strong>{selectedListing.parcelId || "BR-07-AM"}</strong></div>
                        <div>• NDVI: <strong>{selectedListing.ndvi} (Intact)</strong></div>
                        <div>• Yield: <strong className="text-[#1e6b3b]">+{selectedListing.carbonYieldApy}% APY</strong></div>
                        <div>• Deed: <strong>Co-Ownership</strong></div>
                      </div>
                    </div>
                  )}

                  {/* Suspended Hook Warning Banner */}
                  {isSuspended && (
                    <div className="p-3 rounded-xl bg-[#fce8e8] border border-[#f5c2c2] text-xs text-[#c92a2a] space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>Trading Prohibited by Oracle</span>
                      </div>
                      <p className="text-[11px] text-[#5c7366] leading-relaxed">
                        {selectedListing.revocationReason ||
                          "This project has been suspended due to canopy telemetry loss. Token-2022 Transfer Hook refuses settlement."}
                      </p>
                    </div>
                  )}

                  {/* Quantity Input with Presets */}
                  <div className="space-y-2 text-left">
                    <div className="flex items-center justify-between text-xs">
                      <label className="text-[#5c7366] font-medium">
                        Quantity ({selectedListing.unit})
                      </label>
                      <span className="text-[11px] font-mono text-[#5c7366]">
                        Avail:{" "}
                        <strong className="text-[#111e16]">
                          {selectedListing.amount.toLocaleString()} {selectedListing.unit}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center border border-[#dbe3d8] rounded-xl bg-white px-3 py-2 focus-within:border-[#2d6a4f] transition-colors shadow-2xs">
                      <input
                        type="number"
                        min="0.01"
                        step={selectedListing.assetType === "forest_share" ? "0.05" : "1"}
                        max={selectedListing.amount}
                        value={buyAmount}
                        onChange={(e) => setBuyAmount(e.target.value)}
                        disabled={isSuspended}
                        className="w-full bg-transparent text-sm font-mono font-bold text-[#111e16] focus:outline-none"
                        placeholder={selectedListing.assetType === "forest_share" ? "0.25" : "10"}
                      />
                      <span className="text-xs font-mono text-[#5c7366] mr-2">
                        {selectedListing.unit}
                      </span>
                      <button
                        type="button"
                        onClick={() => setBuyAmount(String(selectedListing.amount))}
                        disabled={isSuspended}
                        className="text-[10px] font-mono font-bold text-[#2d6a4f] bg-[#e6f4ea] hover:bg-[#d4edd9] px-2 py-0.5 rounded border border-[#a3cfbb] transition-colors cursor-pointer shrink-0"
                      >
                        MAX
                      </button>
                    </div>

                    {/* Quick Selection Pills */}
                    <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                      <span className="text-[10px] text-[#5c7366] font-mono">Quick:</span>
                      {(selectedListing.assetType === "forest_share"
                        ? [0.05, 0.1, 0.25, 0.5, 1, 2]
                        : [5, 10, 25, 50, 100]
                      )
                        .filter((q) => q <= selectedListing.amount)
                        .map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setBuyAmount(String(amt))}
                            disabled={isSuspended}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                              amountNum === amt
                                ? "bg-[#2d6a4f] text-white font-bold"
                                : "bg-[#f0f4ee] text-[#5c7366] hover:bg-white border border-[#dbe3d8]"
                            }`}
                          >
                            {amt} {selectedListing.unit}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Cost Summary Breakdown */}
                  <div className="space-y-2 pt-2 border-t border-[#e1e8de] text-xs font-mono">
                    <div className="flex justify-between text-[#5c7366]">
                      <span>Subtotal (SOL)</span>
                      <span className="text-[#111e16] font-semibold">{totalCost} SOL</span>
                    </div>
                    <div className="flex justify-between text-[#5c7366]">
                      <span>Estimated Fiat Value</span>
                      <span className="text-[#1e6b3b] font-bold">
                        ≈ ${(totalCostNum * 180).toFixed(2)} USD
                      </span>
                    </div>
                    <div className="flex justify-between text-[#5c7366]">
                      <span>Network Gas Fee</span>
                      <span>~0.00005 SOL</span>
                    </div>

                    {/* Wallet Balance with Airdrop Faucet Button */}
                    <div className="flex items-center justify-between py-1.5 bg-[#f0f4ee] px-2.5 rounded-lg border border-[#dbe3d8]">
                      <span className="text-[#5c7366]">Wallet Balance</span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold ${
                            hasInsufficientBalance ? "text-[#c92a2a]" : "text-[#111e16]"
                          }`}
                        >
                          {isWalletActive
                            ? `${effectiveBalance.toFixed(3)} SOL`
                            : "Public Mode"}
                        </span>
                        {isWalletActive && (
                          <button
                            type="button"
                            onClick={handleRequestAirdrop}
                            disabled={airdropping}
                            className="flex items-center gap-1 text-[10px] font-bold text-[#1e6b3b] bg-[#e6f4ea] hover:bg-[#d1ebd7] px-2 py-0.5 rounded border border-[#a3cfbb] transition-all cursor-pointer disabled:opacity-50"
                            title="Request 1 Devnet SOL airdrop"
                          >
                            {airdropping ? (
                              <Loader2 className="w-2.5 h-2.5 animate-spin" />
                            ) : (
                              <Droplet className="w-2.5 h-2.5" />
                            )}
                            <span>{airdropping ? "Funding..." : "+1 SOL Faucet"}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {airdropMsg && (
                      <div className="text-[11px] font-mono text-center text-[#1e6b3b] bg-[#e6f4ea] py-1 px-2 rounded border border-[#a3cfbb]">
                        {airdropMsg}
                      </div>
                    )}

                    <div className="flex justify-between items-baseline text-sm font-bold text-[#111e16] pt-2 border-t border-[#e1e8de]">
                      <span>Total Due</span>
                      <div className="text-right">
                        <span className="text-base text-[#2d6a4f] block">{totalCost} SOL</span>
                        <span className="text-[11px] text-[#5c7366] font-normal">
                          ≈ ${(totalCostNum * 180).toFixed(2)} USD
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Message */}
                  {errorMsg && (
                    <div className="p-2.5 rounded-lg bg-[#fce8e8] border border-[#f5c2c2] text-xs text-[#c92a2a] flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {txHash && (
                    <div className="p-3 rounded-xl bg-[#e6f4ea] border border-[#a3cfbb] text-xs text-[#1e6b3b] space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#1e6b3b]" />
                        <span>Order Confirmed on Solana Devnet</span>
                      </div>
                      <a
                        href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] underline flex items-center gap-1 break-all text-[#1e6b3b] hover:text-[#0f3d20]"
                      >
                        <span>View signature: {txHash.slice(0, 16)}...</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  )}

                  {/* Primary Fiat Card Checkout Button (Available to ALL public visitors) */}
                  <div className="space-y-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setFiatModalMode("buy_asset");
                        setFiatModalOpen(true);
                      }}
                      disabled={isSuspended}
                      className="w-full py-3.5 px-4 rounded-xl bg-[#0a3d2a] hover:bg-[#114d36] text-white font-bold text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_2px_10px_rgba(10,61,42,0.25)] hover:shadow-[0_4px_16px_rgba(10,61,42,0.35)] cursor-pointer disabled:opacity-50"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>
                        💳 Pay with Card / Real Money (~${(totalCostNum * 180).toFixed(2)} USD)
                      </span>
                    </button>

                    {/* Secondary Solana On-chain execution / Wallet connect */}
                    {isWalletActive ? (
                      <div className="space-y-2">
                        {hasInsufficientBalance ? (
                          <div className="p-3 rounded-xl bg-[#fce8e8]/60 border border-[#f5c2c2] text-xs space-y-2">
                            <div className="flex items-center justify-between text-[#c92a2a] font-bold text-[11px]">
                              <span>Insufficient SOL Balance</span>
                              <span>Need {totalCost} SOL</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setFiatModalMode("buy_sol");
                                  setFiatModalOpen(true);
                                }}
                                className="py-2 px-2.5 rounded-lg bg-[#0a3d2a] hover:bg-[#114d36] text-white font-bold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Buy SOL with Card</span>
                              </button>
                              <button
                                type="button"
                                onClick={handleRequestAirdrop}
                                disabled={airdropping}
                                className="py-2 px-2.5 rounded-lg bg-white hover:bg-[#f0f4ee] border border-[#d8ded4] text-[#111e16] font-bold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1"
                              >
                                {airdropping ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Droplet className="w-3 h-3 text-[#1e6b3b]" />
                                )}
                                <span>Free Devnet Faucet</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handleExecuteTrade}
                            disabled={trading || isSuspended}
                            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                              isSuspended
                                ? "bg-[#f0f4ee] text-[#5c7366] cursor-not-allowed border-[#dbe3d8]"
                                : "bg-white hover:bg-[#edf2ea] text-[#0a3d2a] border-[#a3cfbb]"
                            }`}
                          >
                            {trading ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Signing on Solana...</span>
                              </>
                            ) : isSuspended ? (
                              <span>Trading Blocked by Hook</span>
                            ) : (
                              <span>Pay with Connected SOL · {totalCost} SOL</span>
                            )}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setWalletDialogOpen(true)}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-white hover:bg-[#edf2ea] border border-[#d8ded4] text-[#111e16] font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Wallet className="w-3.5 h-3.5 text-[#5c7366]" />
                          <span>Connect Crypto Wallet</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFiatModalMode("buy_sol");
                            setFiatModalOpen(true);
                          }}
                          className="py-2.5 px-3 rounded-xl bg-[#edf2ea] hover:bg-[#dbe3d8] text-[#0a3d2a] font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#1e6b3b]" />
                          <span>Buy SOL</span>
                        </button>
                      </div>
                    )}
                  </div>
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
            <Stat
              label="Forest Land Equity"
              value={`${(
                0.25 +
                userHoldings
                  .filter((h) => h.assetType === "forest_share")
                  .reduce((acc, h) => acc + (parseFloat(h.amount) || 0), 0)
              ).toFixed(2)} ha`}
              subtext="Co-owned rainforest parcels"
            />
            <Stat
              label="Carbon Credits"
              value={`${(
                300 +
                userHoldings
                  .filter((h) => h.assetType !== "forest_share")
                  .reduce((acc, h) => acc + (parseFloat(h.amount) || 0), 0)
              ).toLocaleString()} tCO2e`}
              subtext="Audited on-chain offsets"
            />
            <Stat
              label="Estimated Market Value"
              value={`~${(
                45.0 +
                userHoldings.reduce((acc, h) => acc + (parseFloat(h.solValue) || 0), 0)
              ).toFixed(2)} SOL`}
              subtext="≈ $8,100 USD total portfolio"
            />
          </div>

          {/* Section 1: Fractional Forest Land Shares */}
          <Panel className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
                  <Trees className="w-4 h-4 text-[#1e6b3b]" />
                  <span>Fractional Forest Land Deeds (Hectares)</span>
                </h3>
                <p className="text-[11px] text-[#5c7366] mt-0.5">
                  Direct equity shares in protected rainforests anchored by Sentinel-2 telemetry.
                </p>
              </div>
              <Link
                href="/explorer"
                className="text-xs font-semibold text-[#1e6b3b] hover:text-[#0a3d2a] flex items-center gap-1 cursor-pointer"
              >
                <span>Inspect on Satellite Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[var(--border-subtle)] text-xs">
              {/* Dynamic user holdings acquired via Card or SOL */}
              {userHoldings
                .filter((h) => h.assetType === "forest_share")
                .map((holding) => (
                  <div
                    key={holding.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#e6f4ea]/30 px-3 rounded-xl mb-2 border border-[#a3cfbb]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#a3cfbb] text-[#1e6b3b] flex items-center justify-center font-bold">
                        <Trees className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-[var(--text)] flex items-center gap-2">
                          <span>{holding.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#e6f4ea] text-[#1e6b3b] font-bold">
                            NEWLY ACQUIRED
                          </span>
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-2">
                          <span>Parcel: {holding.parcelId}</span>
                          <span>•</span>
                          <span>NDVI: {holding.ndvi}</span>
                          <span>•</span>
                          <span className="font-mono text-[10px] text-[#5c7366]">
                            TX: {holding.txSignature.slice(0, 10)}...
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right font-mono">
                        <div className="font-bold text-[#0a3d2a]">
                          {holding.amount} {holding.unit}
                        </div>
                        <div className="text-[11px] text-[#1e6b3b]">
                          ~{holding.solValue} SOL value
                        </div>
                      </div>
                      <Link
                        href="/explorer"
                        className="px-3.5 py-1.5 rounded-lg bg-[#0a3d2a] hover:bg-[#114d36] text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <span>View Satellite Deed</span>
                      </Link>
                    </div>
                  </div>
                ))}

              {/* Sample Default Forest Land Share */}
              <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src="/amazon.png"
                    alt="Amazon Canopy Reserve"
                    className="w-10 h-10 rounded-xl object-cover border border-[var(--border)]"
                  />
                  <div>
                    <div className="font-bold text-[var(--text)]">
                      Amazon Canopy Reserve Share
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      Parcel ID: BR-07-AM · Grade AAA · 100% Intact Canopy · 14.8% APY
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right font-mono">
                    <div className="font-bold text-[var(--text)]">0.25 ha</div>
                    <div className="text-[11px] text-[#1e6b3b]">~0.375 SOL (~$67.50 USD)</div>
                  </div>
                  <Link
                    href="/explorer"
                    className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-[#f0f4ee] border border-[#d8ded4] text-[#111e16] font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>Inspect Satellite Map</span>
                  </Link>
                </div>
              </div>
            </div>
          </Panel>

          {/* Section 2: Active Ecological Carbon Credits */}
          <Panel className="p-6">
            <h3 className="text-sm font-bold text-[var(--text)] mb-4 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-[#2d6a4f]" />
              <span>Active Ecological Carbon Credits</span>
            </h3>

            <div className="divide-y divide-[var(--border-subtle)] text-xs">
              {/* Dynamic carbon credits acquired */}
              {userHoldings
                .filter((h) => h.assetType !== "forest_share")
                .map((holding) => (
                  <div
                    key={holding.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#e6f4ea]/30 px-3 rounded-xl mb-2 border border-[#a3cfbb]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#a3cfbb] text-[#2d6a4f] flex items-center justify-center font-bold">
                        <Leaf className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-[var(--text)] flex items-center gap-2">
                          <span>{holding.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#e6f4ea] text-[#1e6b3b] font-bold">
                            NEW OFFSET
                          </span>
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)]">
                          Grade {holding.grade} · 100% Intact · TX: {holding.txSignature.slice(0, 10)}...
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right font-mono">
                        <div className="font-bold text-[#0a3d2a]">
                          {holding.amount} {holding.unit}
                        </div>
                        <div className="text-[11px] text-[#1e6b3b]">
                          ~{holding.solValue} SOL value
                        </div>
                      </div>
                      <Link
                        href={`/retire?project=${encodeURIComponent(holding.name)}&amount=${holding.amount}`}
                        className="px-3.5 py-1.5 rounded-lg bg-[#2d6a4f] hover:bg-[#23563f] text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>Retire Credits</span>
                      </Link>
                    </div>
                  </div>
                ))}

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
                    className="px-3.5 py-1.5 rounded-lg bg-[#2d6a4f] hover:bg-[#23563f] text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
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
                    className="px-3.5 py-1.5 rounded-lg bg-[#2d6a4f] hover:bg-[#23563f] text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
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
                Create Asset Sell Order
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                List verified fractional forest shares or carbon credits on the decentralized Solana order book.
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
                <label className="text-[var(--text-muted)] block mb-1.5 font-medium">Asset Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewAssetType("forest_share")}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer ${
                      newAssetType === "forest_share"
                        ? "bg-[#e6f4ea] border-[#2d6a4f] text-[#0a3d2a] font-bold"
                        : "bg-white border-[#d8ded4] text-[#5c7366]"
                    }`}
                  >
                    <Trees className="w-4 h-4 text-[#1e6b3b]" />
                    <span>Forest Land Share (ha)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAssetType("carbon_credit")}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer ${
                      newAssetType === "carbon_credit"
                        ? "bg-[#e6f4ea] border-[#2d6a4f] text-[#0a3d2a] font-bold"
                        : "bg-white border-[#d8ded4] text-[#5c7366]"
                    }`}
                  >
                    <Leaf className="w-4 h-4 text-[#2d6a4f]" />
                    <span>Carbon Credits (tCO2e)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[var(--text-muted)] block mb-1.5 font-medium">Select Monitored Project</label>
                <select
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="Amazon Canopy Reserve Share" className="bg-[var(--surface)]">Amazon Canopy Reserve (Grade AAA)</option>
                  <option value="Valdivian Temperate Rainforest Share" className="bg-[var(--surface)]">Valdivian Temperate Rainforest (Grade AAA)</option>
                  <option value="Congo Basin Old-Growth Forest Share" className="bg-[var(--surface)]">Congo Basin Old-Growth Sanctuary (Grade AA)</option>
                  <option value="Amazon Reforestation Block 7" className="bg-[var(--surface)]">Amazon Reforestation Block 7 (Grade AAA)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[var(--text-muted)] block mb-1.5 font-medium">
                    Quantity to Sell ({newAssetType === "forest_share" ? "ha" : "tCO2e"})
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text)] font-mono focus:outline-none focus:border-[var(--accent)]"
                    placeholder="10"
                    required
                  />
                </div>

                <div>
                  <label className="text-[var(--text-muted)] block mb-1.5 font-medium">
                    Asking Price (SOL per {newAssetType === "forest_share" ? "ha" : "tCO2e"})
                  </label>
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
                  className="w-full py-3 rounded-xl bg-[#2d6a4f] hover:bg-[#23563f] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Publish Order to Solana Order Book
                </button>
              </div>
            </form>
          </Panel>
        </div>
      )}

      {/* Fiat Onramp Modal: Buy SOL with Real Money or Buy Forest Shares directly */}
      <FiatOnrampModal
        isOpen={fiatModalOpen}
        onClose={() => setFiatModalOpen(false)}
        mode={fiatModalMode}
        asset={
          selectedListing
            ? {
                id: selectedListing.id,
                name: selectedListing.project,
                region: selectedListing.region,
                assetType: selectedListing.assetType,
                unit: selectedListing.unit,
                quantity: amountNum,
                priceSol: selectedListing.priceNum,
                totalCostSol: totalCostNum,
                grade: selectedListing.grade,
                ndvi: selectedListing.ndvi,
                parcelId: selectedListing.parcelId,
              }
            : null
        }
        activePublicKey={activePubkey}
        onPurchaseSuccess={() => {
          syncHoldings();
          syncLocalWallet();
        }}
      />

      {/* Wallet Dialog for direct Extension / Devnet connection */}
      <WalletDialog
        isOpen={walletDialogOpen}
        onClose={() => setWalletDialogOpen(false)}
      />
    </PageShell>
  );
}

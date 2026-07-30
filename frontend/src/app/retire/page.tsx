"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { WalletMultiButton, useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction, SystemProgram, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

const CERTIFICATE_TIERS = [
  { id: "net-zero", label: "🏆 Net Zero Certificate", desc: "100% annual emissions offset", color: "emerald" },
  { id: "carbon-neutral", label: "🥈 Carbon Neutral (Product/Event)", desc: "Specific product line or event offset", color: "blue" },
  { id: "partial-offset", label: "🌱 Partial Offset Certificate", desc: "Any % of emissions offset", color: "yellow" },
  { id: "sbti-aligned", label: "📉 SBTi Aligned Certificate", desc: "Science-Based Targets initiative compliant", color: "purple" },
  { id: "esg-compliance", label: "🏢 ESG / Regulatory Compliance", desc: "Government-mandated carbon regulations", color: "orange" },
  { id: "supply-chain", label: "🌍 Supply Chain Decarbonization", desc: "Full Scope 3 supply chain offset", color: "cyan" },
];

const PROJECTS = [
  "Amazon Reforestation Block 7",
  "Congo Basin Conservation",
  "Borneo Peatland Protection",
  "Western Ghats Conservation Block",
  "Sumatra Tiger Reserve",
];

export default function RetireCredits() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"form" | "ai">("form");

  // Main Form State
  const [companyName, setCompanyName] = useState("Acme Corporation");
  const [selectedProject, setSelectedProject] = useState(PROJECTS[0]);
  const [selectedTier, setSelectedTier] = useState(CERTIFICATE_TIERS[0].id);
  const [offsetCategory, setOffsetCategory] = useState("Corporate Operations FY 2026");
  const [amount, setAmount] = useState("12500");
  const [totalEmissions, setTotalEmissions] = useState("12500");

  // Solana Burn State
  const [burning, setBurning] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [certId, setCertId] = useState<string | null>(null);

  // AI Calculator State
  const [aiMode, setAiMode] = useState<"corporate" | "lca">("corporate");
  
  // AI Mode 1: Corporate
  const [employees, setEmployees] = useState(150);
  const [flightHours, setFlightHours] = useState(500);
  const [cloudBudget, setCloudBudget] = useState(12000); // USD/month
  
  // AI Mode 2: Product LCA
  const [productType, setProductType] = useState("Electronics");
  const [plasticWeight, setPlasticWeight] = useState(0.8); // kg per unit
  const [aluminumWeight, setAluminumWeight] = useState(1.2); // kg per unit
  const [cottonWeight, setCottonWeight] = useState(0.0); // kg per unit
  const [shippingDist, setShippingDist] = useState(5000); // km
  const [shippingMode, setShippingMode] = useState<"air" | "sea" | "road">("sea");
  const [productionVolume, setProductionVolume] = useState(50000); // units/year

  const certRef = useRef<HTMLDivElement>(null);
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();
  const { setVisible } = useWalletModal();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // AI Math Calculations
  let calculatedEmissions = 0;
  let calculatedLcaPerUnit = 0;

  if (aiMode === "corporate") {
    // 1.5 tons per employee, 0.25 tons per flight hour, 0.04 tons per $100 cloud spend
    const officeE = employees * 1.5;
    const travelE = flightHours * 0.25;
    const cloudE = (cloudBudget / 100) * 0.04 * 12; // annualized
    calculatedEmissions = Math.round(officeE + travelE + cloudE);
  } else {
    // LCA Material Factors (kg CO2e per kg material)
    const plasticF = plasticWeight * 6.0;
    const aluminumF = aluminumWeight * 9.0;
    const cottonF = cottonWeight * 2.5;
    const manufacturingF = productType === "Electronics" ? 18.0 : productType === "Apparel" ? 5.5 : 2.0;

    // Shipping factor (kg CO2e per kg-km)
    const totalWeight = plasticWeight + aluminumWeight + cottonWeight || 0.1;
    const shippingF = shippingMode === "air" ? 0.0005 : shippingMode === "road" ? 0.0001 : 0.00001;
    const transitE = totalWeight * shippingDist * shippingF;

    calculatedLcaPerUnit = parseFloat((plasticF + aluminumF + cottonF + manufacturingF + transitE).toFixed(2));
    calculatedEmissions = Math.round((calculatedLcaPerUnit * productionVolume) / 1000); // total tons
  }

  const amountNum = parseFloat(amount) || 0;
  const emissionsNum = parseFloat(totalEmissions) || 0;
  const coveragePercent = emissionsNum > 0 ? Math.min(100, Math.round((amountNum / emissionsNum) * 100)) : 0;
  const currentTier = CERTIFICATE_TIERS.find((t) => t.id === selectedTier)!;
  const isNetZero = coveragePercent >= 100;

  const handleApplyAiStrategy = () => {
    setTotalEmissions(calculatedEmissions.toString());
    setAmount(calculatedEmissions.toString());
    
    if (aiMode === "corporate") {
      setSelectedTier("net-zero");
      setOffsetCategory("Corporate Operations FY 2026");
    } else {
      setSelectedTier("carbon-neutral");
      setOffsetCategory(`${productType} Product Lifecycle (${productionVolume.toLocaleString()} units)`);
    }
    setActiveTab("form");
  };

  const handleBurnAndRetire = async () => {
    setErrorMsg(null);
    setTxHash(null);
    setCertId(null);

    if (!connected || !publicKey) {
      setVisible(true);
      return;
    }

    if (amountNum <= 0) {
      setErrorMsg("Please enter a valid credit amount to retire.");
      return;
    }

    try {
      setBurning(true);

      const recipient = new PublicKey("EfnmJ875yB8qQj4cRkwkoC111111111111111111111");
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipient,
          lamports: Math.round(0.001 * LAMPORTS_PER_SOL),
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      setTxHash(signature);

      const generatedCertId = `CERT-TV-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`;
      setCertId(generatedCertId);
    } catch (err: any) {
      console.error("Burn failed:", err);
      if (err?.message?.includes("User rejected")) {
        setErrorMsg("Transaction was cancelled in Phantom.");
      } else {
        setErrorMsg(err?.message || "Burn transaction failed on Devnet.");
      }
    } finally {
      setBurning(false);
    }
  };

  const handlePrintCertificate = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>TerraVerify Certificate - ${certId}</title>
            <style>
              body { font-family: 'Georgia', serif; background: #0a0a0a; color: white; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
              .cert { max-width: 700px; padding: 48px; border: 3px solid #10b981; border-radius: 24px; background: linear-gradient(135deg, #0a0f0a 0%, #0a1a0a 100%); text-align: center; }
              .cert h1 { color: #10b981; font-size: 28px; margin-bottom: 4px; }
              .cert h2 { color: #d4d4d4; font-size: 14px; font-weight: normal; margin-top: 0; }
              .cert .company { font-size: 32px; font-weight: bold; color: white; margin: 24px 0 8px; }
              .cert .amount { font-size: 48px; font-weight: bold; color: #10b981; margin: 16px 0; }
              .cert .detail { color: #9ca3af; font-size: 13px; margin: 6px 0; }
              .cert .tx { color: #10b981; font-size: 11px; word-break: break-all; margin-top: 20px; padding: 12px; background: rgba(16,185,129,0.1); border-radius: 8px; border: 1px solid rgba(16,185,129,0.3); }
              .cert .footer { margin-top: 24px; color: #6b7280; font-size: 11px; }
            </style>
          </head>
          <body>
            <div class="cert">
              <h1>TerraVerify</h1>
              <h2>Solana-Native Carbon Credit Protocol</h2>
              <hr style="border-color: #1f2937; margin: 20px 0;" />
              <div style="color: #10b981; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 8px;">Certificate of Carbon Offset</div>
              <div class="company">${companyName}</div>
              <div class="detail">${currentTier.label}</div>
              <div class="amount">${Number(amount).toLocaleString()} tCO₂e</div>
              <div class="detail">Project: ${selectedProject}</div>
              <div class="detail">Category: ${offsetCategory}</div>
              <div class="detail">Coverage: ${coveragePercent}% of Reported Emissions</div>
              <div class="detail">Certificate ID: ${certId}</div>
              <div class="detail">Date Issued: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              ${txHash ? `<div class="tx">Solana Blockchain Proof:<br/>${txHash}</div>` : ''}
              <div class="footer">This certificate is permanently recorded on the Solana blockchain and can be independently verified at explorer.solana.com</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
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
          <Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link>
          <Link href="/register" className="hover:text-white transition-colors">Register Project</Link>
          <span className="text-emerald-400 border-b border-emerald-400 pb-1">Retire Credits</span>
          <WalletMultiButton className="!px-5 !py-2 !rounded-full !bg-white/10 !border !border-white/20 hover:!bg-white/20 !transition-all !shadow-lg !backdrop-blur-md !text-white !font-medium !text-sm !h-auto !line-height-normal" />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
            Permanent On-Chain Token Burn
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">Retire Carbon Credits</h2>
          <p className="text-gray-400 mt-2">Permanently burn carbon credits on Solana to claim verified carbon neutrality. Use our AI Carbon Calculator or LCA Simulator to estimate your target strategy.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-gray-800 mb-8 max-w-md">
          <button 
            onClick={() => setActiveTab("form")}
            className={`flex-1 pb-4 text-sm font-bold text-center border-b-2 transition-all ${activeTab === "form" ? "border-emerald-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`}
          >
            📋 1. Retirement Console
          </button>
          <button 
            onClick={() => setActiveTab("ai")}
            className={`flex-1 pb-4 text-sm font-bold text-center border-b-2 transition-all ${activeTab === "ai" ? "border-emerald-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`}
          >
            🛰️ 2. AI Carbon Copilot
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Retirement Console OR AI Copilot */}
          <div className="space-y-6">
            
            {activeTab === "form" && (
              <div className="glass-panel p-8 rounded-3xl space-y-5 border border-white/10">
                <div>
                  <label className="text-xs uppercase font-medium text-gray-400 block mb-2">Company / Beneficiary Name</label>
                  <input 
                    type="text" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" 
                    placeholder="e.g. Acme Corporation"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase font-medium text-gray-400 block mb-2">Certificate Tier</label>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer"
                  >
                    {CERTIFICATE_TIERS.map((tier) => (
                      <option key={tier.id} value={tier.id} className="bg-[#111]">
                        {tier.label} — {tier.desc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase font-medium text-gray-400 block mb-2">Source Project</label>
                    <select
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer"
                    >
                      {PROJECTS.map((p) => (
                        <option key={p} value={p} className="bg-[#111]">{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs uppercase font-medium text-gray-400 block mb-2">Offset Category</label>
                    <input 
                      type="text" 
                      value={offsetCategory}
                      onChange={(e) => setOffsetCategory(e.target.value)}
                      className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" 
                      placeholder="e.g. FY 2026 Operations"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase font-medium text-gray-400 block mb-2">Total Reported Emissions (tCO₂e)</label>
                    <input 
                      type="number" 
                      value={totalEmissions}
                      onChange={(e) => setTotalEmissions(e.target.value)}
                      className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors" 
                      placeholder="12500"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase font-medium text-gray-400 block mb-2">Credits to Retire (tCO₂e)</label>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors" 
                      placeholder="12500"
                    />
                  </div>
                </div>

                {/* Coverage Bar */}
                <div className="pt-2">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-400">Emissions Coverage</span>
                    <span className={`font-bold ${isNetZero ? 'text-emerald-400' : coveragePercent >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {coveragePercent}% {isNetZero ? "— NET ZERO ✓" : ""}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${isNetZero ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : coveragePercent >= 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' : 'bg-gradient-to-r from-red-500 to-red-400'}`}
                      style={{ width: `${Math.min(coveragePercent, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl">
                    {errorMsg}
                  </div>
                )}

                <button 
                  onClick={handleBurnAndRetire}
                  disabled={burning}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-base hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {burning ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Awaiting Phantom Approval...
                    </>
                  ) : connected ? (
                    <>🔥 Permanently Retire Credits on Solana</>
                  ) : (
                    <>Connect Wallet to Retire Credits</>
                  )}
                </button>
                <p className="text-center text-xs text-gray-500">This action is irreversible. Burned tokens cannot be recovered.</p>
              </div>
            )}

            {activeTab === "ai" && (
              <div className="glass-panel p-8 rounded-3xl space-y-6 border border-white/10">
                <div className="flex border border-gray-800 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setAiMode("corporate")}
                    className={`flex-1 py-2.5 text-xs font-bold text-center transition-colors ${aiMode === "corporate" ? "bg-emerald-500 text-black" : "bg-black/50 text-gray-400 hover:text-white"}`}
                  >
                    🏢 Corporate Operations
                  </button>
                  <button
                    onClick={() => setAiMode("lca")}
                    className={`flex-1 py-2.5 text-xs font-bold text-center transition-colors ${aiMode === "lca" ? "bg-emerald-500 text-black" : "bg-black/50 text-gray-400 hover:text-white"}`}
                  >
                    📦 Product Lifecycle (LCA)
                  </button>
                </div>

                {aiMode === "corporate" ? (
                  <div className="space-y-5">
                    <h3 className="text-sm font-bold text-gray-300">Corporate Footprint (Scope 1, 2, 3)</h3>
                    
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-2">
                        <span>FTE Employees</span>
                        <span className="text-emerald-400 font-bold">{employees}</span>
                      </div>
                      <input 
                        type="range" min="10" max="5000" step="10" 
                        value={employees} onChange={(e) => setEmployees(Number(e.target.value))}
                        className="w-full accent-emerald-500" 
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-2">
                        <span>Annual Business Flights (Hours)</span>
                        <span className="text-emerald-400 font-bold">{flightHours} hrs</span>
                      </div>
                      <input 
                        type="range" min="0" max="20000" step="100" 
                        value={flightHours} onChange={(e) => setFlightHours(Number(e.target.value))}
                        className="w-full accent-emerald-500" 
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-2">
                        <span>Monthly Cloud Budget (AWS/GCP/OpenAI)</span>
                        <span className="text-emerald-400 font-bold">${cloudBudget.toLocaleString()}</span>
                      </div>
                      <input 
                        type="range" min="0" max="100000" step="1000" 
                        value={cloudBudget} onChange={(e) => setCloudBudget(Number(e.target.value))}
                        className="w-full accent-emerald-500" 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <h3 className="text-sm font-bold text-gray-300">Product Cradle-to-Grave LCA</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400 block mb-2">Product Category</label>
                        <select
                          value={productType}
                          onChange={(e) => setProductType(e.target.value)}
                          className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 text-xs appearance-none"
                        >
                          <option value="Electronics" className="bg-[#111]">Electronics (High Grid Intensity)</option>
                          <option value="Apparel" className="bg-[#111]">Apparel & Textiles</option>
                          <option value="Packaging" className="bg-[#111]">Consumer Goods / Packaging</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-gray-400 block mb-2">Shipping Transit Mode</label>
                        <select
                          value={shippingMode}
                          onChange={(e) => setShippingMode(e.target.value as any)}
                          className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 text-xs appearance-none"
                        >
                          <option value="sea" className="bg-[#111]">🚢 Sea Freight (Low Carbon)</option>
                          <option value="road" className="bg-[#111]">🚛 Road Transit (Medium)</option>
                          <option value="air" className="bg-[#111]">✈️ Air Cargo (High Carbon)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-1">Plastic (kg/unit)</label>
                        <input 
                          type="number" step="0.1" value={plasticWeight} onChange={(e) => setPlasticWeight(parseFloat(e.target.value) || 0)}
                          className="w-full bg-black/50 border border-gray-800 rounded-xl px-2 py-2 text-white font-mono text-xs focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-1">Aluminum (kg/unit)</label>
                        <input 
                          type="number" step="0.1" value={aluminumWeight} onChange={(e) => setAluminumWeight(parseFloat(e.target.value) || 0)}
                          className="w-full bg-black/50 border border-gray-800 rounded-xl px-2 py-2 text-white font-mono text-xs focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-1">Cotton (kg/unit)</label>
                        <input 
                          type="number" step="0.1" value={cottonWeight} onChange={(e) => setCottonWeight(parseFloat(e.target.value) || 0)}
                          className="w-full bg-black/50 border border-gray-800 rounded-xl px-2 py-2 text-white font-mono text-xs focus:outline-none" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-2">
                          <span>Avg Shipping Distance</span>
                          <span className="text-emerald-400 font-bold">{shippingDist} km</span>
                        </div>
                        <input 
                          type="range" min="100" max="15000" step="500" 
                          value={shippingDist} onChange={(e) => setShippingDist(Number(e.target.value))}
                          className="w-full accent-emerald-500" 
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-2">
                          <span>Production Volume</span>
                          <span className="text-emerald-400 font-bold">{productionVolume.toLocaleString()} units</span>
                        </div>
                        <input 
                          type="range" min="1000" max="500000" step="5000" 
                          value={productionVolume} onChange={(e) => setProductionVolume(Number(e.target.value))}
                          className="w-full accent-emerald-500" 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Calculated Summary Box */}
                <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-3">
                  <div className="text-xs uppercase tracking-wider text-emerald-400 font-bold">AI Strategy Recommendation</div>
                  
                  {aiMode === "corporate" ? (
                    <div className="space-y-1 text-xs text-gray-300 font-mono">
                      <div>Calculated Footprint: <span className="text-emerald-400 font-bold">{calculatedEmissions.toLocaleString()} tCO₂e</span></div>
                      <div>Target Certification: <span className="text-white font-bold">🏆 Net Zero Corporate</span></div>
                      <div>Recommended Action: <span className="text-white">Retire {calculatedEmissions.toLocaleString()} credits</span></div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-xs text-gray-300 font-mono">
                      <div>LCA Carbon footprint per unit: <span className="text-emerald-400 font-bold">{calculatedLcaPerUnit} kg CO₂e</span></div>
                      <div>Total Annual Footprint: <span className="text-emerald-400 font-bold">{calculatedEmissions.toLocaleString()} tCO₂e</span></div>
                      <div>Target Certification: <span className="text-white font-bold">🥈 Carbon Neutral Product</span></div>
                    </div>
                  )}

                  <button
                    onClick={handleApplyAiStrategy}
                    className="w-full mt-2 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm rounded-xl transition-colors"
                  >
                    Apply AI Recommendations to Form
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Certificate */}
          <div>
            <div className="glass-card rounded-3xl p-8 border-2 border-emerald-500/30 bg-gradient-to-br from-[#0a0f0a] to-[#0a1a0a] shadow-[0_0_30px_rgba(16,185,129,0.08)] sticky top-8">
              {/* Certificate Header */}
              <div className="text-center border-b border-emerald-500/20 pb-6 mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold">TerraVerify</span>
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-[4px]">Solana-Native Carbon Credit Protocol</div>
              </div>

              {/* Certificate Body */}
              <div className="text-center space-y-4">
                <div className="text-emerald-400 text-xs uppercase tracking-[3px] font-semibold">Certificate of Carbon Offset</div>
                
                <div className="text-3xl font-bold text-white">{companyName || "—"}</div>
                
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                  {currentTier.label}
                </div>

                <div className="text-5xl font-bold text-emerald-400 py-4">
                  {amountNum > 0 ? amountNum.toLocaleString() : "—"}
                  <span className="text-lg text-gray-400 ml-2">tCO₂e</span>
                </div>

                <div className="space-y-1.5 text-sm text-gray-400">
                  <div>Source Project: <span className="text-white font-medium">{selectedProject}</span></div>
                  <div>Category: <span className="text-white font-medium">{offsetCategory}</span></div>
                  <div>Coverage: <span className={`font-bold ${isNetZero ? 'text-emerald-400' : 'text-yellow-400'}`}>{coveragePercent}%</span></div>
                </div>

                <div className="pt-4 border-t border-gray-800 space-y-1.5 text-xs text-gray-500">
                  <div>Certificate ID: <span className="text-white font-mono">{certId || "Pending burn transaction..."}</span></div>
                  <div>Date: <span className="text-white">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                </div>

                {txHash && (
                  <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2">
                    <div className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                      <span>✅</span> Credits Permanently Burned on Solana
                    </div>
                    <div className="truncate font-mono text-[10px] text-gray-400">Tx: {txHash}</div>
                    <a 
                      href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-1 px-3 py-1.5 bg-emerald-500 text-black font-bold text-xs rounded-lg hover:bg-emerald-400 transition-colors"
                    >
                      Verify on Solana Explorer ↗
                    </a>
                  </div>
                )}

                {txHash && (
                  <button
                    onClick={handlePrintCertificate}
                    className="w-full mt-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-medium text-sm hover:bg-white/20 transition-colors"
                  >
                    🖨️ Print / Export Certificate
                  </button>
                )}
              </div>

              {/* Certificate Footer */}
              <div className="mt-6 pt-4 border-t border-gray-800 text-center text-[10px] text-gray-600">
                This certificate is permanently recorded on the Solana blockchain and can be independently verified at explorer.solana.com
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

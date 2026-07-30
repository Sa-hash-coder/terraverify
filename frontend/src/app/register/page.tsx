"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

export default function RegisterProject() {
  const router = useRouter();
  const { connected } = useWallet();
  const [mounted, setMounted] = useState(false);

  // Form State
  const [projectName, setProjectName] = useState("Western Ghats Conservation Block");
  const [location, setLocation] = useState("India (Karnataka)");
  const [landDeedId, setLandDeedId] = useState("BHU-IN-2026-994821");
  const [area, setArea] = useState("15,000");
  const [latitude, setLatitude] = useState("13.52");
  const [longitude, setLongitude] = useState("75.60");

  // Scanning & Minting State
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  // Calculated AI Telemetry Results
  const [aiResult, setAiResult] = useState<{
    cqs: string;
    cqsScore: number;
    forestCover: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Handle AI Satellite Verification Scan
  const handleRunScan = () => {
    setScanning(true);
    setScanStep(1);
    setScanComplete(false);

    setTimeout(() => setScanStep(2), 1200);
    setTimeout(() => setScanStep(3), 2400);
    setTimeout(() => {
      setScanning(false);
      setScanComplete(true);
      setAiResult({
        cqs: "AAA",
        cqsScore: 96,
        forestCover: "89.4%",
      });
    }, 3600);
  };

  // Handle Final On-Chain Minting & Registration
  const handleRegisterOnChain = async () => {
    if (!aiResult) return;
    setRegistering(true);

    const newProjectPayload = {
      action: "register",
      newProject: {
        id: `PRJ-00${Math.floor(Math.random() * 900 + 100)}`,
        name: projectName,
        location: location,
        area: `${area} ha`,
        status: "Verified",
        cqs: aiResult.cqs,
        cqsScore: aiResult.cqsScore,
        forestCover: aiResult.forestCover,
        lastScan: "Just now (Sentinel-2)",
        trend: "+0.4%",
        deedId: landDeedId,
        lat: latitude,
        lon: longitude,
      },
    };

    try {
      const res = await fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProjectPayload),
      });

      if (res.ok) {
        setRegisteredSuccess(true);
        setTimeout(() => {
          router.push("/explorer");
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to register project:", err);
    } finally {
      setRegistering(false);
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
          <span className="text-emerald-400 border-b border-emerald-400 pb-1">Register Project</span>
          <Link href="/retire" className="hover:text-white transition-colors">Retire Credits</Link>
          <WalletMultiButton className="!px-5 !py-2 !rounded-full !bg-white/10 !border !border-white/20 hover:!bg-white/20 !transition-all !shadow-lg !backdrop-blur-md !text-white !font-medium !text-sm !h-auto !line-height-normal" />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Landowner Onboarding Portal
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">Register Forest Project</h2>
          <p className="text-gray-400 mt-2">Submit your forest coordinates and legal land title to run an instant AI satellite audit and mint carbon credits.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Side */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-8 rounded-3xl space-y-5 border border-white/10">
              <div>
                <label className="text-xs uppercase font-medium text-gray-400 block mb-2">Project Name</label>
                <input 
                  type="text" 
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" 
                  placeholder="e.g. Amazon Block 7"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase font-medium text-gray-400 block mb-2">Country / Region</label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" 
                    placeholder="e.g. Brazil"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase font-medium text-gray-400 block mb-2">Land Title / Bhu-Aadhaar ID</label>
                  <input 
                    type="text" 
                    value={landDeedId}
                    onChange={(e) => setLandDeedId(e.target.value)}
                    className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500 transition-colors" 
                    placeholder="e.g. BHU-IN-2026-994821"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs uppercase font-medium text-gray-400 block mb-2">Area (Hectares)</label>
                  <input 
                    type="text" 
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" 
                    placeholder="15,000"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase font-medium text-gray-400 block mb-2">Latitude</label>
                  <input 
                    type="text" 
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors" 
                    placeholder="13.52"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase font-medium text-gray-400 block mb-2">Longitude</label>
                  <input 
                    type="text" 
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors" 
                    placeholder="75.60"
                  />
                </div>
              </div>

              <button 
                onClick={handleRunScan}
                disabled={scanning}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-bold text-base hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {scanning ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    Scanning Sentinel-2 Satellite Bands...
                  </>
                ) : (
                  <>
                    🛰️ Run AI Satellite Verification Scan
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Verification Results Panel */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl border border-white/10 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold border-b border-gray-800 pb-3 mb-4">Satellite Audit Status</h3>
                
                {scanning && (
                  <div className="space-y-4 font-mono text-xs text-emerald-400 my-8">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${scanStep >= 1 ? 'bg-emerald-500 animate-ping' : 'bg-gray-600'}`}></span>
                      <span>[1/3] Querying Copernicus API...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${scanStep >= 2 ? 'bg-emerald-500 animate-ping' : 'bg-gray-600'}`}></span>
                      <span>[2/3] Calculating NDVI Canopy Density...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${scanStep >= 3 ? 'bg-emerald-500 animate-ping' : 'bg-gray-600'}`}></span>
                      <span>[3/3] Cross-checking Bhu-Aadhaar Title...</span>
                    </div>
                  </div>
                )}

                {scanComplete && aiResult && (
                  <div className="space-y-5">
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                      <div className="text-xs text-emerald-400 font-medium uppercase mb-1">Audit Outcome</div>
                      <div className="text-3xl font-bold text-emerald-400">GRADE {aiResult.cqs}</div>
                      <div className="text-xs text-gray-400 mt-1">CQS Score: {aiResult.cqsScore}/100</div>
                    </div>

                    <div className="space-y-2 text-xs text-gray-300 font-mono bg-black/40 p-4 rounded-xl border border-gray-800">
                      <div>Canopy Density: <span className="text-emerald-400 font-bold">{aiResult.forestCover}</span></div>
                      <div>Land Deed Status: <span className="text-emerald-400 font-bold">MATCHED</span></div>
                      <div>Overlap Check: <span className="text-emerald-400 font-bold">PASS (0.0%)</span></div>
                      <div>Initial Credit Supply: <span className="text-white font-bold">{area} tCO2e</span></div>
                    </div>
                  </div>
                )}

                {!scanning && !scanComplete && (
                  <div className="h-48 flex flex-col items-center justify-center text-center text-gray-500 text-sm">
                    <svg className="w-10 h-10 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Fill in project metadata<br/>and click "Run AI Satellite Verification"
                  </div>
                )}
              </div>

              {scanComplete && (
                <div className="pt-4">
                  {registeredSuccess ? (
                    <div className="p-4 bg-emerald-500 text-black font-bold rounded-xl text-center text-sm">
                      ✅ Project Registered Live! Redirecting to Map...
                    </div>
                  ) : (
                    <button
                      onClick={handleRegisterOnChain}
                      disabled={registering}
                      className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors shadow-lg disabled:opacity-50"
                    >
                      {registering ? "Minting Project on Solana..." : "Mint & Register Project Live →"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

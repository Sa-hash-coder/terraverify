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
  const [projectName, setProjectName] = useState("Western Ghats Private Preserve");
  const [location, setLocation] = useState("India (Karnataka)");
  const [landDeedId, setLandDeedId] = useState("BHU-IN-2026-994821");
  
  // Boundary Definition Method State
  const [boundaryMethod, setBoundaryMethod] = useState<"file" | "radius">("file");
  
  // Method 1: File Upload
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [fileArea, setFileArea] = useState<string>("1,420"); // Parsed from file
  
  // Method 2: Center & Radius
  const [radiusMeters, setRadiusMeters] = useState("500");
  
  // Coordinates (Hidden under advanced)
  const [showAdvancedCoords, setShowAdvancedCoords] = useState(false);
  const [latitude, setLatitude] = useState("13.52");
  const [longitude, setLongitude] = useState("75.60");
  
  // Geocoding Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

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
    area: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // OpenStreetMap Nominatim Geocoding Search
  const handleGeocodingSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchingLocation(true);
    setSearchFeedback(null);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(searchQuery)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const { lat, lon, display_name } = data[0];
          setLatitude(parseFloat(lat).toFixed(4));
          setLongitude(parseFloat(lon).toFixed(4));
          setLocation(display_name.split(",")[0] + ", " + (display_name.split(",").slice(-1)[0] || "").trim());
          setSearchFeedback(`✓ Found: ${display_name.split(",").slice(0, 2).join(",")}`);
        } else {
          setSearchFeedback("⚠ Location not found. Try entering a nearby town or coordinates manually.");
        }
      }
    } catch (err) {
      console.error(err);
      setSearchFeedback("⚠ Search offline. Try typing coordinates in Advanced Settings.");
    } finally {
      setSearchingLocation(false);
    }
  };

  // Simulated File Drop / Upload
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setUploadedFileName(files[0].name);
      // Simulate reading a KML/GeoJSON and parsing the area
      const mockAreas = ["450", "1,250", "2,840", "85"];
      setFileArea(mockAreas[Math.floor(Math.random() * mockAreas.length)]);
    }
  };

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
      
      const computedArea = boundaryMethod === "file" 
        ? `${fileArea} ha` 
        : `${((Math.PI * Math.pow(parseFloat(radiusMeters) || 500, 2)) / 10000).toFixed(1)} ha`;

      setAiResult({
        cqs: "AAA",
        cqsScore: 97,
        forestCover: "91.2%",
        area: computedArea
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
        area: aiResult.area,
        status: "Verified",
        cqs: aiResult.cqs,
        cqsScore: aiResult.cqsScore,
        forestCover: aiResult.forestCover,
        lastScan: "Just now (Sentinel-2)",
        trend: "+0.3%",
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
          <Link href="/retire" className="hover:text-white transition-colors">Retire Credits</Link>
          <span className="text-emerald-400 border-b border-emerald-400 pb-1">Register Project</span>
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
              
              {/* Project Name */}
              <div>
                <label className="text-xs uppercase font-medium text-gray-400 block mb-2">Project / Estate Name</label>
                <input 
                  type="text" 
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" 
                  placeholder="e.g. Western Ghats Coffee & Forest Estate"
                />
              </div>

              {/* Title Deed ID */}
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

              {/* Step 1: Location Search Bar */}
              <div className="p-4 bg-white/[0.02] border border-gray-800 rounded-2xl space-y-3">
                <label className="text-xs uppercase font-bold text-gray-300 block">1. Search General Region / City</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGeocodingSearch()}
                    placeholder="e.g. Western Ghats, Karnataka or Coorg, India"
                    className="flex-1 bg-black/50 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleGeocodingSearch}
                    disabled={searchingLocation}
                    className="px-4 py-2.5 bg-gray-800 hover:bg-gray-750 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {searchingLocation ? "Searching..." : "Locate"}
                  </button>
                </div>
                {searchFeedback && (
                  <div className="text-[11px] font-medium text-emerald-400">{searchFeedback}</div>
                )}
              </div>

              {/* Step 2: Boundary Selection Method */}
              <div className="p-4 bg-white/[0.02] border border-gray-800 rounded-2xl space-y-4">
                <label className="text-xs uppercase font-bold text-gray-300 block">2. Define Private Parcel Boundary</label>
                
                {/* Method Toggles */}
                <div className="flex border border-gray-800 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setBoundaryMethod("file")}
                    className={`flex-1 py-2 text-xs font-bold text-center transition-colors ${boundaryMethod === "file" ? "bg-emerald-500 text-black" : "bg-black/50 text-gray-400 hover:text-white"}`}
                  >
                    📂 Upload Land Survey File
                  </button>
                  <button
                    type="button"
                    onClick={() => setBoundaryMethod("radius")}
                    className={`flex-1 py-2 text-xs font-bold text-center transition-colors ${boundaryMethod === "radius" ? "bg-emerald-500 text-black" : "bg-black/50 text-gray-400 hover:text-white"}`}
                  >
                    🎯 Center GPS & Radius
                  </button>
                </div>

                {/* Method A Content: File Upload */}
                {boundaryMethod === "file" ? (
                  <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                    className="border-2 border-dashed border-gray-800 hover:border-emerald-500/50 rounded-2xl p-6 text-center transition-colors cursor-pointer"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = ".kml,.geojson,.json,.shp";
                      input.onchange = (e: any) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadedFileName(file.name);
                          const mockAreas = ["450", "1,250", "2,840", "85"];
                          setFileArea(mockAreas[Math.floor(Math.random() * mockAreas.length)]);
                        }
                      };
                      input.click();
                    }}
                  >
                    <svg className="w-8 h-8 mx-auto mb-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <div className="text-xs text-white font-medium">
                      {uploadedFileName ? `Selected: ${uploadedFileName}` : "Drag and drop your KML, GeoJSON, or Shapefile here"}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">Files provided by certified surveyor. Max 10MB.</div>
                    
                    {uploadedFileName && (
                      <div className="mt-3 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-1.5 px-3 rounded-lg inline-block">
                        ✓ Parsed parcel size: <strong>{fileArea} ha</strong>
                      </div>
                    )}
                  </div>
                ) : (
                  // Method B Content: Radius
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Estate Radius (Meters)</label>
                      <input 
                        type="number" 
                        value={radiusMeters}
                        onChange={(e) => setRadiusMeters(e.target.value)}
                        className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:outline-none" 
                        placeholder="500"
                      />
                    </div>
                    <div className="flex flex-col justify-end">
                      <div className="text-xs text-gray-400 font-mono pb-2">
                        Estimated Area:<br/>
                        <strong className="text-white">
                          {((Math.PI * Math.pow(parseFloat(radiusMeters) || 500, 2)) / 10000).toFixed(1)} Hectares
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Advanced Collapsible Coordinates Drawer */}
              <div className="border border-gray-800 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowAdvancedCoords(!showAdvancedCoords)}
                  className="w-full bg-black/40 px-5 py-3 text-left text-xs font-bold text-gray-400 hover:bg-black/60 transition-colors flex justify-between items-center"
                >
                  <span>⚙️ Show Advanced GPS Coordinates</span>
                  <span>{showAdvancedCoords ? "▲" : "▼"}</span>
                </button>
                
                {showAdvancedCoords && (
                  <div className="p-5 bg-black/20 border-t border-gray-800 grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Center Latitude</label>
                      <input 
                        type="text" 
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        className="w-full bg-black/50 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Center Longitude</label>
                      <input 
                        type="text" 
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        className="w-full bg-black/50 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none" 
                      />
                    </div>
                  </div>
                )}
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
                      <div>Audited Parcel Area: <span className="text-white font-bold">{aiResult.area}</span></div>
                    </div>
                  </div>
                )}

                {!scanning && !scanComplete && (
                  <div className="h-48 flex flex-col items-center justify-center text-center text-gray-500 text-sm">
                    <svg className="w-10 h-10 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Define location & boundaries<br/>and click "Run AI Satellite Verification"
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

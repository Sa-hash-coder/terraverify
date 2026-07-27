"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Explorer() {
  const [selectedProject, setSelectedProject] = useState<number | null>(1);

  return (
    <main className="h-screen flex flex-col overflow-hidden">
      {/* Navbar */}
      <nav className="flex flex-col md:flex-row justify-between items-center p-4 md:p-6 bg-[#050505]/80 backdrop-blur-md border-b border-gray-800 z-10 gap-4 md:gap-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Terra<span className="text-gradient">Verify</span></h1>
          </Link>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 items-center text-sm font-medium text-gray-300">
          <Link href="/" className="hover:text-white transition-colors">Dashboard</Link>
          <span className="text-emerald-400">Explorer</span>
          <Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link>
          <button className="px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all">
            Connect Wallet
          </button>
        </div>
      </nav>

      {/* Main Content Split */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Sidebar Panel */}
        <div className="w-full md:w-96 bg-[#0a0a0a] border-b md:border-r md:border-b-0 border-gray-800 flex flex-col z-10 shadow-2xl overflow-y-auto md:overflow-hidden h-1/2 md:h-auto">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold mb-2">Verified Projects</h2>
            <p className="text-sm text-gray-400">Select a region to view live satellite telemetry and mint status.</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Project Card 1 */}
            <div 
              onClick={() => setSelectedProject(1)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${selectedProject === 1 ? 'bg-white/[0.05] border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-[#111] border-gray-800 hover:border-gray-600'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold">Amazon Block 7</h3>
                <span className="text-xs font-bold px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md">AAA</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">Location: Amazonas, Brazil<br/>Area: 12,500 ha</p>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#050505] p-2 rounded-lg border border-gray-800">
                  <div className="text-[10px] text-gray-500 uppercase">Forest Cover</div>
                  <div className="text-sm font-bold text-emerald-400">84.5%</div>
                </div>
                <div className="bg-[#050505] p-2 rounded-lg border border-gray-800">
                  <div className="text-[10px] text-gray-500 uppercase">Status</div>
                  <div className="text-sm font-bold text-white">Active</div>
                </div>
              </div>
            </div>

            {/* Project Card 2 (Suspended Example) */}
            <div 
              onClick={() => setSelectedProject(2)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${selectedProject === 2 ? 'bg-white/[0.05] border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'bg-[#111] border-gray-800 hover:border-gray-600'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold">Borneo Peatlands</h3>
                <span className="text-xs font-bold px-2 py-1 bg-red-500/20 text-red-400 rounded-md">C</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">Location: Kalimantan, ID<br/>Area: 8,200 ha</p>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#050505] p-2 rounded-lg border border-gray-800">
                  <div className="text-[10px] text-gray-500 uppercase">Forest Cover</div>
                  <div className="text-sm font-bold text-red-400">62.1% <span className="text-xs">(-5.4%)</span></div>
                </div>
                <div className="bg-[#050505] p-2 rounded-lg border border-red-900/30">
                  <div className="text-[10px] text-red-400 uppercase">Status</div>
                  <div className="text-sm font-bold text-red-500">Revoked</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Area (Mockup for Portfolio) */}
        <div className="flex-1 relative bg-[#0a0f12] flex items-center justify-center overflow-hidden h-1/2 md:h-auto min-h-[300px]">
          {/* Fake Grid Background to simulate map tiles */}
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}></div>

          {/* Central Satellite Image Mock */}
          <div className="relative z-10 w-[90%] md:w-[800px] h-[90%] md:h-[500px] max-h-[500px] rounded-3xl border border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center group">
            {selectedProject === 1 ? (
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: "url('/amazon.png')" }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="z-10 w-64 h-64 border-2 border-emerald-400 border-dashed rounded-lg relative backdrop-blur-sm bg-emerald-500/10">
                  <div className="absolute -top-3 -right-3 w-6 h-6 bg-emerald-500 rounded-full animate-ping"></div>
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-[10px] text-emerald-400 font-mono border border-emerald-500/30">SCANNING...</div>
                </div>
                <div className="z-10 mt-auto mb-10 text-center">
                  <p className="font-mono text-sm text-emerald-400 drop-shadow-md bg-black/50 px-4 py-1 rounded-full border border-emerald-500/20">LAT: -3.42 LON: -62.40 | SENTINEL-2 L2A</p>
                  <p className="text-xs text-white mt-3 font-semibold tracking-wide drop-shadow-md">AI Analysis: 84.5% Canopy Density (Verified)</p>
                </div>
              </div>
            ) : (
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: "url('/borneo.png')" }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                <div className="z-10 w-64 h-64 border-2 border-red-500 border-dashed rounded-lg relative backdrop-blur-sm bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                  <div className="absolute bottom-4 right-4 bg-red-500/90 border border-red-400 rounded-sm px-3 py-1 animate-pulse">
                    <span className="text-[11px] font-bold text-white whitespace-nowrap">DEFORESTATION DETECTED</span>
                  </div>
                </div>
                <div className="z-10 mt-auto mb-10 text-center">
                  <p className="font-mono text-sm text-red-400 drop-shadow-md bg-black/50 px-4 py-1 rounded-full border border-red-500/30">LAT: -1.25 LON: 114.12 | SENTINEL-2 L2A</p>
                  <p className="text-xs text-white mt-3 font-semibold tracking-wide drop-shadow-md">AI Analysis: -5.4% Loss Detected. Tokens auto-burned.</p>
                </div>
              </div>
            )}
          </div>

          {/* Floating Action Button */}
          <button className="absolute bottom-8 right-8 px-6 py-3 bg-white text-black font-bold rounded-full shadow-lg hover:bg-gray-200 transition-colors">
            View On-Chain Oracle Report ↗
          </button>
        </div>

      </div>
    </main>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import GlobeCanvas from "../../components/globe-canvas";

// Load Leaflet dynamically with SSR disabled since it requires client window/document globals
const MapComponent = dynamic(() => import("../../components/map-component"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0a0f12] flex items-center justify-center text-emerald-400 font-mono animate-pulse">
      LOADING TELEMETRY MAP...
    </div>
  ),
});

export default function Explorer() {
  const [selectedProject, setSelectedProject] = useState<number | null>(1);
  const [isTargeting, setIsTargeting] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleProjectSelect = (id: number) => {
    setSelectedProject(id);
    setIsTargeting(true);
  };

  if (!mounted) return null;

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
          <WalletMultiButton className="!px-5 !py-2 !rounded-full !bg-white/10 !border !border-white/20 hover:!bg-white/20 !transition-all !shadow-lg !backdrop-blur-md !text-white !font-medium !text-sm !h-auto !line-height-normal" />
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
              onClick={() => handleProjectSelect(1)}
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
              onClick={() => handleProjectSelect(2)}
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

        {/* Map Area */}
        <div className="flex-1 relative bg-[#0a0f12] h-1/2 md:h-auto min-h-[300px] z-0 overflow-hidden">
          {/* 3D Globe Targeting Layer */}
          <div className={`absolute inset-0 transition-opacity duration-700 z-10 ${isTargeting ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <GlobeCanvas selectedProject={selectedProject} onTransitionComplete={() => setIsTargeting(false)} />
          </div>

          {/* 2D Satellite Map Layer */}
          <div className={`absolute inset-0 transition-opacity duration-1000 z-0 ${!isTargeting ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <MapComponent selectedProject={selectedProject} onSelectProject={handleProjectSelect} />
          </div>

          {/* Floating Action Button */}
          <button className="absolute bottom-8 right-8 px-6 py-3 bg-white text-black font-bold rounded-full shadow-lg hover:bg-gray-200 transition-colors z-20">
            View On-Chain Oracle Report ↗
          </button>
        </div>

      </div>
    </main>
  );
}

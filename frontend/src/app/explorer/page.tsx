"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Header from "../../components/header";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

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
  const [mounted, setMounted] = useState(false);
  const [showOracleModal, setShowOracleModal] = useState(false);
  const [projectsData, setProjectsData] = useState({
    amazon: { forestCover: "84.5%", cqs: "AAA", status: "Active", cqsScore: 94 },
    borneo: { forestCover: "62.1%", cqs: "C", status: "Revoked", cqsScore: 42, trend: "-5.4%" },
  });

  useEffect(() => {
    setMounted(true);

    const fetchTelemetry = async () => {
      try {
        const res = await fetch("/api/telemetry");
        if (res.ok) {
          const data = await res.json();
          if (data.projects) {
            const p1 = data.projects.find((p: any) => p.id === "PRJ-001");
            const p3 = data.projects.find((p: any) => p.id === "PRJ-003");
            if (p1 || p3) {
              setProjectsData({
                amazon: {
                  forestCover: p1?.forestCover || "84.5%",
                  cqs: p1?.cqs || "AAA",
                  status: p1?.status === "Verified" ? "Active" : p1?.status || "Active",
                  cqsScore: p1?.cqsScore || 94,
                },
                borneo: {
                  forestCover: p2_forestCover(p3?.forestCover),
                  cqs: p3?.cqs || "C",
                  status: p3?.status === "Suspended" ? "Revoked" : p3?.status || "Revoked",
                  cqsScore: p3?.cqsScore || 42,
                  trend: p3?.trend || "-5.4%",
                },
              });
            }
          }
        }
      } catch {
        // fallback
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

  function p2_forestCover(val?: string) {
    return val || "62.1%";
  }

  if (!mounted) return null;

  return (
    <main className="h-screen flex flex-col overflow-hidden p-4 sm:p-8">
      <Header activeTab="explorer" />

      {/* Main Content Split */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden rounded-2xl border border-gray-800">
        
        {/* Sidebar Panel */}
        <div className="w-full md:w-96 bg-[#0a0a0a] border-b md:border-r md:border-b-0 border-gray-800 flex flex-col z-10 shadow-2xl overflow-y-auto md:overflow-hidden h-[38vh] md:h-auto">
          <div className="p-5 border-b border-gray-800">
            <h2 className="text-xl font-bold mb-1">Verified Projects</h2>
            <p className="text-xs text-gray-400 font-medium">Select a region to view live satellite telemetry and mint status.</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Project Card 1 */}
            <div 
              onClick={() => setSelectedProject(1)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${selectedProject === 1 ? 'bg-white/[0.05] border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-[#111] border-gray-800 hover:border-gray-600'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold">Amazon Block 7</h3>
                <span className="text-xs font-bold px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md">{projectsData.amazon.cqs}</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">Location: Amazonas, Brazil<br/>Area: 12,500 ha</p>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#050505] p-2 rounded-lg border border-gray-800">
                  <div className="text-[10px] text-gray-500 uppercase">Forest Cover</div>
                  <div className="text-sm font-bold text-emerald-400">{projectsData.amazon.forestCover}</div>
                </div>
                <div className="bg-[#050505] p-2 rounded-lg border border-gray-800">
                  <div className="text-[10px] text-gray-500 uppercase">Status</div>
                  <div className="text-sm font-bold text-white">{projectsData.amazon.status}</div>
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
                <span className="text-xs font-bold px-2 py-1 bg-red-500/20 text-red-400 rounded-md">{projectsData.borneo.cqs}</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">Location: Kalimantan, ID<br/>Area: 8,200 ha</p>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#050505] p-2 rounded-lg border border-gray-800">
                  <div className="text-[10px] text-gray-500 uppercase">Forest Cover</div>
                  <div className="text-sm font-bold text-red-400">{projectsData.borneo.forestCover} <span className="text-xs">({projectsData.borneo.trend})</span></div>
                </div>
                <div className="bg-[#050505] p-2 rounded-lg border border-red-900/30">
                  <div className="text-[10px] text-red-400 uppercase">Status</div>
                  <div className="text-sm font-bold text-red-500">{projectsData.borneo.status}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative bg-[#0a0f12] h-[45vh] md:h-auto min-h-[300px] z-0">
          <MapComponent selectedProject={selectedProject} onSelectProject={setSelectedProject} />

          {/* Floating Action Button */}
          <button 
            onClick={() => setShowOracleModal(true)}
            className="absolute bottom-8 right-8 px-6 py-3 bg-white text-black font-bold rounded-full shadow-lg hover:bg-gray-200 transition-colors z-10 text-xs sm:text-sm"
          >
            View On-Chain Oracle Report ↗
          </button>
        </div>

      </div>

      {/* On-Chain Oracle Report Modal */}
      {showOracleModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#0c0d0e] border-2 border-emerald-500/30 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-[0_0_50px_rgba(16,185,129,0.15)] relative">
            
            {/* Close Button */}
            <button 
              onClick={() => setShowOracleModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white text-xl font-bold font-sans"
            >
              ✕
            </button>

            {/* Title */}
            <div>
              <div className="text-[10px] tracking-[4px] uppercase text-emerald-400 font-bold mb-1">Live Oracle Telemetry</div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">Sentinel-2 On-Chain Report</h3>
            </div>

            {/* Oracle JSON Raw Data */}
            <div className="bg-black/60 border border-gray-800 p-5 rounded-2xl font-mono text-[11px] sm:text-xs text-emerald-400 space-y-1.5 overflow-x-auto leading-relaxed shadow-inner radar-sweep">
              <div>{"{"}</div>
              <div className="pl-4">"oracle_address": "Efnm4SRpWogLYYMXnrrwbJ1i7WFbM343rtoASXkxwkoC",</div>
              <div className="pl-4">"validator_node": "Sentinel-2 L2A European Space Agency",</div>
              <div className="pl-4">"timestamp": "{new Date().toISOString()}",</div>
              <div className="pl-4">"monitored_region": "{selectedProject === 1 ? "Amazon Reforestation Block 7" : "Borneo Peatland Protection"}",</div>
              <div className="pl-4">"center_gps": "{selectedProject === 1 ? "-3.4200, -62.4000" : "-1.2500, 114.1200"}",</div>
              <div className="pl-4">"calculated_ndvi": {selectedProject === 1 ? "0.845" : "0.584"},</div>
              <div className="pl-4">"canopy_quality_score": {selectedProject === 1 ? "94" : "42"},</div>
              <div className="pl-4">"project_tier": "{selectedProject === 1 ? "AAA" : "C"}",</div>
              <div className="pl-4">"oracle_consensus_status": "{selectedProject === 1 ? "Verified (Active)" : "Suspended"}",</div>
              <div className="pl-4">"action_enforced": "{selectedProject === 1 ? "None (Trading Active)" : "HALT_TRADING_AND_REVOKE_UNRETIRED_SUPPLY"}"</div>
              <div>{"}"}</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a 
                href={`https://explorer.solana.com/address/Efnm4SRpWogLYYMXnrrwbJ1i7WFbM343rtoASXkxwkoC?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 text-center bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm rounded-xl transition-colors shadow-lg"
              >
                Verify Oracle Account ↗
              </a>
              <button 
                onClick={() => setShowOracleModal(false)}
                className="flex-1 py-3 border border-gray-800 hover:bg-white/5 text-white font-medium text-sm rounded-xl transition-colors"
              >
                Close Diagnostic
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}

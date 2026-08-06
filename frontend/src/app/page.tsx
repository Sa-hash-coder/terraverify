"use client";

import React, { useState, useEffect } from "react";
import Header from "../components/header";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

// Mock Data for the MVP Pitch
const STATS = {
  totalCredits: "1,245,000",
  activeProjects: 12,
  hectaresMonitored: "450,200",
  revokedCredits: "8,400",
};

const PROJECTS = [
  {
    id: "PRJ-001",
    name: "Amazon Reforestation Block 7",
    location: "Brazil",
    area: "12,500 ha",
    status: "Verified",
    cqs: "AAA",
    cqsScore: 94,
    forestCover: "84.5%",
    lastScan: "2 hours ago",
    trend: "+0.2%",
  },
  {
    id: "PRJ-002",
    name: "Congo Basin Conservation",
    location: "DRC",
    area: "45,000 ha",
    status: "Verified",
    cqs: "AA",
    cqsScore: 88,
    forestCover: "88.0%",
    lastScan: "5 hours ago",
    trend: "0.0%",
  },
  {
    id: "PRJ-003",
    name: "Borneo Peatland Protection",
    location: "Indonesia",
    area: "8,200 ha",
    status: "Suspended", // Showcasing the auto-revoke feature
    cqs: "C",
    cqsScore: 42,
    forestCover: "62.1%",
    lastScan: "12 hours ago",
    trend: "-5.4%",
  }
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState(PROJECTS);

  useEffect(() => {
    setMounted(true);

    const fetchTelemetry = async () => {
      try {
        const res = await fetch("/api/telemetry");
        if (res.ok) {
          const data = await res.json();
          if (data.projects && data.projects.length > 0) {
            setProjects(data.projects);
          }
        }
      } catch {
        // Ignore fallback
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen p-4 sm:p-8 lg:p-12">
      <Header activeTab="dashboard" />

      {/* Visual Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
        <div className="lg:col-span-7 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-6 shadow-[0_0_15px_rgba(0,242,254,0.15)]">
            <span className="status-indicator"></span>
            Sentinel-2 L2A AI Pipeline Connected
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6">
            Don't trust. <br className="hidden sm:block"/> <span className="text-gradient">Verify from space.</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-xl leading-relaxed mx-auto lg:mx-0 mb-8 font-normal">
            The first Solana-native carbon credit protocol backed by continuous satellite imagery. Offsets are dynamically monitored—if deforestation is detected, credits are automatically revoked on-chain.
          </p>
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <a href="/explorer" className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-bold text-sm shadow-[0_0_25px_rgba(0,242,254,0.3)] hover:scale-[1.02] transition-all btn-premium">
              🛰️ Launch Satellite Explorer
            </a>
            <a href="/marketplace" className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-gray-800 font-semibold text-sm transition-all">
              Trade Credits →
            </a>
          </div>
        </div>

        {/* Live Satellite Visual HUD Card */}
        <div className="lg:col-span-5">
          <div className="relative rounded-3xl p-1 bg-gradient-to-br from-cyan-500/30 via-emerald-500/10 to-transparent shadow-[0_0_40px_rgba(0,242,254,0.15)]">
            <div className="relative rounded-[22px] overflow-hidden bg-[#070d14] border border-cyan-500/20 shadow-2xl">
              <img 
                src="/dashboard.png" 
                alt="TerraVerify Satellite Sensor View"
                className="w-full h-auto object-cover opacity-95 hover:scale-105 transition-transform duration-700 block rounded-[22px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Key Stats (Premium Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
        {[
          { label: "Total Verified Credits", value: STATS.totalCredits, suffix: " tCO2e" },
          { label: "Active Projects", value: STATS.activeProjects, suffix: "" },
          { label: "Area Monitored", value: STATS.hectaresMonitored, suffix: " ha" },
          { label: "Auto-Revoked Credits", value: STATS.revokedCredits, suffix: " tCO2e", color: "text-red-400" },
        ].map((stat, i) => (
          <div key={i} className="premium-card p-6 rounded-2xl border border-cyan-500/10">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-2">{stat.label}</h3>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-extrabold ${stat.color || "text-white"}`}>{stat.value}</span>
              <span className="text-xs text-gray-400 font-mono">{stat.suffix}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Project Registry Table */}
      <div className="glass-panel rounded-3xl p-1 overflow-hidden hologram-glow">
        <div className="bg-[#05080c]/90 rounded-[22px] p-6 lg:p-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-1">Live Project Registry</h3>
              <p className="text-xs text-gray-400 font-medium">Continuous satellite monitoring via Sentinel-2 L2A</p>
            </div>
            <a href="/explorer" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 tracking-wide uppercase">View Explorer →</a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-gray-500 border-b border-gray-800">
                  <th className="pb-4 font-medium">Parcel View</th>
                  <th className="pb-4 font-medium">Project Name</th>
                  <th className="pb-4 font-medium">Location</th>
                  <th className="pb-4 font-medium">CQS Score</th>
                  <th className="pb-4 font-medium">Last Satellite Scan</th>
                  <th className="pb-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {projects.map((project, i) => {
                  const imgThumb = project.id === "PRJ-003" ? "/borneo.png" : "/amazon.png";
                  return (
                    <tr key={i} className="group hover:bg-white/[0.03] transition-colors">
                      <td className="py-4 pr-4">
                        <div className="w-16 h-12 rounded-xl overflow-hidden relative border border-cyan-500/20 shadow-md shrink-0">
                          <img src={imgThumb} alt={project.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="font-semibold text-white group-hover:text-cyan-400 transition-colors">{project.name}</div>
                        <div className="text-xs text-gray-500 mt-1 font-mono">{project.id} • {project.area}</div>
                      </td>
                      <td className="py-4 text-sm text-gray-300 font-medium">{project.location}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            project.cqsScore >= 90 ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" :
                            project.cqsScore >= 80 ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                            "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}>
                            {project.cqs}
                          </div>
                          <span className="text-xs text-gray-400 font-mono">{project.cqsScore}/100</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="text-xs text-gray-300 font-mono">{project.lastScan}</div>
                        <div className={`text-xs mt-1 font-medium ${project.trend.startsWith('-') ? 'text-red-400' : 'text-cyan-400'}`}>
                          {project.trend} forest cover
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                          project.status === 'Verified' 
                            ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                            : 'border-red-500/30 bg-red-500/10 text-red-400'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

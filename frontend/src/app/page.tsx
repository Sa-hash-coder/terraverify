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

      {/* Hero Section */}
      <div className="max-w-4xl mb-12 md:mb-16 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
          <span className="status-indicator"></span>
          Satellite AI Pipeline Active
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight mb-6">
          Don't trust. <br className="hidden md:block"/> <span className="text-gradient">Verify from space.</span>
        </h2>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed mx-auto md:mx-0">
          The first Solana-native carbon credit protocol with automated, AI-driven satellite verification. Credits are continuously monitored and automatically revoked if deforestation is detected.
        </p>
      </div>

      {/* Key Stats (Glass Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {[
          { label: "Total Verified Credits", value: STATS.totalCredits, suffix: " tCO2e" },
          { label: "Active Projects", value: STATS.activeProjects, suffix: "" },
          { label: "Area Monitored", value: STATS.hectaresMonitored, suffix: " ha" },
          { label: "Auto-Revoked Credits", value: STATS.revokedCredits, suffix: " tCO2e", color: "text-red-400" },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl">
            <h3 className="text-gray-400 text-sm font-medium mb-2">{stat.label}</h3>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-bold ${stat.color || "text-white"}`}>{stat.value}</span>
              <span className="text-sm text-gray-500">{stat.suffix}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Project Registry Table */}
      <div className="glass-panel rounded-3xl p-1 overflow-hidden">
        <div className="bg-[#111] rounded-[22px] p-6 lg:p-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-2">Live Project Registry</h3>
              <p className="text-sm text-gray-400">Continuous satellite monitoring via Sentinel-2 L2A</p>
            </div>
            <button className="text-sm font-medium text-emerald-400 hover:text-emerald-300">View All →</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-gray-500 border-b border-gray-800">
                  <th className="pb-4 font-medium">Project Name</th>
                  <th className="pb-4 font-medium">Location</th>
                  <th className="pb-4 font-medium">CQS Score</th>
                  <th className="pb-4 font-medium">Last Satellite Scan</th>
                  <th className="pb-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {projects.map((project, i) => (
                  <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-5">
                      <div className="font-medium text-white group-hover:text-emerald-400 transition-colors">{project.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{project.id} • {project.area}</div>
                    </td>
                    <td className="py-5 text-sm text-gray-300">{project.location}</td>
                    <td className="py-5">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          project.cqsScore >= 90 ? "bg-emerald-500/20 text-emerald-400" :
                          project.cqsScore >= 80 ? "bg-blue-500/20 text-blue-400" :
                          "bg-red-500/20 text-red-400"
                        }`}>
                          {project.cqs}
                        </div>
                        <span className="text-xs text-gray-400">{project.cqsScore}/100</span>
                      </div>
                    </td>
                    <td className="py-5">
                      <div className="text-sm text-gray-300">{project.lastScan}</div>
                      <div className={`text-xs mt-1 ${project.trend.startsWith('-') ? 'text-red-400' : 'text-emerald-400'}`}>
                        {project.trend} forest cover
                      </div>
                    </td>
                    <td className="py-5">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${
                        project.status === 'Verified' 
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : 'border-red-500/30 bg-red-500/10 text-red-400'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

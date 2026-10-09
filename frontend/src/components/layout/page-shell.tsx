"use client";

import React from "react";
import AppHeader from "./app-header";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export default function PageShell({ children, className = "", fullWidth = false }: PageShellProps) {
  return (
    <div 
      className="min-h-screen flex flex-col bg-[#f8fafc] text-[#0f172a] transition-colors antialiased"
      style={{
        "--surface": "#ffffff",
        "--surface-raised": "#f8fafc",
        "--border": "#e2e8f0",
        "--foreground": "#0f172a",
        "--muted": "#64748b",
        "--brand": "#059669",
        "--brand-foreground": "#ffffff"
      } as React.CSSProperties}
    >
      <AppHeader />
      <main className={`flex-1 w-full ${fullWidth ? "p-0" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"} ${className}`}>
        {children}
      </main>
    </div>
  );
}

"use client";

import React from "react";
import AppHeader from "./app-header";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  noScroll?: boolean;
}

export default function PageShell({
  children,
  className = "",
  fullWidth = false,
  noScroll = false,
}: PageShellProps) {
  return (
    <div className="min-h-dvh w-full flex flex-col bg-[var(--bg-app)] text-[var(--text)] antialiased">
      {/* Top Navigation Header */}
      <AppHeader />

      {/* Main Content Viewport */}
      <main
        className={`flex-1 min-w-0 flex flex-col ${
          noScroll ? "h-[calc(100dvh-4rem)] overflow-hidden" : "overflow-y-auto"
        } ${
          fullWidth
            ? "p-0"
            : "max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
        } ${className}`}
      >
        {children}
      </main>
    </div>
  );
}

"use client";

import React from "react";
import AppSidebar from "./app-sidebar";

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
    <div className="h-dvh w-screen flex flex-col md:flex-row bg-[var(--bg-app)] text-[var(--text)] overflow-hidden antialiased">
      {/* Persistent Left Sidebar */}
      <AppSidebar />

      {/* Main Content Viewport */}
      <main
        className={`flex-1 min-w-0 flex flex-col h-[calc(100dvh-3.5rem)] md:h-dvh ${
          noScroll ? "overflow-hidden" : "overflow-y-auto"
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

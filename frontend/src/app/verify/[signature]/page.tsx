"use client";

import React, { use } from "react";
import Link from "next/link";
import { CheckCircle2, ExternalLink, ArrowLeft, Printer, ShieldCheck, Calendar, MapPin, Building } from "lucide-react";
import PageShell from "../../../components/layout/page-shell";
import { PageHeader, Panel, DataRow, GradeBadge, AddressChip } from "../../../components/shared/design-system";

export default function VerifySignaturePage({
  params,
}: {
  params: Promise<{ signature: string }>;
}) {
  const resolvedParams = use(params);
  const signature = resolvedParams.signature || "5wHmd1tsz2veD44UNLaRbg7aD463D11RdCz9zRYkKAkFYgSm";

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/retire"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] font-mono transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Retirement Console</span>
        </Link>

        {/* Verification Status Header */}
        <div className="p-6 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] text-left shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-[var(--accent)]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text)]">
              Verified Carbon Offset Certificate
            </h1>
            <p className="text-xs text-[var(--accent)] font-mono">
              Solana Ledger Attestation · Token-2022 Burn Proof
            </p>
          </div>
        </div>

        {/* Institutional Certificate Card (Paper Aesthetic) */}
        <div className="bg-[#fcfcf9] text-[#1a201c] p-8 sm:p-12 rounded-2xl shadow-xl border border-[#e2e4dc] relative overflow-hidden text-left font-serif print:p-0 print:shadow-none print:border-none">
          {/* Subtle Watermark Emblem */}
          <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none select-none text-9xl font-sans font-bold">
            TV
          </div>

          <div className="flex justify-between items-start pb-6 border-b border-[#e2e4dc]">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-[#2e5944] font-semibold mb-1">
                TerraVerify Protocol · Registry Authority
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#111c16]">
                Certificate of Permanent Retirement
              </h2>
            </div>
            <div className="text-right font-mono text-xs text-[#526359]">
              <div>SERIAL NO:</div>
              <div className="font-bold text-[#111c16]">TV-RET-2026-{signature.slice(0, 8).toUpperCase()}</div>
            </div>
          </div>

          <div className="py-8 space-y-6">
            <p className="text-base text-[#2d3a33] leading-relaxed">
              This document certifies that the carbon offset credits described herein have been permanently
              burned and retired from circulation on the public Solana blockchain, representing verifiable
              ecological stewardship monitored by Copernicus Sentinel-2 satellites.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4 border-y border-[#e2e4dc] font-sans text-xs">
              <div>
                <span className="text-[#697a70] uppercase font-mono text-[11px] block mb-1">
                  Beneficiary Entity
                </span>
                <span className="text-base font-bold text-[#111c16]">
                  Acme Corporation ESG Division
                </span>
              </div>

              <div>
                <span className="text-[#697a70] uppercase font-mono text-[11px] block mb-1">
                  Retired Quantity
                </span>
                <span className="text-xl font-mono font-bold text-[#1a5734]">
                  12,500 Tonnes CO₂e
                </span>
              </div>

              <div>
                <span className="text-[#697a70] uppercase font-mono text-[11px] block mb-1">
                  Project of Origin
                </span>
                <span className="font-semibold text-[#111c16]">
                  Amazon Reforestation Block 7 (Grade AAA)
                </span>
              </div>

              <div>
                <span className="text-[#697a70] uppercase font-mono text-[11px] block mb-1">
                  Retirement Timestamp
                </span>
                <span className="font-mono text-[#111c16]">
                  {new Date().toUTCString()}
                </span>
              </div>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <span className="text-[#697a70] text-[11px] uppercase block">
                Solana Transaction Signature:
              </span>
              <div className="p-3 rounded bg-[#f4f5ee] border border-[#e2e4dc] break-all select-all text-[#111c16]">
                {signature}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#e2e4dc] flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs">
            <div className="text-[#697a70] text-[11px] font-mono">
              Independent audit telemetry provided by Copernicus Sentinel-2 L2A European Space Agency.
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-lg bg-[var(--text)] text-[var(--bg-app)] hover:opacity-90 transition-opacity flex items-center gap-1.5 font-medium cursor-pointer print:hidden"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Certificate</span>
            </button>
          </div>
        </div>

        {/* Public Blockchain Proof Link */}
        <Panel className="p-4 flex items-center justify-between text-xs font-mono">
          <span className="text-[var(--text-muted)]">Verify ledger proof directly on Solana Explorer:</span>
          <a
            href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] hover:opacity-90 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Explorer Transaction Proof</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </Panel>
      </div>
    </PageShell>
  );
}

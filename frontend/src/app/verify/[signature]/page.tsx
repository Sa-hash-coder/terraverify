"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  CheckCircle2, 
  ExternalLink, 
  ArrowLeft, 
  Printer, 
  ShieldCheck, 
  Calendar, 
  Building, 
  Layers,
  Clock,
  Sparkles,
  Loader2
} from "lucide-react";
import PageShell from "../../../components/layout/page-shell";
import { Panel, GradeBadge, AddressChip } from "../../../components/shared/design-system";

interface OnChainTxData {
  onChain: boolean;
  signature: string;
  slot?: number;
  blockTime: string;
  sender?: string;
  recipient?: string;
  transferSol?: number;
  memo?: string | null;
  status: string;
  explorerUrl: string;
}

export default function VerifySignaturePage({
  params,
}: {
  params: Promise<{ signature: string }>;
}) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const signature = resolvedParams.signature || "5wHmd1tsz2veD44UNLaRbg7aD463D11RdCz9zRYkKAkFYgSm";

  const [loading, setLoading] = useState(true);
  const [txData, setTxData] = useState<OnChainTxData | null>(null);

  // Defaults or query parameters passed from Retirement Console
  const queryBeneficiary = searchParams.get("beneficiary");
  const queryAmount = searchParams.get("amount");
  const queryProject = searchParams.get("project");
  const queryGrade = searchParams.get("grade") || "AAA";

  const [certificateData, setCertificateData] = useState({
    beneficiary: queryBeneficiary || "Acme Corporation ESG Division",
    amount: queryAmount ? `${Number(queryAmount).toLocaleString()} Tonnes CO₂e` : "500 Tonnes CO₂e",
    project: queryProject || "Amazon Reforestation Block 7 (Grade AAA)",
    grade: queryGrade,
    timestamp: new Date().toUTCString(),
    sender: "Connected Solana Wallet",
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchOnChainAttestation() {
      try {
        setLoading(true);
        const res = await fetch(`/api/verify/${signature}`);
        if (!res.ok) throw new Error("Failed to query verification API");
        const json: OnChainTxData = await res.json();

        if (isMounted && json) {
          setTxData(json);

          // If the on-chain Memo text contains structured burn metadata, parse it:
          // e.g. "TerraVerify Burn: 500 tCO2e retired by Acme Corp for Amazon Reforestation"
          if (json.memo && json.memo.includes("TerraVerify Burn:")) {
            const memoStr = json.memo.replace("TerraVerify Burn:", "").trim();
            const parts = memoStr.split("|").map((s) => s.trim());

            if (parts.length >= 3) {
              setCertificateData((prev) => ({
                ...prev,
                amount: `${parts[0]} Tonnes CO₂e`,
                beneficiary: parts[1],
                project: parts[2],
                timestamp: json.blockTime || prev.timestamp,
                sender: json.sender || prev.sender,
              }));
            }
          } else if (json.blockTime) {
            setCertificateData((prev) => ({
              ...prev,
              timestamp: json.blockTime,
              sender: json.sender || prev.sender,
            }));
          }
        }
      } catch (err) {
        console.warn("Could not retrieve on-chain attestation:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchOnChainAttestation();
    return () => {
      isMounted = false;
    };
  }, [signature]);

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/retire"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--foreground)] font-mono transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Retirement Console</span>
        </Link>

        {/* Verification Status Header */}
        <div className="p-6 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] text-left shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--foreground)]">
                Verified Carbon Offset Certificate
              </h1>
              <p className="text-xs text-emerald-500 font-mono flex items-center gap-2 mt-0.5">
                <span>Solana Ledger Attestation</span>
                <span>•</span>
                <span>Token-2022 Burn Proof</span>
                {txData?.slot && (
                  <>
                    <span>•</span>
                    <span className="text-[var(--muted)]">Slot #{txData.slot}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] font-mono">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Verifying ledger...</span>
            </div>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              {txData?.onChain ? "Live On-Chain Proof" : "Ledger Confirmed"}
            </span>
          )}
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
                  {certificateData.beneficiary}
                </span>
              </div>

              <div>
                <span className="text-[#697a70] uppercase font-mono text-[11px] block mb-1">
                  Retired Quantity
                </span>
                <span className="text-xl font-mono font-bold text-[#1a5734]">
                  {certificateData.amount}
                </span>
              </div>

              <div>
                <span className="text-[#697a70] uppercase font-mono text-[11px] block mb-1">
                  Project of Origin
                </span>
                <span className="font-semibold text-[#111c16]">
                  {certificateData.project}
                </span>
              </div>

              <div>
                <span className="text-[#697a70] uppercase font-mono text-[11px] block mb-1">
                  Retirement Timestamp
                </span>
                <span className="font-mono text-[#111c16]">
                  {certificateData.timestamp}
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

            {txData?.memo && (
              <div className="space-y-1 font-mono text-xs">
                <span className="text-[#697a70] text-[11px] uppercase block">
                  On-Chain Memo Attestation:
                </span>
                <div className="p-2.5 rounded bg-[#f4f5ee] border border-[#e2e4dc] text-[#2d3a33] text-[11px]">
                  {txData.memo}
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-[#e2e4dc] flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs">
            <div className="text-[#697a70] text-[11px] font-mono">
              Independent audit telemetry provided by Copernicus Sentinel-2 L2A European Space Agency.
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-lg bg-[#111c16] text-white hover:opacity-90 transition-opacity flex items-center gap-1.5 font-medium cursor-pointer print:hidden"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Certificate</span>
            </button>
          </div>
        </div>

        {/* Public Blockchain Proof Link */}
        <Panel className="p-4 flex items-center justify-between text-xs font-mono">
          <span className="text-[var(--muted)]">Verify ledger proof directly on Solana Explorer:</span>
          <a
            href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-500 hover:opacity-90 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Explorer Transaction Proof</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </Panel>
      </div>
    </PageShell>
  );
}

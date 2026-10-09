"use client";

import React, { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";

// =====================================================================
// 1. PageHeader
// =====================================================================
interface PageHeaderProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#162922] light:border-slate-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f4f5ef] light:text-slate-900">
          {title}
        </h1>
        <p className="text-sm text-[#8e9f96] light:text-slate-600 mt-1 leading-relaxed max-w-2xl">
          {description}
        </p>
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}

// =====================================================================
// 2. Panel
// =====================================================================
interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "subtle";
}

export function Panel({ children, className = "", variant = "default", ...props }: PanelProps) {
  return (
    <div
      className={`rounded-xl border transition-colors ${
        variant === "default"
          ? "bg-[#0d1714] border-[#162922] light:bg-white light:border-slate-200 light:shadow-sm"
          : "bg-[#07130f] border-[#162922]/80 light:bg-slate-50 light:border-slate-200"
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// =====================================================================
// 3. DataRow
// =====================================================================
interface DataRowProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  className?: string;
}

export function DataRow({ label, value, hint, className = "" }: DataRowProps) {
  return (
    <div className={`flex items-center justify-between py-2.5 border-b border-[#162922]/60 light:border-slate-100 last:border-b-0 text-xs ${className}`}>
      <div className="flex flex-col">
        <span className="text-[#8e9f96] light:text-slate-500 font-normal">{label}</span>
        {hint && <span className="text-[11px] text-[#586860] light:text-slate-400">{hint}</span>}
      </div>
      <div className="text-right text-[#f4f5ef] light:text-slate-900 font-medium">
        {value}
      </div>
    </div>
  );
}

// =====================================================================
// 4. Stat
// =====================================================================
interface StatProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: string;
  isNegative?: boolean;
}

export function Stat({ label, value, subtext, trend, isNegative }: StatProps) {
  return (
    <div className="p-4 rounded-xl bg-[#0d1714] border border-[#162922] light:bg-white light:border-slate-200">
      <div className="text-xs text-[#8e9f96] light:text-slate-500 font-normal">{label}</div>
      <div className="text-xl sm:text-2xl font-bold font-mono text-[#f4f5ef] light:text-slate-900 mt-1">
        {value}
      </div>
      {(subtext || trend) && (
        <div className="flex items-center gap-1.5 mt-1 text-xs">
          {trend && (
            <span className={`font-mono ${isNegative ? "text-red-400" : "text-[#38b87c]"}`}>
              {trend}
            </span>
          )}
          {subtext && <span className="text-[#718078] light:text-slate-400">{subtext}</span>}
        </div>
      )}
    </div>
  );
}

// =====================================================================
// 5. StatusBadge (Verified / Warning / Blocked / Pending)
// =====================================================================
export type StatusType = "verified" | "active" | "warning" | "blocked" | "revoked" | "suspended" | "pending";

interface StatusBadgeProps {
  status: StatusType | string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const norm = status.toLowerCase();

  let styles = "bg-[#162922] text-[#8e9f96] border-[#22392f]";
  let label = status;
  let dotColor = "bg-[#718078]";

  if (norm === "verified" || norm === "active") {
    styles = "bg-[#0d2218] text-[#38b87c] border-[#1a4430] light:bg-emerald-50 light:text-emerald-700 light:border-emerald-200";
    label = norm === "active" ? "Active" : "Verified";
    dotColor = "bg-[#38b87c]";
  } else if (norm === "warning") {
    styles = "bg-[#261f0d] text-amber-400 border-[#473715] light:bg-amber-50 light:text-amber-700 light:border-amber-200";
    label = "Warning";
    dotColor = "bg-amber-400";
  } else if (norm === "blocked" || norm === "revoked" || norm === "suspended") {
    styles = "bg-[#291313] text-red-400 border-[#4d1f1f] light:bg-red-50 light:text-red-700 light:border-red-200";
    label = norm === "blocked" ? "Transfer Blocked" : norm === "suspended" ? "Suspended" : "Revoked";
    dotColor = "bg-red-400";
  } else if (norm === "pending") {
    styles = "bg-[#1f2421] text-[#a8c7b5] border-[#2d3a33] light:bg-slate-100 light:text-slate-600 light:border-slate-200";
    label = "Pending Audit";
    dotColor = "bg-[#a8c7b5]";
  }

  const padding = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded font-mono font-medium border ${padding} ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{label}</span>
    </span>
  );
}

// =====================================================================
// 6. GradeBadge (AAA to C)
// =====================================================================
interface GradeBadgeProps {
  grade: "AAA" | "AA" | "A" | "B" | "C" | string;
  score?: number;
}

export function GradeBadge({ grade, score }: GradeBadgeProps) {
  let color = "bg-[#1a3325] text-[#38b87c] border-[#224d35]";
  if (grade === "AAA") color = "bg-[#0d2619] text-[#38b87c] border-[#184a2f]";
  else if (grade === "AA") color = "bg-[#102a1d] text-[#34d399] border-[#1b5238]";
  else if (grade === "A") color = "bg-[#1c3024] text-[#6ee7b7] border-[#2a4d3a]";
  else if (grade === "B") color = "bg-[#2b2413] text-amber-400 border-[#4d3e1d]";
  else if (grade === "C") color = "bg-[#2b1313] text-red-400 border-[#521e1e]";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold border ${color}`}
      title={score ? `Score: ${score}/100` : undefined}
    >
      <span>{grade}</span>
      {score !== undefined && <span className="opacity-70 font-normal">({score})</span>}
    </span>
  );
}

// =====================================================================
// 7. AddressChip (Truncate + Copy + Solana Explorer Link)
// =====================================================================
interface AddressChipProps {
  address: string;
  cluster?: string;
  truncateLen?: number;
  className?: string;
}

export function AddressChip({ address, cluster = "devnet", truncateLen = 4, className = "" }: AddressChipProps) {
  const [copied, setCopied] = useState(false);

  const display =
    address.length > truncateLen * 2 + 3
      ? `${address.slice(0, truncateLen)}...${address.slice(-truncateLen)}`
      : address;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const explorerUrl = `https://explorer.solana.com/address/${address}?cluster=${cluster}`;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#07130f] border border-[#162922] light:bg-slate-100 light:border-slate-200 text-xs font-mono text-[#a8c7b5] light:text-slate-700 ${className}`}>
      <span title={address} className="select-all">
        {display}
      </span>
      <button
        onClick={handleCopy}
        className="p-0.5 hover:text-white transition-colors cursor-pointer"
        title="Copy address"
        aria-label="Copy address"
      >
        {copied ? <Check className="w-3 h-3 text-[#38b87c]" /> : <Copy className="w-3 h-3 text-[#718078] hover:text-[#a8c7b5]" />}
      </button>
      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-0.5 text-[#718078] hover:text-[#38b87c] transition-colors"
        title="View on Solana Explorer"
        aria-label="View on Solana Explorer"
      >
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}

// =====================================================================
// 8. Skeleton
// =====================================================================
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-[#162922]/60 light:bg-slate-200 rounded ${className}`}
      aria-hidden="true"
    />
  );
}

// =====================================================================
// 9. EmptyState
// =====================================================================
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="p-12 text-center flex flex-col items-center justify-center rounded-xl border border-dashed border-[#162922] light:border-slate-300">
      {icon && <div className="text-[#718078] light:text-slate-400 mb-3">{icon}</div>}
      <h3 className="text-base font-semibold text-[#f4f5ef] light:text-slate-800 mb-1">{title}</h3>
      <p className="text-xs text-[#8e9f96] light:text-slate-500 max-w-sm leading-relaxed mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

// =====================================================================
// 10. Stepper
// =====================================================================
interface StepperProps {
  steps: { id: number; title: string; subtitle?: string }[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <div className="flex items-center justify-between w-full mb-8">
      {steps.map((step, idx) => {
        const isDone = currentStep > step.id;
        const isCurrent = currentStep === step.id;

        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => onStepClick && onStepClick(step.id)}
              disabled={!onStepClick || (!isDone && !isCurrent)}
              className={`flex items-center gap-3 text-left focus:outline-none transition-colors ${
                onStepClick && isDone ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                  isDone
                    ? "bg-[#38b87c] text-[#07130f]"
                    : isCurrent
                    ? "bg-[#11271f] text-[#38b87c] border border-[#38b87c]"
                    : "bg-[#0d1714] text-[#718078] border border-[#162922]"
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.id}
              </div>
              <div className="hidden sm:flex flex-col">
                <span
                  className={`text-xs font-semibold ${
                    isCurrent ? "text-[#f4f5ef] light:text-slate-900" : isDone ? "text-[#a8c7b5] light:text-slate-700" : "text-[#718078] light:text-slate-400"
                  }`}
                >
                  {step.title}
                </span>
                {step.subtitle && (
                  <span className="text-[10px] text-[#5c6e64] light:text-slate-400">{step.subtitle}</span>
                )}
              </div>
            </button>

            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-[1px] mx-3 transition-colors ${
                  currentStep > step.id ? "bg-[#38b87c]/60" : "bg-[#162922] light:bg-slate-200"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// =====================================================================
// 11. SegmentedControl
// =====================================================================
interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string; icon?: React.ReactNode }[];
  value: T;
  onChange: (val: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = "",
}: SegmentedControlProps<T>) {
  return (
    <div
      className={`inline-flex p-1 rounded-lg bg-[#07130f] border border-[#162922] light:bg-slate-100 light:border-slate-200 ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              active
                ? "bg-[#162922] text-[#f4f5ef] shadow-sm light:bg-white light:text-slate-900 light:shadow"
                : "text-[#8e9f96] hover:text-[#f4f5ef] light:text-slate-500 light:hover:text-slate-900"
            }`}
          >
            {opt.icon && <span className="w-3.5 h-3.5">{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

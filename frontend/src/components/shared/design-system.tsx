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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed max-w-2xl font-normal">
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
  title?: string;
}

export function Panel({ children, className = "", variant = "default", title, ...props }: PanelProps) {
  return (
    <div
      className={`rounded-xl border transition-colors ${
        variant === "default"
          ? "bg-white border-slate-200/90 shadow-xs text-slate-900"
          : "bg-slate-50 border-slate-200 text-slate-900"
      } ${className}`}
      {...props}
    >
      {title && (
        <div className="px-5 py-3.5 border-b border-slate-100 font-semibold text-sm text-slate-900">
          {title}
        </div>
      )}
      <div className={title ? "p-5" : ""}>
        {children}
      </div>
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
    <div className={`flex items-center justify-between py-2.5 border-b border-slate-100 last:border-b-0 text-xs ${className}`}>
      <div className="flex flex-col">
        <span className="text-slate-500 font-normal">{label}</span>
        {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
      </div>
      <div className="text-right text-slate-900 font-medium">
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
    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
      <div className="text-xs text-slate-500 font-normal">{label}</div>
      <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1">
        {value}
      </div>
      {(subtext || trend) && (
        <div className="flex items-center gap-1.5 mt-1 text-xs">
          {trend && (
            <span className={`font-mono font-medium ${isNegative ? "text-rose-600" : "text-emerald-700"}`}>
              {trend}
            </span>
          )}
          {subtext && <span className="text-slate-500">{subtext}</span>}
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

  let styles = "bg-slate-100 text-slate-700 border-slate-200";
  let label = status;
  let dotColor = "bg-slate-400";

  if (norm === "verified" || norm === "active") {
    styles = "bg-emerald-50 text-emerald-800 border-emerald-200 font-medium";
    label = norm === "active" ? "Active" : "Verified";
    dotColor = "bg-emerald-600";
  } else if (norm === "warning") {
    styles = "bg-amber-50 text-amber-800 border-amber-200 font-medium";
    label = "Warning";
    dotColor = "bg-amber-600";
  } else if (norm === "blocked" || norm === "revoked" || norm === "suspended") {
    styles = "bg-rose-50 text-rose-800 border-rose-200 font-medium";
    label = norm === "blocked" ? "Transfer Blocked" : norm === "suspended" ? "Suspended" : "Revoked";
    dotColor = "bg-rose-600";
  } else if (norm === "pending") {
    styles = "bg-slate-100 text-slate-700 border-slate-200 font-medium";
    label = "Pending Audit";
    dotColor = "bg-slate-500";
  }

  const padding = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded font-mono border ${padding} ${styles}`}>
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
  let color = "bg-emerald-50 text-emerald-800 border-emerald-200";
  if (grade === "AAA") color = "bg-emerald-50 text-emerald-800 border-emerald-300";
  else if (grade === "AA") color = "bg-teal-50 text-teal-800 border-teal-300";
  else if (grade === "A") color = "bg-blue-50 text-blue-800 border-blue-300";
  else if (grade === "B") color = "bg-amber-50 text-amber-800 border-amber-300";
  else if (grade === "C") color = "bg-rose-50 text-rose-800 border-rose-300";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold border ${color}`}
      title={score ? `Score: ${score}/100` : undefined}
    >
      <span>{grade}</span>
      {score !== undefined && <span className="opacity-75 font-normal">({score})</span>}
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
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 hover:bg-slate-200/60 transition-colors ${className}`}>
      <span title={address} className="select-all">
        {display}
      </span>
      <button
        onClick={handleCopy}
        className="p-0.5 hover:text-slate-950 transition-colors cursor-pointer"
        title="Copy address"
        aria-label="Copy address"
      >
        {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400 hover:text-slate-600" />}
      </button>
      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-0.5 text-slate-400 hover:text-emerald-700 transition-colors"
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
      className={`animate-pulse bg-slate-200 rounded ${className}`}
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
    <div className="p-12 text-center flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white">
      {icon && <div className="text-slate-400 mb-3">{icon}</div>}
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm leading-relaxed mb-4">{description}</p>
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
                    ? "bg-emerald-600 text-white"
                    : isCurrent
                    ? "bg-emerald-50 text-emerald-800 border-2 border-emerald-600"
                    : "bg-slate-100 text-slate-400 border border-slate-300"
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.id}
              </div>
              <div className="hidden sm:flex flex-col">
                <span
                  className={`text-xs font-semibold ${
                    isCurrent ? "text-slate-900 font-bold" : isDone ? "text-slate-700" : "text-slate-400"
                  }`}
                >
                  {step.title}
                </span>
                {step.subtitle && (
                  <span className="text-[10px] text-slate-500">{step.subtitle}</span>
                )}
              </div>
            </button>

            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-[2px] mx-3 transition-colors ${
                  currentStep > step.id ? "bg-emerald-500" : "bg-slate-200"
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
      className={`inline-flex p-1 rounded-lg bg-slate-100 border border-slate-200 ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              active
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
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

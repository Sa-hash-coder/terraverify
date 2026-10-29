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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-[var(--border)]">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text)]">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 leading-relaxed max-w-2xl font-normal">
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
  variant?: "default" | "subtle" | "raised";
  title?: string;
}

export function Panel({ children, className = "", variant = "default", title, ...props }: PanelProps) {
  const bgClass =
    variant === "raised"
      ? "bg-[var(--surface-raised)] border-[var(--border-subtle)]"
      : variant === "subtle"
      ? "bg-[var(--surface-raised)]/70 border-[var(--border-subtle)]"
      : "bg-white border-[var(--border)] shadow-xs";

  return (
    <div
      className={`rounded-2xl border ${bgClass} text-[var(--text)] transition-colors ${className}`}
      {...props}
    >
      {title && (
        <div className="px-5 py-3.5 border-b border-[var(--border-subtle)] font-bold text-xs tracking-wider uppercase text-[var(--text)]">
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
    <div className={`flex items-center justify-between py-2.5 border-b border-[var(--border-subtle)] last:border-b-0 text-xs ${className}`}>
      <div className="flex flex-col">
        <span className="text-[var(--text-muted)] font-medium">{label}</span>
        {hint && <span className="text-[10px] text-[var(--text-muted)]/80 mt-0.5">{hint}</span>}
      </div>
      <div className="text-right text-[var(--text)] font-semibold">
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
    <div className="p-4 rounded-2xl bg-white border border-[var(--border)] shadow-xs">
      <div className="text-xs text-[var(--text-muted)] font-medium">{label}</div>
      <div className="text-xl sm:text-2xl font-bold font-mono text-[var(--text)] mt-1.5">
        {value}
      </div>
      {(subtext || trend) && (
        <div className="flex items-center gap-1.5 mt-1.5 text-[11px]">
          {trend && (
            <span className={`font-mono font-bold ${isNegative ? "text-[#c92a2a]" : "text-[#1e6b3b]"}`}>
              {trend}
            </span>
          )}
          {subtext && <span className="text-[var(--text-muted)]">{subtext}</span>}
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

  let styles = "bg-[#f0f4ee] text-[#5c7366] border-[#dbe3d8]";
  let label = status;
  let dotColor = "bg-[#5c7366]";

  if (norm === "verified" || norm === "active") {
    styles = "bg-[#e6f4ea] text-[#1e6b3b] border-[#cbe4d2] font-semibold";
    label = norm === "active" ? "Active" : "Verified";
    dotColor = "bg-[#2d6a4f]";
  } else if (norm === "warning") {
    styles = "bg-[#fef3c7] text-[#92400e] border-[#fde68a] font-semibold";
    label = "Warning";
    dotColor = "bg-[#b45309]";
  } else if (norm === "blocked" || norm === "revoked" || norm === "suspended") {
    styles = "bg-[#fce8e8] text-[#c92a2a] border-[#f5c2c2] font-semibold";
    label = norm === "blocked" ? "Transfer Blocked" : norm === "suspended" ? "Suspended" : "Revoked";
    dotColor = "bg-[#c92a2a]";
  } else if (norm === "pending") {
    styles = "bg-[#f0f4ee] text-[#5c7366] border-[#dbe3d8] font-medium";
    label = "Pending Audit";
    dotColor = "bg-[#5c7366]";
  }

  const padding = size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md font-mono border ${padding} ${styles}`}>
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
  let color = "bg-[#f0f4ee] text-[#111e16] border-[#dbe3d8]";
  if (grade === "AAA" || grade === "AA") {
    color = "bg-[#e6f4ea] text-[#1e6b3b] border-[#cbe4d2]";
  } else if (grade === "A") {
    color = "bg-[#e6f4ea]/80 text-[#1e6b3b] border-[#cbe4d2]";
  } else if (grade === "B") {
    color = "bg-[#fef3c7] text-[#92400e] border-[#fde68a]";
  } else if (grade === "C") {
    color = "bg-[#fce8e8] text-[#c92a2a] border-[#f5c2c2]";
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-mono font-bold border ${color}`}
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
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f0f4ee] border border-[#e1e8de] text-xs font-mono text-[#111e16] hover:border-[#2d6a4f] transition-colors ${className}`}>
      <span title={address} className="select-all font-medium">
        {display}
      </span>
      <button
        onClick={handleCopy}
        className="p-0.5 text-[#5c7366] hover:text-[#111e16] transition-colors cursor-pointer"
        title="Copy address"
        aria-label="Copy address"
      >
        {copied ? <Check className="w-3 h-3 text-[#2d6a4f]" /> : <Copy className="w-3 h-3" />}
      </button>
      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-0.5 text-[#5c7366] hover:text-[#2d6a4f] transition-colors"
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
      className={`animate-pulse bg-[#f0f4ee] rounded-md ${className}`}
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
    <div className="p-8 text-center flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#dbe3d8] bg-white text-[#111e16]">
      {icon && <div className="text-[#5c7366] mb-2.5">{icon}</div>}
      <h3 className="text-sm font-bold text-[#111e16] mb-1">{title}</h3>
      <p className="text-xs text-[#5c7366] max-w-xs leading-relaxed mb-4">{description}</p>
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
    <div className="flex items-center justify-between w-full mb-6">
      {steps.map((step, idx) => {
        const isDone = currentStep > step.id;
        const isCurrent = currentStep === step.id;

        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => onStepClick && onStepClick(step.id)}
              disabled={!onStepClick || (!isDone && !isCurrent)}
              className={`flex items-center gap-2.5 text-left focus:outline-none transition-colors ${
                onStepClick && isDone ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                  isDone
                    ? "bg-[#2d6a4f] text-white shadow-xs"
                    : isCurrent
                    ? "bg-[#e6f4ea] text-[#1e6b3b] border-2 border-[#2d6a4f] shadow-xs"
                    : "bg-[#f0f4ee] text-[#5c7366] border border-[#dbe3d8]"
                }`}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[2.5]" /> : step.id}
              </div>
              <div className="hidden sm:flex flex-col">
                <span
                  className={`text-xs font-semibold ${
                    isCurrent ? "text-[#111e16] font-bold" : isDone ? "text-[#111e16]" : "text-[#5c7366]"
                  }`}
                >
                  {step.title}
                </span>
                {step.subtitle && (
                  <span className="text-[10px] text-[#5c7366]">{step.subtitle}</span>
                )}
              </div>
            </button>

            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-[2px] mx-2 transition-colors ${
                  currentStep > step.id ? "bg-[#2d6a4f]" : "bg-[#dbe3d8]"
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
      className={`inline-flex p-1 rounded-xl bg-[#e6ebe3] border border-[#d6ded2] shadow-2xs ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              active
                ? "bg-[#2d6a4f] text-white shadow-xs font-bold"
                : "text-[#5c7366] hover:text-[#111e16] hover:bg-white/60"
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

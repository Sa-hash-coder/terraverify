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
      ? "bg-[var(--surface-raised)]"
      : variant === "subtle"
      ? "bg-[var(--surface-raised)]/60"
      : "bg-[var(--surface)]";

  return (
    <div
      className={`rounded-xl border border-[var(--border)] ${bgClass} text-[var(--text)] transition-colors ${className}`}
      {...props}
    >
      {title && (
        <div className="px-4 py-3 border-b border-[var(--border-subtle)] font-semibold text-xs tracking-wide text-[var(--text)]">
          {title}
        </div>
      )}
      <div className={title ? "p-4" : ""}>
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
    <div className={`flex items-center justify-between py-2 border-b border-[var(--border-subtle)] last:border-b-0 text-xs ${className}`}>
      <div className="flex flex-col">
        <span className="text-[var(--text-muted)] font-normal">{label}</span>
        {hint && <span className="text-[10px] text-[var(--text-muted)]/70">{hint}</span>}
      </div>
      <div className="text-right text-[var(--text)] font-medium">
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
    <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
      <div className="text-xs text-[var(--text-muted)] font-normal">{label}</div>
      <div className="text-lg sm:text-xl font-bold font-mono text-[var(--text)] mt-1">
        {value}
      </div>
      {(subtext || trend) && (
        <div className="flex items-center gap-1.5 mt-1 text-[11px]">
          {trend && (
            <span className={`font-mono font-medium ${isNegative ? "text-[var(--danger)]" : "text-[var(--accent)]"}`}>
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

  let styles = "bg-[var(--surface-raised)] text-[var(--text-muted)] border-[var(--border)]";
  let label = status;
  let dotColor = "bg-[var(--text-muted)]";

  if (norm === "verified" || norm === "active") {
    styles = "bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent)]/30 font-medium";
    label = norm === "active" ? "Active" : "Verified";
    dotColor = "bg-[var(--accent)]";
  } else if (norm === "warning") {
    styles = "bg-[var(--warning-subtle)] text-[var(--warning)] border-[var(--warning)]/30 font-medium";
    label = "Warning";
    dotColor = "bg-[var(--warning)]";
  } else if (norm === "blocked" || norm === "revoked" || norm === "suspended") {
    styles = "bg-[var(--danger-subtle)] text-[var(--danger)] border-[var(--danger)]/30 font-medium";
    label = norm === "blocked" ? "Transfer Blocked" : norm === "suspended" ? "Suspended" : "Revoked";
    dotColor = "bg-[var(--danger)]";
  } else if (norm === "pending") {
    styles = "bg-[var(--surface-overlay)] text-[var(--text-muted)] border-[var(--border)] font-medium";
    label = "Pending Audit";
    dotColor = "bg-[var(--text-muted)]";
  }

  const padding = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

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
  let color = "bg-[var(--surface-raised)] text-[var(--text)] border-[var(--border)]";
  if (grade === "AAA" || grade === "AA") {
    color = "bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent)]/30";
  } else if (grade === "A") {
    color = "bg-[var(--accent-subtle)]/70 text-[var(--accent)] border-[var(--accent)]/20";
  } else if (grade === "B") {
    color = "bg-[var(--warning-subtle)] text-[var(--warning)] border-[var(--warning)]/30";
  } else if (grade === "C") {
    color = "bg-[var(--danger-subtle)] text-[var(--danger)] border-[var(--danger)]/30";
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-bold border ${color}`}
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
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--surface-raised)] border border-[var(--border)] text-xs font-mono text-[var(--text)] hover:border-[var(--border-hover)] transition-colors ${className}`}>
      <span title={address} className="select-all">
        {display}
      </span>
      <button
        onClick={handleCopy}
        className="p-0.5 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
        title="Copy address"
        aria-label="Copy address"
      >
        {copied ? <Check className="w-3 h-3 text-[var(--accent)]" /> : <Copy className="w-3 h-3" />}
      </button>
      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-0.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
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
      className={`animate-pulse bg-[var(--surface-raised)] rounded-md ${className}`}
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
    <div className="p-8 text-center flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] text-[var(--text)]">
      {icon && <div className="text-[var(--text-muted)] mb-2.5">{icon}</div>}
      <h3 className="text-sm font-semibold text-[var(--text)] mb-1">{title}</h3>
      <p className="text-xs text-[var(--text-muted)] max-w-xs leading-relaxed mb-3">{description}</p>
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
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                  isDone
                    ? "bg-[var(--accent)] text-[var(--bg-app)]"
                    : isCurrent
                    ? "bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]"
                    : "bg-[var(--surface-raised)] text-[var(--text-muted)] border border-[var(--border)]"
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.id}
              </div>
              <div className="hidden sm:flex flex-col">
                <span
                  className={`text-xs font-medium ${
                    isCurrent ? "text-[var(--text)] font-semibold" : isDone ? "text-[var(--text)]" : "text-[var(--text-muted)]"
                  }`}
                >
                  {step.title}
                </span>
                {step.subtitle && (
                  <span className="text-[10px] text-[var(--text-muted)]">{step.subtitle}</span>
                )}
              </div>
            </button>

            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-[1px] mx-2 transition-colors ${
                  currentStep > step.id ? "bg-[var(--accent)]" : "bg-[var(--border)]"
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
      className={`inline-flex p-1 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
              active
                ? "bg-[var(--surface-overlay)] text-[var(--text)] shadow-xs font-semibold border border-[var(--border)]"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
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

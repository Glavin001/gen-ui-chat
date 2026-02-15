"use client";

import React from "react";
import { useRequestFix } from "./ErrorContext";

// ─── Types ───────────────────────────────────────────────────────────

export interface ComponentErrorProps {
  /** Component name (e.g. "PieChart", "DataTable") */
  component: string;
  /** Short error category (e.g. "data format error", "missing content") */
  errorType: string;
  /** Human-readable description of the issue */
  message: React.ReactNode;
  /** "warning" = amber (recoverable/data issues), "error" = red (crash/fatal) */
  severity?: "warning" | "error";
  /** Optional structured diagnostic data shown in a collapsible pre block */
  diagnostics?: Record<string, unknown>;
  /** Optional error stack trace (for error boundaries) */
  stack?: string;
  /** Optional minimum height for the container (useful for chart placeholders) */
  minHeight?: number;
}

// ─── Color maps ──────────────────────────────────────────────────────

const colorMap = {
  warning: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    text: "text-amber-300",
    muted: "text-amber-400/70",
    dimmed: "text-amber-400/50",
    code: "bg-amber-500/10",
    btn: "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300",
  },
  error: {
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    text: "text-red-300",
    muted: "text-red-400/70",
    dimmed: "text-red-400/40",
    code: "bg-red-500/10",
    btn: "bg-red-500/20 hover:bg-red-500/30 text-red-300",
  },
};

// ─── Component ───────────────────────────────────────────────────────

/**
 * Standardized error banner for all catalog components.
 *
 * Features:
 * - Consistent styling (amber for warnings, red for errors)
 * - "Send to AI" button when rendered inside a chat message context
 * - Optional diagnostics dump and stack trace
 * - Configurable minimum height for chart placeholder use
 */
export function ComponentError({
  component,
  errorType,
  message,
  severity = "warning",
  diagnostics,
  stack,
  minHeight,
}: ComponentErrorProps) {
  const requestFix = useRequestFix();
  const c = colorMap[severity];

  const handleSendToAI = () => {
    if (!requestFix) return;

    let text = `[Component Error] ${component}: ${errorType}\n`;
    text += typeof message === "string" ? message : `Error in ${component}`;
    if (diagnostics) {
      text += `\n\nDiagnostics:\n${JSON.stringify(diagnostics, null, 2)}`;
    }
    if (stack) {
      text += `\n\nStack trace:\n${stack}`;
    }
    text +=
      "\n\nPlease fix the UI spec to resolve this error. Check the $state path, transform, or prop values.";

    requestFix(text);
  };

  return (
    <div
      className={`rounded-xl border ${c.border} ${c.bg} p-4 text-xs ${c.text}`}
      style={minHeight ? { minHeight } : undefined}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium mb-1">
          {component}: {errorType}
        </p>
        {requestFix && (
          <button
            type="button"
            onClick={handleSendToAI}
            className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${c.btn}`}
          >
            Send to AI
          </button>
        )}
      </div>

      {/* Description */}
      <div className={c.muted}>{message}</div>

      {/* Diagnostics */}
      {diagnostics && (
        <pre
          className={`mt-2 text-[10px] ${c.dimmed} overflow-auto max-h-24`}
        >
          {JSON.stringify(diagnostics, null, 2)}
        </pre>
      )}

      {/* Stack trace */}
      {stack && (
        <pre
          className={`mt-2 text-[10px] ${c.dimmed} overflow-auto max-h-24`}
        >
          {stack}
        </pre>
      )}
    </div>
  );
}

// ─── Convenience helpers ─────────────────────────────────────────────

/** Styled inline code snippet matching the error severity */
export function ErrorCode({
  children,
  severity = "warning",
}: {
  children: React.ReactNode;
  severity?: "warning" | "error";
}) {
  const bg = severity === "error" ? "bg-red-500/10" : "bg-amber-500/10";
  return <code className={`${bg} px-1 rounded`}>{children}</code>;
}

"use client";

import React, { useMemo, useState, useCallback } from "react";
import {
  Renderer,
  JSONUIProvider,
  useJsonRenderMessage,
  getTextFromParts,
  type DataPart,
  type Spec,
} from "@json-render/react";
import { registry } from "@/lib/registry";
import { ToolCallIndicator } from "./ToolCallIndicator";
import { cn } from "@/lib/cn";
import type { ViewMode } from "./ViewModeToggle";

interface Part {
  type: string;
  text?: string;
  data?: unknown;
  toolInvocation?: {
    toolName: string;
    args?: Record<string, unknown>;
    state: string;
  };
  [key: string]: unknown;
}

export interface ChatMessageProps {
  role: "user" | "assistant";
  parts: Part[];
  isStreaming?: boolean;
  viewMode?: ViewMode;
}

export function ChatMessage({
  role,
  parts,
  isStreaming,
  viewMode = "preview",
}: ChatMessageProps) {
  // Use json-render's hook to extract specs from parts (handles "data-spec" parts)
  const jsonRenderResult = useJsonRenderMessage(parts as DataPart[]);

  // Extract plain text from parts for display
  const textContent = useMemo(() => getTextFromParts(parts as DataPart[]), [parts]);

  const { spec, hasSpec } = jsonRenderResult;
  const text = jsonRenderResult.text || textContent;

  // Extract tool invocation state from parts
  const activeToolCalls = parts.filter(
    (p) =>
      (p.type === "tool-invocation" || p.type === "tool-call") &&
      (p.toolInvocation?.state === "call" || p.toolInvocation?.state === "partial-call")
  );

  // For user messages, extract text from parts
  if (role === "user") {
    const userText = parts
      .filter((p) => p.type === "text")
      .map((p) => p.text ?? "")
      .join("\n");

    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-indigo-600 px-4 py-2.5 text-sm text-white whitespace-pre-wrap">
          {userText}
        </div>
      </div>
    );
  }

  // For assistant messages
  const hasText = !!(text && text.trim().length > 0);
  const showPreview = viewMode === "preview" || viewMode === "split";
  const showRaw = viewMode === "raw" || viewMode === "split";

  return (
    <div className="flex justify-start">
      <div
        className={cn(
          "space-y-3 w-full",
          viewMode === "split" ? "max-w-full" : !hasSpec ? "max-w-[80%]" : "max-w-[90%]"
        )}
      >
        {viewMode === "split" ? (
          /* ─── Split View ─── */
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-3">
              <SplitLabel label="Preview" />
              <PreviewContent
                text={text}
                hasText={hasText}
                hasSpec={hasSpec}
                spec={spec}
                isStreaming={isStreaming}
                activeToolCalls={activeToolCalls}
              />
            </div>
            <div className="space-y-3">
              <SplitLabel label="Raw" />
              <RawContent parts={parts} />
            </div>
          </div>
        ) : showRaw ? (
          /* ─── Raw-only View ─── */
          <RawContent parts={parts} />
        ) : (
          /* ─── Preview-only View (default) ─── */
          <PreviewContent
            text={text}
            hasText={hasText}
            hasSpec={hasSpec}
            spec={spec}
            isStreaming={isStreaming}
            activeToolCalls={activeToolCalls}
          />
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
 * Sub-components
 * ──────────────────────────────────────────────────────────────────── */

function SplitLabel({ label }: { label: string }) {
  return (
    <span className="inline-block text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
      {label}
    </span>
  );
}

/** The rendered preview — extracted from the original ChatMessage body */
function PreviewContent({
  text,
  hasText,
  hasSpec,
  spec,
  isStreaming,
  activeToolCalls,
}: {
  text: string | undefined;
  hasText: boolean;
  hasSpec: boolean;
  spec: Spec | null;
  isStreaming?: boolean;
  activeToolCalls: Part[];
}) {
  return (
    <>
      {/* Text content */}
      {hasText && (
        <div className="rounded-2xl rounded-bl-md bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
          {text}
          {isStreaming && !hasSpec && (
            <span className="inline-block w-1.5 h-4 bg-indigo-500 ml-0.5 animate-pulse rounded-sm" />
          )}
        </div>
      )}

      {/* Active tool calls */}
      {activeToolCalls.map((part, i) => (
        <ToolCallIndicator
          key={i}
          toolName={part.toolInvocation?.toolName ?? "unknown"}
          args={part.toolInvocation?.args}
        />
      ))}

      {/* Rendered UI spec */}
      {hasSpec && spec && (
        <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-4 overflow-hidden">
          <ErrorBoundary>
            <JSONUIProvider registry={registry}>
              <Renderer
                spec={spec!}
                registry={registry}
                loading={isStreaming}
                fallback={({ element }) => (
                  <div className="rounded-lg bg-zinc-800/50 p-3 text-xs text-zinc-500">
                    Unknown component: {element.type}
                  </div>
                )}
              />
            </JSONUIProvider>
          </ErrorBoundary>
        </div>
      )}

      {/* Loading indicator when no content yet */}
      {!hasText &&
        !hasSpec &&
        activeToolCalls.length === 0 &&
        isStreaming && (
          <div className="rounded-2xl rounded-bl-md bg-zinc-900 border border-zinc-800 px-4 py-3">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-600 animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 rounded-full bg-zinc-600 animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 rounded-full bg-zinc-600 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
    </>
  );
}

/** Raw debug view — shows each part with type labels and formatted data */
function RawContent({ parts }: { parts: Part[] }) {
  const [expandedParts, setExpandedParts] = useState<Set<number>>(new Set());

  const togglePart = useCallback((index: number) => {
    setExpandedParts((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  if (parts.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-xs text-zinc-600 italic">
        No parts
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden divide-y divide-zinc-800/50">
      {parts.map((part, i) => (
        <RawPart
          key={i}
          index={i}
          part={part}
          isExpanded={expandedParts.has(i)}
          onToggle={togglePart}
        />
      ))}
    </div>
  );
}

/** A single part in the raw debug view */
function RawPart({
  index,
  part,
  isExpanded,
  onToggle,
}: {
  index: number;
  part: Part;
  isExpanded: boolean;
  onToggle: (index: number) => void;
}) {
  const partType = part.type;
  const typeColor = getPartTypeColor(partType);

  // Determine the quick summary
  const summary = getPartSummary(part);

  // Get the full content for expansion
  const fullContent = getPartFullContent(part);
  const hasExpandableContent = fullContent !== null;

  return (
    <div className="group">
      <button
        className="flex items-start gap-2 w-full px-3 py-2 text-left hover:bg-zinc-800/30 transition-colors"
        onClick={() => hasExpandableContent && onToggle(index)}
        disabled={!hasExpandableContent}
      >
        {/* Part index */}
        <span className="text-[10px] font-mono text-zinc-700 tabular-nums pt-0.5 shrink-0 w-4 text-right">
          {index}
        </span>

        {/* Type badge */}
        <span
          className={cn(
            "shrink-0 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
            typeColor
          )}
        >
          {partType}
        </span>

        {/* Summary */}
        <span className="text-xs text-zinc-400 truncate flex-1 pt-0.5 font-mono">
          {summary}
        </span>

        {/* Expand indicator */}
        {hasExpandableContent && (
          <span className="text-zinc-600 text-xs shrink-0 pt-0.5">
            {isExpanded ? "▾" : "▸"}
          </span>
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && fullContent && (
        <div className="px-3 pb-2 pl-10">
          <pre className="text-[11px] font-mono text-zinc-500 leading-relaxed whitespace-pre-wrap break-all bg-zinc-950/50 rounded-lg p-3 border border-zinc-800/50 max-h-96 overflow-auto">
            {fullContent}
          </pre>
        </div>
      )}
    </div>
  );
}

/** Color coding for different part types */
function getPartTypeColor(type: string): string {
  switch (type) {
    case "text":
      return "bg-blue-500/15 text-blue-400";
    case "data-spec":
      return "bg-purple-500/15 text-purple-400";
    case "tool-invocation":
    case "tool-call":
      return "bg-amber-500/15 text-amber-400";
    case "tool-result":
      return "bg-emerald-500/15 text-emerald-400";
    case "reasoning":
      return "bg-pink-500/15 text-pink-400";
    case "source":
      return "bg-cyan-500/15 text-cyan-400";
    default:
      return "bg-zinc-700/30 text-zinc-400";
  }
}

/** Quick one-line summary of a part */
function getPartSummary(part: Part): string {
  switch (part.type) {
    case "text":
      return truncate(part.text ?? "", 120);
    case "data-spec": {
      const data = part.data;
      if (data && typeof data === "object" && "spec" in (data as Record<string, unknown>)) {
        return "json-render spec";
      }
      if (data && typeof data === "object") {
        return summarizeDataSpec(data as Record<string, unknown>);
      }
      return typeof data === "string" ? truncate(data, 80) : "data object";
    }
    case "tool-invocation":
    case "tool-call": {
      const inv = part.toolInvocation;
      if (inv) {
        return `${inv.toolName}(${JSON.stringify(inv.args ?? {}).slice(0, 80)}) → ${inv.state}`;
      }
      return "tool call";
    }
    case "tool-result":
      return truncate(JSON.stringify(part.data ?? part), 100);
    case "reasoning":
      return truncate(part.text ?? "", 100);
    default:
      return truncate(JSON.stringify(part), 100);
  }
}

/** Produce a concise summary for a data-spec object */
function summarizeDataSpec(data: Record<string, unknown>): string {
  // Handle patch operations: { type: "patch", patch: { op, path, value } }
  if (data.type === "patch" && data.patch && typeof data.patch === "object") {
    const patch = data.patch as Record<string, unknown>;
    const op = patch.op as string | undefined;
    const path = patch.path as string | undefined;
    const value = patch.value;

    if (op && path) {
      const valueSummary = summarizePatchValue(value);
      return valueSummary
        ? `${op} ${path} → ${valueSummary}`
        : `${op} ${path}`;
    }
  }

  // Handle spec-like objects with a "type" field: { type: "Stack", props: {...}, children: [...] }
  if (typeof data.type === "string" && data.type !== "patch") {
    const componentType = data.type;
    const props = data.props as Record<string, unknown> | undefined;
    const propHint = props ? summarizeProps(props) : "";
    return propHint ? `${componentType} ${propHint}` : componentType;
  }

  // Fallback: show top-level keys
  const keys = Object.keys(data);
  if (keys.length <= 4) {
    return `{ ${keys.join(", ")} }`;
  }
  return `{ ${keys.slice(0, 3).join(", ")}, +${keys.length - 3} }`;
}

/** Summarize the value side of a patch operation */
function summarizePatchValue(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return `"${truncate(value, 30)}"`;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return `[${value.length} items]`;
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    // If it's a component-like object with a type, show that
    if (typeof obj.type === "string") {
      const children = obj.children;
      const childHint = Array.isArray(children)
        ? ` (${children.length} children)`
        : "";
      return obj.type + childHint;
    }
    const keys = Object.keys(obj);
    if (keys.length <= 3) return `{ ${keys.join(", ")} }`;
    return `{ ${keys.slice(0, 2).join(", ")}, +${keys.length - 2} }`;
  }
  return "";
}

/** Summarize props into a short hint like "columns=3 gap=medium" */
function summarizeProps(props: Record<string, unknown>): string {
  const entries = Object.entries(props);
  if (entries.length === 0) return "";
  const parts = entries.slice(0, 3).map(([k, v]) => {
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      return `${k}=${v}`;
    }
    return k;
  });
  const suffix = entries.length > 3 ? " …" : "";
  return `(${parts.join(", ")}${suffix})`;
}

/** Full expanded content for a part */
function getPartFullContent(part: Part): string | null {
  switch (part.type) {
    case "text":
      return part.text ?? null;
    case "data-spec":
      return formatJSON(part.data);
    case "tool-invocation":
    case "tool-call":
      return formatJSON({
        toolName: part.toolInvocation?.toolName,
        state: part.toolInvocation?.state,
        args: part.toolInvocation?.args,
        ...(part.toolInvocation as Record<string, unknown>),
      });
    case "tool-result":
      return formatJSON(part.data ?? part);
    default: {
      // For any part, show the whole part object
      const { type: _type, ...rest } = part;
      return Object.keys(rest).length > 0 ? formatJSON(rest) : null;
    }
  }
}

function formatJSON(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function truncate(str: string, max: number): string {
  const oneLine = str.replace(/\n/g, "↵ ");
  if (oneLine.length <= max) return oneLine;
  return oneLine.slice(0, max) + "…";
}

/**
 * Error boundary for rendering UI specs.
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
          Failed to render UI: {this.state.error?.message ?? "Unknown error"}
        </div>
      );
    }
    return this.props.children;
  }
}

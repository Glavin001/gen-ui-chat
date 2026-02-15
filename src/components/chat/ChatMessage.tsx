"use client";

import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
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
import {
  extractToolResults,
  extractTransformDefs,
  computeTransforms,
  buildStateModel,
  resolveSpecState,
  validateResolvedProps,
  type ToolInvocationPart,
  type StateError,
  type ResolutionResult,
} from "@/lib/state-resolver";
import { InProcessSandbox } from "@/lib/reactive-store";
import { ErrorContextProvider } from "@/components/catalog/ErrorContext";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import { cjk } from "@streamdown/cjk";

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
  id: string;
  role: "user" | "assistant";
  parts: Part[];
  isStreaming?: boolean;
  viewMode?: ViewMode;
  /** Callback to send a follow-up message to the AI agent (e.g. error fix request) */
  onRequestFix?: (text: string) => void;
  /** Callback to retry/regenerate a specific message */
  onRetry?: (messageId: string) => void;
  /** Callback to remove a specific message */
  onRemove?: (messageId: string) => void;
}

export function ChatMessage({
  id,
  role,
  parts,
  isStreaming,
  viewMode = "preview",
  onRequestFix,
  onRetry,
  onRemove,
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
      <div className="group/msg flex flex-col items-end gap-1">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-indigo-600 px-4 py-2.5 text-sm text-white whitespace-pre-wrap">
          {userText}
        </div>
        <MessageActions
          messageId={id}
          role="user"
          onRetry={onRetry}
          onRemove={onRemove}
          isStreaming={isStreaming}
        />
      </div>
    );
  }

  // For assistant messages
  const hasText = !!(text && text.trim().length > 0);
  const showPreview = viewMode === "preview" || viewMode === "split";
  const showRaw = viewMode === "raw" || viewMode === "split";

  return (
    <div className="group/msg flex flex-col items-start gap-1">
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
                parts={parts}
                isStreaming={isStreaming}
                activeToolCalls={activeToolCalls}
                onRequestFix={onRequestFix}
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
            parts={parts}
            isStreaming={isStreaming}
            activeToolCalls={activeToolCalls}
            onRequestFix={onRequestFix}
          />
        )}
      </div>
      <MessageActions
        messageId={id}
        role="assistant"
        onRetry={onRetry}
        onRemove={onRemove}
        isStreaming={isStreaming}
      />
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

/** Hover-revealed action buttons for retry and remove */
function MessageActions({
  messageId,
  role,
  onRetry,
  onRemove,
  isStreaming,
}: {
  messageId: string;
  role: "user" | "assistant";
  onRetry?: (messageId: string) => void;
  onRemove?: (messageId: string) => void;
  isStreaming?: boolean;
}) {
  // Don't show actions while streaming
  if (isStreaming) return null;

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover/msg:opacity-100 transition-opacity duration-150">
      {onRetry && (
        <button
          onClick={() => onRetry(messageId)}
          className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          title={role === "user" ? "Retry from here" : "Regenerate response"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="w-3 h-3"
          >
            <path
              fillRule="evenodd"
              d="M13.836 2.477a.75.75 0 0 1 .75.75v3.182a.75.75 0 0 1-.75.75h-3.182a.75.75 0 0 1 0-1.5h1.37l-.84-.841a4.5 4.5 0 0 0-7.08.681.75.75 0 0 1-1.3-.75 6 6 0 0 1 9.44-.908l.84.84V3.227a.75.75 0 0 1 .75-.75Zm-.911 7.5A.75.75 0 0 1 13.199 11a6 6 0 0 1-9.44.908l-.84-.84v1.456a.75.75 0 0 1-1.5 0V9.342a.75.75 0 0 1 .75-.75h3.182a.75.75 0 0 1 0 1.5H3.98l.841.841a4.5 4.5 0 0 0 7.08-.681.75.75 0 0 1 1.025-.274Z"
              clipRule="evenodd"
            />
          </svg>
          <span>{role === "user" ? "Retry" : "Regenerate"}</span>
        </button>
      )}
      {onRemove && (
        <button
          onClick={() => onRemove(messageId)}
          className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
          title="Remove message"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="w-3 h-3"
          >
            <path
              fillRule="evenodd"
              d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5A.75.75 0 0 1 9.95 6Z"
              clipRule="evenodd"
            />
          </svg>
          <span>Remove</span>
        </button>
      )}
    </div>
  );
}

// Singleton sandbox for transform execution (shared across all messages)
const sandbox = new InProcessSandbox();

/**
 * Hook: build a resolved spec by injecting tool results and computing transforms.
 *
 * 1. Extracts tool results from message parts → state at /tools/{toolName}
 * 2. Detects transform definitions in spec state at /state/tx/{key}
 * 3. Runs transforms in sandbox → outputs at /tx/{key}
 * 4. Resolves all { $state: "/path" } refs in element props
 *
 * Returns both the resolved spec and any errors encountered.
 */
/** Max auto-fix attempts per session (prevents infinite error→fix→error loops) */
const MAX_AUTO_FIX_ATTEMPTS = 2;
let _autoFixCount = 0;

/**
 * Compute a cheap fingerprint from parts that captures tool result availability.
 * This changes when: parts count changes, tool results arrive, or tool state transitions.
 * Much cheaper than deep-comparing the entire parts array on every render.
 */
function computePartsFingerprint(parts: Part[]): string {
  let fp = `${parts.length}:`;
  for (const p of parts) {
    if ((p.type === "tool-invocation" || p.type === "tool-call") && p.toolInvocation) {
      const inv = p.toolInvocation as { toolCallId?: string; toolName: string; state: string };
      fp += `${inv.toolCallId ?? inv.toolName}=${inv.state},`;
    } else if (
      p.type.startsWith("tool-") &&
      p.type !== "tool-invocation" &&
      p.type !== "tool-call" &&
      p.type !== "tool-result"
    ) {
      // AI SDK v6 format: type is "tool-{toolName}"
      const v6 = p as unknown as { toolCallId?: string; state?: string };
      fp += `${v6.toolCallId ?? p.type}=${v6.state ?? "?"},`;
    }
  }
  return fp;
}

function useResolvedSpec(
  spec: Spec | null,
  parts: Part[]
): ResolutionResult {
  // Derive a stable fingerprint — same string = same tool results, skip recompute.
  // This avoids re-running the expensive pipeline when the parent re-renders
  // with a new `parts` array reference that has identical content.
  const partsFingerprint = computePartsFingerprint(parts);

  // Stabilize spec reference: useJsonRenderMessage may return a new object on
  // every render even when the spec hasn't structurally changed.
  // We compare via JSON fingerprint and only update the ref when it changes.
  const specFP = JSON.stringify(spec);
  const stableSpecRef = useRef<{ fp: string; spec: Spec | null }>({ fp: "", spec: null });
  if (specFP !== stableSpecRef.current.fp) {
    stableSpecRef.current = { fp: specFP, spec };
  }
  const stableSpec = stableSpecRef.current.spec;

  return useMemo(() => {
    if (!stableSpec) return { spec: null, errors: [] };

    try {
      const allErrors: StateError[] = [];

      // 1. Extract tool results from message parts
      const toolResults = extractToolResults(parts as ToolInvocationPart[]);

      // 2. Extract transform definitions from spec's state tree
      const specState = (stableSpec as unknown as Record<string, unknown>).state as
        | Record<string, unknown>
        | undefined;
      const txDefs = extractTransformDefs(specState);

      // Build initial state model (without transform outputs yet)
      const baseState = buildStateModel(toolResults, specState, {});

      // 3. Compute transforms (may reference tool data via deps)
      const { outputs: txOutputs, errors: txErrors } = computeTransforms(
        txDefs,
        baseState,
        sandbox
      );
      allErrors.push(...txErrors);

      // 4. Build final state model with transform outputs
      const stateModel = buildStateModel(toolResults, specState, txOutputs);

      // 5. Resolve all $state references in the spec
      const { spec: resolvedSpec, errors: refErrors } = resolveSpecState(
        stableSpec,
        stateModel
      );
      allErrors.push(...refErrors);

      // 6. Validate resolved prop types (e.g. data must be array for charts)
      const propTypeErrors = validateResolvedProps(resolvedSpec);
      allErrors.push(...propTypeErrors);

      return { spec: resolvedSpec, errors: allErrors };
    } catch (err) {
      console.error("State resolution error:", err);
      return {
        spec: stableSpec,
        errors: [
          {
            type: "transform-error" as const,
            key: "_pipeline",
            message: `State resolution pipeline failed: ${err instanceof Error ? err.message : String(err)}`,
            detail: err instanceof Error ? err.stack : undefined,
          },
        ],
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- stableSpec+partsFingerprint are stable proxies
  }, [stableSpec, partsFingerprint]);
}

/** The rendered preview — extracted from the original ChatMessage body */
function PreviewContent({
  text,
  hasText,
  hasSpec,
  spec,
  parts,
  isStreaming,
  activeToolCalls,
  onRequestFix,
}: {
  text: string | undefined;
  hasText: boolean;
  hasSpec: boolean;
  spec: Spec | null;
  parts: Part[];
  isStreaming?: boolean;
  activeToolCalls: Part[];
  onRequestFix?: (text: string) => void;
}) {
  // Resolve $state references and compute transforms
  const { spec: resolvedSpec, errors } = useResolvedSpec(spec, parts);

  // Only show errors when not streaming (errors during streaming are transient)
  const visibleErrors = !isStreaming ? errors : [];

  // Auto-fix: when streaming finishes with errors, automatically send them
  // back to the AI for correction (no user action required).
  // Only fires for messages that were actively streaming (not pre-existing on page load).
  // Limited to MAX_AUTO_FIX_ATTEMPTS per session to prevent infinite loops.
  const wasStreamingRef = useRef(false);
  const autoFixSentRef = useRef(false);
  const hasVisibleErrors = visibleErrors.length > 0;
  useEffect(() => {
    if (isStreaming) {
      wasStreamingRef.current = true;
      autoFixSentRef.current = false;
      return;
    }
    if (
      wasStreamingRef.current &&
      hasVisibleErrors &&
      onRequestFix &&
      !autoFixSentRef.current &&
      _autoFixCount < MAX_AUTO_FIX_ATTEMPTS
    ) {
      autoFixSentRef.current = true;
      _autoFixCount++;
      const errorDetails = visibleErrors
        .map((e) => {
          let detail = `- ${e.message}`;
          if (e.type === "transform-error" && e.fn) {
            detail += `\n  Function: ${e.fn}`;
          }
          if (e.deps) {
            detail += `\n  Dependencies: ${e.deps.join(", ")}`;
          }
          return detail;
        })
        .join("\n");

      const message = `There are errors in the generated UI that need to be fixed:\n\n${errorDetails}\n\nPlease fix the transform functions and/or $state references to resolve these errors.`;
      onRequestFix(message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- visibleErrors used in closure but hasVisibleErrors is the stable dep
  }, [isStreaming, hasVisibleErrors, onRequestFix]);

  return (
    <>
      {/* Text content */}
      {hasText && (
        <div className="rounded-2xl rounded-bl-md bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-sm text-zinc-300 leading-relaxed">
          <Streamdown
            animated
            plugins={{ code, math, mermaid, cjk }}
            isAnimating={!!(isStreaming && !hasSpec)}
          >
            {text ?? ""}
          </Streamdown>
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

      {/* State resolution / transform errors */}
      {visibleErrors.length > 0 && (
        <StateErrorsDisplay errors={visibleErrors} onRequestFix={onRequestFix} />
      )}

      {/* Rendered UI spec */}
      {hasSpec && resolvedSpec && (
        <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-4 overflow-hidden">
          <ErrorBoundary>
            <ErrorContextProvider value={onRequestFix ?? null}>
              <JSONUIProvider registry={registry}>
                <Renderer
                  spec={resolvedSpec}
                  registry={registry}
                  loading={isStreaming}
                  fallback={({ element }) => (
                    <div className="rounded-lg bg-zinc-800/50 p-3 text-xs text-zinc-500">
                      Unknown component: {element.type}
                    </div>
                  )}
                />
              </JSONUIProvider>
            </ErrorContextProvider>
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

/* ────────────────────────────────────────────────────────────────────
 * State Error Display
 * ──────────────────────────────────────────────────────────────────── */

/** Inline display of state resolution / transform errors with "Ask AI to fix" */
function StateErrorsDisplay({
  errors,
  onRequestFix,
}: {
  errors: StateError[];
  onRequestFix?: (text: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const handleAskFix = useCallback(() => {
    if (!onRequestFix) return;

    // Build a detailed error message for the AI
    const errorDetails = errors
      .map((e) => {
        let detail = `- ${e.message}`;
        if (e.type === "transform-error" && e.fn) {
          detail += `\n  Function: ${e.fn}`;
        }
        if (e.deps) {
          detail += `\n  Dependencies: ${e.deps.join(", ")}`;
        }
        return detail;
      })
      .join("\n");

    const message = `There are errors in the generated UI that need to be fixed:\n\n${errorDetails}\n\nPlease fix the transform functions and/or $state references to resolve these errors.`;
    onRequestFix(message);
  }, [errors, onRequestFix]);

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="text-amber-400 text-sm">&#9888;</span>
        <span className="text-xs font-medium text-amber-300 flex-1">
          {errors.length} data binding error{errors.length !== 1 ? "s" : ""}
        </span>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-[10px] text-amber-400/70 hover:text-amber-300 transition-colors px-1.5 py-0.5 rounded"
        >
          {expanded ? "Hide details" : "Show details"}
        </button>
        {onRequestFix && (
          <button
            onClick={handleAskFix}
            className="text-[10px] font-medium bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-2 py-1 rounded transition-colors"
          >
            Ask AI to fix
          </button>
        )}
      </div>

      {/* Error details */}
      {expanded && (
        <div className="border-t border-amber-500/20 px-3 py-2 space-y-2">
          {errors.map((err, i) => (
            <div key={i} className="text-xs space-y-0.5">
              <div className="text-amber-300/90 font-mono">{err.message}</div>
              {err.type === "transform-error" && err.fn && (
                <pre className="text-amber-400/50 font-mono text-[10px] bg-amber-500/5 rounded p-1.5 overflow-x-auto">
                  fn: {err.fn}
                </pre>
              )}
              {err.deps && (
                <div className="text-amber-400/50 font-mono text-[10px]">
                  deps: {err.deps.join(", ")}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
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

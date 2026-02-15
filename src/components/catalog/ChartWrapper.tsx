"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { ComponentError, ErrorCode } from "./ComponentError";

// ─── Shared chart error/loading wrapper ──────────────────────────────

interface ChartWrapperProps {
  /** Chart component type name for error messages */
  chartType: string;
  /** Expected array prop name (data, rows, etc.) */
  dataPropName: string;
  /** The raw data value from props */
  data: unknown;
  /** Numeric height for the chart container */
  height: number;
  /** Whether additional required props are present (e.g. yKeys) */
  hasRequiredProps: boolean;
  /** Diagnostic info shown in errors (keys, types, etc.) */
  diagnostics?: Record<string, unknown>;
  /** The actual chart content to render when data is valid */
  children: React.ReactNode;
}

/**
 * Wraps chart components with resilient error handling:
 * 1. Type validation: detects non-array data and shows actionable error
 * 2. Loading timeout: "Loading chart..." doesn't spin forever (15s max)
 * 3. Render detection: after mount, checks if the chart produced visible content
 * 4. Error boundary: catches runtime Recharts errors
 */
export function ChartWrapper({
  chartType,
  dataPropName,
  data,
  height,
  hasRequiredProps,
  diagnostics,
  children,
}: ChartWrapperProps) {
  // ─── State: type validation ───────────────────────
  if (data !== undefined && data !== null && !Array.isArray(data)) {
    const keys =
      typeof data === "object"
        ? Object.keys(data as Record<string, unknown>)
        : [];
    return (
      <ComponentError
        component={chartType}
        errorType="data format error"
        minHeight={height}
        diagnostics={diagnostics}
        message={
          <>
            Expected an array for <ErrorCode>{dataPropName}</ErrorCode>, got{" "}
            <ErrorCode>{typeof data}</ErrorCode>
            {keys.length > 0 && ` with keys: [${keys.join(", ")}]`}. Use a
            deeper $state path (e.g. append <ErrorCode>/data</ErrorCode>) or a
            transform.
          </>
        }
      />
    );
  }

  // ─── State: loading / no data ─────────────────────
  const isLoading =
    !Array.isArray(data) || data.length === 0 || !hasRequiredProps;

  if (isLoading) {
    return <LoadingWithTimeout chartType={chartType} height={height} />;
  }

  // ─── State: render with detection ─────────────────
  return (
    <ChartErrorBoundary chartType={chartType} height={height}>
      <RenderDetector chartType={chartType} height={height}>
        {children}
      </RenderDetector>
    </ChartErrorBoundary>
  );
}

// ─── Loading with timeout ────────────────────────────────────────────

function LoadingWithTimeout({
  chartType,
  height,
}: {
  chartType: string;
  height: number;
}) {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 15_000);
    return () => clearTimeout(timer);
  }, []);

  if (timedOut) {
    return (
      <ComponentError
        component={chartType}
        errorType="loading timed out"
        minHeight={height}
        message={
          <>
            Chart data did not arrive within 15 seconds. The $state binding may
            be pointing to a path that doesn&apos;t exist, or the data source
            did not return results.
          </>
        }
      />
    );
  }

  return (
    <div
      className="rounded-xl border border-zinc-800 p-4 text-sm text-zinc-500 animate-pulse"
      style={{ height }}
    >
      Loading {chartType.toLowerCase()}...
    </div>
  );
}

// ─── Render detector ─────────────────────────────────────────────────

/**
 * After mount, checks if the chart container actually produced visible content.
 * If the SVG has 0 dimensions after a brief delay, shows a warning.
 */
function RenderDetector({
  chartType,
  height,
  children,
}: {
  chartType: string;
  height: number;
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderFailed, setRenderFailed] = useState(false);
  const checkCountRef = useRef(0);

  const checkRender = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const svg = el.querySelector("svg");
    if (!svg) {
      // No SVG at all — chart didn't render
      checkCountRef.current++;
      if (checkCountRef.current >= 3) {
        setRenderFailed(true);
      }
      return;
    }
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      checkCountRef.current++;
      if (checkCountRef.current >= 3) {
        setRenderFailed(true);
      }
    } else {
      // Chart is visible — reset
      checkCountRef.current = 0;
      setRenderFailed(false);
    }
  }, []);

  useEffect(() => {
    // Check at 500ms, 2s, and 5s after mount
    const timers = [500, 2000, 5000].map((delay) =>
      setTimeout(checkRender, delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [checkRender]);

  return (
    <div ref={containerRef}>
      {renderFailed && (
        <ComponentError
          component={chartType}
          errorType="render issue detected"
          message={
            <>
              The chart data and props are valid, but the chart failed to render
              visually. This may be a layout or sizing issue. Try refreshing or
              resizing the window.
            </>
          }
        />
      )}
      <div className="w-full" style={{ minHeight: height }}>
        {children}
      </div>
    </div>
  );
}

// ─── Error boundary ──────────────────────────────────────────────────

class ChartErrorBoundary extends React.Component<
  { chartType: string; height: number; children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: {
    chartType: string;
    height: number;
    children: React.ReactNode;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <ChartErrorBoundaryFallback
          chartType={this.props.chartType}
          height={this.props.height}
          error={this.state.error}
        />
      );
    }
    return this.props.children;
  }
}

/**
 * Functional fallback component so we can use the ErrorContext hook
 * (class components can't use hooks directly).
 */
function ChartErrorBoundaryFallback({
  chartType,
  height,
  error,
}: {
  chartType: string;
  height: number;
  error?: Error;
}) {
  return (
    <ComponentError
      component={chartType}
      errorType="render error"
      severity="error"
      minHeight={height}
      message={error?.message ?? "Unknown rendering error"}
      stack={error?.stack}
    />
  );
}

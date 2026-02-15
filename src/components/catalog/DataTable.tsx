"use client";

import React, { useState, useEffect } from "react";
import type { ComponentRenderProps } from "@json-render/react";
import { cn } from "@/lib/cn";
import { ComponentError, ErrorCode } from "./ComponentError";

interface Column {
  key: string;
  header: string;
  align?: "left" | "center" | "right";
}

interface DataTableProps {
  columns: Column[];
  rows: Record<string, unknown>[];
  caption?: string;
}

export function DataTable({ element }: ComponentRenderProps<DataTableProps>) {
  const { columns, rows, caption } = element.props;

  // Guard: rows present but wrong type
  if (rows && !Array.isArray(rows)) {
    return (
      <ComponentError
        component="DataTable"
        errorType="data format error"
        message={
          <>
            Expected an array for <ErrorCode>rows</ErrorCode>, got{" "}
            <ErrorCode>{typeof rows}</ErrorCode>
            {typeof rows === "object"
              ? ` with keys: ${Object.keys(rows as Record<string, unknown>).join(", ")}`
              : ""}
            . The $state path or transform may need to reference a sub-path.
          </>
        }
      />
    );
  }

  // Guard: columns present but wrong type
  if (columns && !Array.isArray(columns)) {
    return (
      <ComponentError
        component="DataTable"
        errorType="data format error"
        message={
          <>
            Expected an array for <ErrorCode>columns</ErrorCode>, got{" "}
            <ErrorCode>{typeof columns}</ErrorCode>.
          </>
        }
      />
    );
  }

  // Guard against incomplete props during streaming
  if (!columns?.length || !rows?.length) {
    return <TableLoadingWithTimeout />;
  }

  // Validate column structure: each column needs at least a key
  const validColumns = columns.filter(
    (col) => col && typeof col === "object" && typeof col.key === "string"
  );
  if (validColumns.length === 0) {
    return (
      <ComponentError
        component="DataTable"
        errorType="columns format error"
        message={
          <>
            Each column object must have a <ErrorCode>key</ErrorCode> (string)
            property.
          </>
        }
        diagnostics={{ firstColumn: columns[0] }}
      />
    );
  }

  return (
    <TableErrorBoundary>
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          {caption && (
            <caption className="px-4 py-2 text-left text-xs text-zinc-500 border-b border-zinc-800">
              {caption}
            </caption>
          )}
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              {validColumns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-2.5 text-xs font-medium text-zinc-400 uppercase tracking-wider",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    (!col.align || col.align === "left") && "text-left"
                  )}
                >
                  {col.header ?? col.key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="hover:bg-zinc-900/30 transition-colors"
              >
                {validColumns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-2.5 text-zinc-300",
                      col.align === "right" && "text-right tabular-nums",
                      col.align === "center" && "text-center"
                    )}
                  >
                    {String(row[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TableErrorBoundary>
  );
}

// ─── Loading with timeout ────────────────────────────────────────────

function TableLoadingWithTimeout() {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 15_000);
    return () => clearTimeout(timer);
  }, []);

  if (timedOut) {
    return (
      <ComponentError
        component="DataTable"
        errorType="loading timed out"
        message={
          <>
            Table data did not arrive within 15 seconds. The $state binding may
            be pointing to a path that doesn&apos;t exist, or the data source
            did not return results.
          </>
        }
      />
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 p-4 text-sm text-zinc-500 animate-pulse">
      Loading table data...
    </div>
  );
}

// ─── Error boundary ──────────────────────────────────────────────────

class TableErrorBoundary extends React.Component<
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
        <TableErrorFallback error={this.state.error} />
      );
    }
    return this.props.children;
  }
}

function TableErrorFallback({ error }: { error?: Error }) {
  return (
    <ComponentError
      component="DataTable"
      errorType="render error"
      severity="error"
      message={error?.message ?? "Unknown rendering error"}
      stack={error?.stack}
    />
  );
}

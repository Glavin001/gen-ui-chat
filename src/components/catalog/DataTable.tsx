"use client";

import type { ComponentRenderProps } from "@json-render/react";
import { cn } from "@/lib/cn";

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

  // Guard against incomplete props during streaming
  if (!columns?.length || !rows?.length) {
    return (
      <div className="rounded-xl border border-zinc-800 p-4 text-sm text-zinc-500 animate-pulse">
        Loading table data...
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full text-sm">
        {caption && (
          <caption className="px-4 py-2 text-left text-xs text-zinc-500 border-b border-zinc-800">
            {caption}
          </caption>
        )}
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-2.5 text-xs font-medium text-zinc-400 uppercase tracking-wider",
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center",
                  (!col.align || col.align === "left") && "text-left"
                )}
              >
                {col.header}
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
              {columns.map((col) => (
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
  );
}

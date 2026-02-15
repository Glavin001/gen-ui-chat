"use client";

interface ToolCallIndicatorProps {
  toolName: string;
  args?: Record<string, unknown>;
}

const TOOL_LABELS: Record<string, string> = {
  get_weather: "Checking weather",
  search_stocks: "Looking up stocks",
  get_statistics: "Generating statistics",
  web_search: "Searching the web",
};

export function ToolCallIndicator({ toolName, args }: ToolCallIndicatorProps) {
  const label = TOOL_LABELS[toolName] ?? `Running ${toolName}`;
  const detail = args
    ? Object.values(args)
        .filter((v) => typeof v === "string" || Array.isArray(v))
        .map((v) => (Array.isArray(v) ? v.join(", ") : String(v)))
        .join(", ")
    : "";

  return (
    <div className="flex items-center gap-2 rounded-lg bg-zinc-900/50 border border-zinc-800 px-3 py-2 text-xs">
      <div className="h-3 w-3 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      <span className="text-zinc-400">
        {label}
        {detail && (
          <span className="text-zinc-600 ml-1">({detail})</span>
        )}
      </span>
    </div>
  );
}

"use client";

import { cn } from "@/lib/cn";

export type ViewMode = "preview" | "raw" | "split";

interface ViewModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const modes: { value: ViewMode; label: string; title: string }[] = [
  { value: "preview", label: "Preview", title: "Rendered UI (default)" },
  { value: "raw", label: "Raw", title: "Raw AI output for debugging" },
  { value: "split", label: "Split", title: "Side-by-side comparison" },
];

export function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-zinc-900 border border-zinc-800 p-0.5">
      {modes.map((m) => (
        <button
          key={m.value}
          title={m.title}
          onClick={() => onChange(m.value)}
          className={cn(
            "px-2.5 py-1 text-xs font-medium rounded-md transition-all",
            mode === m.value
              ? "bg-zinc-700 text-zinc-100 shadow-sm"
              : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

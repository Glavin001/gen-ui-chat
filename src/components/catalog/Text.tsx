"use client";

import type { ComponentRenderProps } from "@json-render/react";
import { cn } from "@/lib/cn";

interface TextProps {
  content: string;
  variant?: "body" | "heading" | "caption" | "code";
}

export function Text({ element }: ComponentRenderProps<TextProps>) {
  const { content, variant = "body" } = element.props;

  if (variant === "code") {
    return (
      <code className="px-1.5 py-0.5 bg-zinc-800 rounded text-sm font-mono text-emerald-400">
        {content}
      </code>
    );
  }

  return (
    <p
      className={cn(
        variant === "heading" && "text-lg font-semibold text-zinc-100",
        variant === "body" && "text-sm text-zinc-300 leading-relaxed",
        variant === "caption" && "text-xs text-zinc-500"
      )}
    >
      {content}
    </p>
  );
}

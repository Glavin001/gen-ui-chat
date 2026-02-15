"use client";

import type { ComponentRenderProps } from "@json-render/react";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export function CodeBlock({ element }: ComponentRenderProps<CodeBlockProps>) {
  const { code, language = "text", title } = element.props;

  return (
    <div className="rounded-xl border border-zinc-800 overflow-hidden">
      {(title || language !== "text") && (
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-zinc-800">
          <span className="text-xs text-zinc-500">
            {title ?? language}
          </span>
        </div>
      )}
      <pre className="p-4 overflow-x-auto bg-zinc-900/30">
        <code className="text-sm font-mono text-zinc-300 leading-relaxed">
          {code}
        </code>
      </pre>
    </div>
  );
}

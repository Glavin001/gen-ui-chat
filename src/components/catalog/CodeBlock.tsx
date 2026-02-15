"use client";

import type { ComponentRenderProps } from "@json-render/react";
import { ComponentError, ErrorCode } from "./ComponentError";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export function CodeBlock({ element }: ComponentRenderProps<CodeBlockProps>) {
  const { code, language = "text", title } = element.props;

  // Guard: missing code content
  if (code === undefined || code === null) {
    return (
      <ComponentError
        component="CodeBlock"
        errorType="missing content"
        message={
          <>
            The <ErrorCode>code</ErrorCode> prop is required.
          </>
        }
      />
    );
  }

  // Coerce non-string code (AI might pass an object or number)
  const codeStr =
    typeof code === "string"
      ? code
      : typeof code === "object"
        ? JSON.stringify(code, null, 2)
        : String(code);

  return (
    <div className="rounded-xl border border-zinc-800 overflow-hidden">
      {(title || language !== "text") && (
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-zinc-800">
          <span className="text-xs text-zinc-500">{title ?? language}</span>
        </div>
      )}
      <pre className="p-4 overflow-x-auto bg-zinc-900/30">
        <code className="text-sm font-mono text-zinc-300 leading-relaxed">
          {codeStr}
        </code>
      </pre>
    </div>
  );
}

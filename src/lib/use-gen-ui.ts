"use client";

import { useMemo } from "react";
import type { Spec } from "@json-render/core";
import {
  parseSpecStreamLine,
  applySpecPatch,
} from "@json-render/core";

/**
 * Parse a message content string to extract text and json-render spec.
 *
 * The AI outputs mixed content: prose text interleaved with JSONL patch lines.
 * Lines starting with `{` that parse as valid JSON Patch operations are
 * collected and applied to build a Spec. Everything else is treated as text.
 */
export function parseMessageContent(content: string): {
  text: string;
  spec: Spec | null;
} {
  if (!content) return { text: "", spec: null };

  const lines = content.split("\n");
  const textLines: string[] = [];
  let spec: Spec | null = null;
  let inCodeFence = false;
  let isSpecFence = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Handle code fences for spec blocks
    if (trimmed.startsWith("```")) {
      if (!inCodeFence) {
        inCodeFence = true;
        isSpecFence = trimmed === "```spec" || trimmed === "```json";
        if (isSpecFence) continue; // swallow the opening fence
      } else {
        inCodeFence = false;
        if (isSpecFence) {
          isSpecFence = false;
          continue; // swallow the closing fence
        }
      }
      if (!isSpecFence) {
        textLines.push(line);
      }
      continue;
    }

    if (inCodeFence && isSpecFence) {
      // Inside a spec fence — treat as patch
      const patch = parseSpecStreamLine(trimmed);
      if (patch) {
        if (!spec) {
          spec = { root: "", elements: {} };
        }
        applySpecPatch(spec, patch);
      }
      continue;
    }

    if (inCodeFence) {
      textLines.push(line);
      continue;
    }

    // Outside fences: try to parse lines starting with { as patches (heuristic mode)
    if (trimmed.startsWith("{")) {
      const patch = parseSpecStreamLine(trimmed);
      if (patch) {
        if (!spec) {
          spec = { root: "", elements: {} };
        }
        applySpecPatch(spec, patch);
        continue;
      }
    }

    textLines.push(line);
  }

  return {
    text: textLines.join("\n").trim(),
    spec,
  };
}

/**
 * Hook that parses message content into text and spec.
 * Memoized so it only recomputes when content changes.
 */
export function useGenUIMessage(content: string): {
  text: string;
  spec: Spec | null;
  hasSpec: boolean;
} {
  return useMemo(() => {
    const result = parseMessageContent(content);
    return {
      ...result,
      hasSpec: result.spec !== null && result.spec.root !== "",
    };
  }, [content]);
}

/**
 * JSON Patch operation (RFC 6902) for universal state mutation.
 */
export interface Patch {
  op: "add" | "replace" | "remove";
  path: string;
  value?: unknown;
}

/**
 * Envelope wrapping data from tool calls or external sources.
 */
export interface DataEnvelope<T = unknown> {
  status: "pending" | "success" | "error";
  value?: T;
  error?: string;
  timestamp: number;
}

/**
 * Definition for a sandboxed transform function.
 */
export interface TransformDef {
  /** JSON pointer paths this transform depends on */
  deps: string[];
  /** JavaScript function body to execute in sandbox */
  fn: string;
}

/**
 * Reactive binding reference in UI props.
 * Points to a path in the reactive store.
 */
export interface RefBinding {
  $ref: string;
  $loading?: unknown;
  $error?: unknown;
}

/**
 * UI Element specification for the reactive renderer.
 */
export interface ReactiveUIElement {
  type: string;
  props: Record<string, unknown>;
  children?: string[];
}

/**
 * SSE event types for the streaming protocol.
 */
export type StreamEventType =
  | "text" // Plain text content
  | "patch" // JSON Patch for state mutation
  | "tool-result" // Tool call result (bypasses LLM re-emission)
  | "error" // Error event
  | "done"; // Stream complete

/**
 * A single SSE event in the streaming protocol.
 */
export interface StreamEvent {
  type: StreamEventType;
  data: unknown;
}

/**
 * Check if a value is a $ref binding.
 */
export function isRefBinding(value: unknown): value is RefBinding {
  return (
    typeof value === "object" &&
    value !== null &&
    "$ref" in value &&
    typeof (value as RefBinding).$ref === "string"
  );
}

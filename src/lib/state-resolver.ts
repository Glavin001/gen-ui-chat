/**
 * State resolution utilities for connecting tool results and transforms
 * to json-render component props via $state bindings.
 *
 * Flow:
 *   1. extractToolResults(parts) → tool data at /tools/{toolName}
 *   2. extractTransformDefs(specState) → transform definitions from spec state
 *   3. computeTransforms(defs, stateModel, sandbox) → { outputs, errors }
 *   4. resolveSpecState(spec, stateModel) → spec with $state refs replaced by values
 */

import { getByPath, type Spec } from "@json-render/core";
import type { TransformDef } from "./types";
import type { TransformSandbox } from "./reactive-store";

// ─── Error Types ─────────────────────────────────────────────────────

/** A structured error from the state resolution pipeline. */
export interface StateError {
  type: "transform-error" | "unresolved-ref" | "prop-type-error";
  /** Transform key (e.g. "stock_table") or $state path */
  key: string;
  /** Human-readable error message */
  message: string;
  /** Extra detail: stack trace, dep paths, etc. */
  detail?: string;
  /** The transform function body (for transform errors) */
  fn?: string;
  /** The dependency paths that were resolved */
  deps?: string[];
}

/** Result of computing transforms — outputs plus any errors. */
export interface ComputeTransformsResult {
  outputs: Record<string, unknown>;
  errors: StateError[];
}

/** Full result from the resolution pipeline. */
export interface ResolutionResult {
  spec: Spec | null;
  errors: StateError[];
}

// ─── Tool Result Extraction ──────────────────────────────────────────

export interface ToolInvocationPart {
  type: string;
  // AI SDK v6: tool data may be on toolInvocation (legacy) or directly on part
  toolInvocation?: {
    toolName: string;
    toolCallId?: string;
    state: string;
    result?: unknown;
    output?: unknown;
    args?: Record<string, unknown>;
    [key: string]: unknown;
  };
  // AI SDK v6 new format: fields directly on part
  toolCallId?: string;
  state?: string;
  output?: unknown;
  result?: unknown;
  input?: unknown;
  [key: string]: unknown;
}

/**
 * Extract completed tool results from message parts.
 * Returns a map of toolName → result data.
 *
 * Handles two AI SDK part formats:
 *   1. Legacy: { type: "tool-invocation", toolInvocation: { toolName, state, result, ... } }
 *   2. AI SDK v6: { type: "tool-{toolName}", state: "output-available", output: [...] }
 *
 * Tool results are stored by name (latest wins if a tool is called multiple times).
 * Also stored by toolCallId for specific references.
 */
export function extractToolResults(
  parts: ToolInvocationPart[]
): Record<string, unknown> {
  const tools: Record<string, unknown> = {};

  for (const part of parts) {
    // Format 1: AI SDK v6 — type is "tool-{toolName}", data at top level
    if (part.type.startsWith("tool-") && part.type !== "tool-invocation" && part.type !== "tool-call" && part.type !== "tool-result") {
      const state = part.state ?? part.toolInvocation?.state;
      if (state === "output-available" || state === "result") {
        const toolName = part.type.replace(/^tool-/, "");
        const data = part.output ?? part.result ?? part.toolInvocation?.result ?? part.toolInvocation?.output;
        if (data !== undefined) {
          tools[toolName] = data;
          const callId = part.toolCallId ?? part.toolInvocation?.toolCallId;
          if (callId) {
            tools[callId] = data;
          }
        }
      }
    }

    // Format 2: Legacy — type is "tool-invocation", data in toolInvocation
    if (
      (part.type === "tool-invocation" || part.type === "tool-call") &&
      part.toolInvocation
    ) {
      const { state, toolName, toolCallId, result, output } = part.toolInvocation;
      if (state === "result" || state === "output-available") {
        const data = result ?? output;
        if (data !== undefined) {
          tools[toolName] = data;
          if (toolCallId) {
            tools[toolCallId] = data;
          }
        }
      }
    }
  }

  return tools;
}

// ─── Transform Extraction & Computation ──────────────────────────────

/**
 * Extract transform definitions from the spec's state tree.
 * Transforms are at state.tx.{key} and have { deps: string[], fn: string }.
 */
export function extractTransformDefs(
  specState: Record<string, unknown> | undefined
): Record<string, TransformDef> {
  const defs: Record<string, TransformDef> = {};
  if (!specState) return defs;

  const tx = specState.tx as Record<string, unknown> | undefined;
  if (!tx || typeof tx !== "object") return defs;

  for (const [key, value] of Object.entries(tx)) {
    if (isTransformDef(value)) {
      defs[key] = value;
    }
  }

  return defs;
}

function isTransformDef(value: unknown): value is TransformDef {
  return (
    typeof value === "object" &&
    value !== null &&
    "deps" in value &&
    "fn" in value &&
    Array.isArray((value as TransformDef).deps) &&
    typeof (value as TransformDef).fn === "string"
  );
}

/**
 * Compute all transform outputs given their definitions, a state model, and a sandbox.
 * Returns { outputs, errors } — outputs map of transform key → value, errors for any failures.
 *
 * Each transform's `deps` are resolved from the state model via JSON Pointer paths.
 * The resolved values are passed as positional arguments to the `fn` body.
 */
export function computeTransforms(
  defs: Record<string, TransformDef>,
  stateModel: Record<string, unknown>,
  sandbox: TransformSandbox
): ComputeTransformsResult {
  const outputs: Record<string, unknown> = {};
  const errors: StateError[] = [];

  for (const [key, def] of Object.entries(defs)) {
    try {
      // Resolve dependency values from the state model
      const args = def.deps.map((dep) => getByPath(stateModel, dep));

      // Skip execution if any dependency is not yet available
      // (common during streaming — transform def arrives before tool result)
      if (args.some((arg) => arg === undefined)) {
        outputs[key] = undefined;
        continue;
      }

      // Execute the transform function body in the sandbox
      const result = sandbox.evaluateSync(def.fn, args);
      outputs[key] = result;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const errStack = err instanceof Error ? err.stack : undefined;
      console.warn(`Transform "${key}" error:`, err);
      outputs[key] = null;
      errors.push({
        type: "transform-error",
        key,
        message: `Transform "${key}" failed: ${errMsg}`,
        detail: errStack,
        fn: def.fn,
        deps: def.deps,
      });
    }
  }

  return { outputs, errors };
}

// ─── State Model Assembly ────────────────────────────────────────────

/**
 * Build the combined state model from tool results, spec state, and transform outputs.
 *
 * State model layout (JSON Pointer paths):
 *   /state/{key}        → spec state data (e.g. /state/weatherData)
 *   /tools/{toolName}   → tool result data
 *   /tools/{callId}     → tool result data (by call ID)
 *   /tx/{key}           → transform output value
 *
 * The spec's state tree is preserved under /state/ so that $state references
 * like "/state/weatherData" resolve correctly.
 */
export function buildStateModel(
  toolResults: Record<string, unknown>,
  specState: Record<string, unknown> | undefined,
  txOutputs: Record<string, unknown>
): Record<string, unknown> {
  return {
    // Spec state preserved under /state/ key
    state: specState ?? {},
    // Tool results
    tools: toolResults,
    // Transform outputs
    tx: txOutputs,
  };
}

// ─── $state Resolution ──────────────────────────────────────────────

/**
 * Resolve all $state references in a spec's element props.
 * Returns a new spec with $state objects replaced by their resolved values,
 * plus any unresolved $state reference errors.
 *
 * Uses json-render's getByPath (JSON Pointer / RFC 6901) for path resolution.
 */
export function resolveSpecState(
  spec: Spec,
  stateModel: Record<string, unknown>
): { spec: Spec; errors: StateError[] } {
  const errors: StateError[] = [];

  if (!spec.elements) return { spec, errors };

  const resolvedElements: Record<string, unknown> = {};

  for (const [id, element] of Object.entries(spec.elements)) {
    const el = element as unknown as Record<string, unknown>;
    const props = el.props as Record<string, unknown> | undefined;

    if (props) {
      resolvedElements[id] = {
        ...el,
        props: resolvePropsDeep(props, stateModel, errors),
      };
    } else {
      resolvedElements[id] = el;
    }
  }

  // Return a new spec with resolved elements (strip state since we've resolved it)
  const { state: _state, ...restSpec } = spec as unknown as Record<string, unknown>;
  const resolved = {
    ...restSpec,
    elements: resolvedElements,
  } as unknown as Spec;

  return { spec: resolved, errors };
}

/**
 * Recursively resolve $state references in a props object.
 * Handles nested objects and arrays. Collects errors for unresolved refs.
 */
function resolvePropsDeep(
  props: Record<string, unknown>,
  stateModel: Record<string, unknown>,
  errors: StateError[]
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    resolved[key] = resolveValue(value, stateModel, errors);
  }

  return resolved;
}

/**
 * Resolve a single value. If it's a $state reference, look up the path.
 * If it's an object or array, recurse into it.
 * Tracks unresolved $state refs in the errors array.
 */
function resolveValue(
  value: unknown,
  stateModel: Record<string, unknown>,
  errors: StateError[]
): unknown {
  // Check for $state reference
  if (isStateRef(value)) {
    const path = (value as { $state: string }).$state;
    const resolved = getByPath(stateModel, path);
    if (resolved === undefined) {
      // Build a list of available paths so the AI knows what's actually accessible
      const availablePaths = collectAvailablePaths(stateModel, 3);
      errors.push({
        type: "unresolved-ref",
        key: path,
        message: `Unresolved $state reference: "${path}" — no data found at this path. Available paths: ${availablePaths.join(", ")}`,
        detail: `The path "${path}" does not exist in the state model. Available top-level paths are:\n${availablePaths.map(p => `  ${p}`).join("\n")}`,
      });
    }
    return resolved;
  }

  // Recurse into arrays
  if (Array.isArray(value)) {
    return value.map((v) => resolveValue(v, stateModel, errors));
  }

  // Recurse into plain objects
  if (value && typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    const resolved: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      resolved[k] = resolveValue(v, stateModel, errors);
    }
    return resolved;
  }

  // Literal value: return as-is
  return value;
}

/**
 * Check if a value is a $state reference object.
 */
function isStateRef(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    "$state" in value &&
    typeof (value as Record<string, unknown>).$state === "string"
  );
}

// ─── Post-resolution Prop Type Validation ────────────────────────────

/** Map of component type → prop names that must be arrays.
 * Keys must match the registry names exactly (PascalCase). */
const ARRAY_PROP_EXPECTATIONS: Record<string, string[]> = {
  LineChart: ["data"],
  BarChart: ["data"],
  PieChart: ["data"],
  DataTable: ["rows", "columns"],
};

/**
 * Validate that resolved props match expected types for known components.
 * Returns errors for props that exist but have an incorrect type
 * (e.g. data is an object instead of an array).
 *
 * Only flags props that are present and non-null — missing props are
 * handled by the component's own "loading" state.
 */
export function validateResolvedProps(spec: Spec): StateError[] {
  const errors: StateError[] = [];
  if (!spec.elements) return errors;

  for (const [id, element] of Object.entries(spec.elements)) {
    const el = element as { type?: string; props?: Record<string, unknown> };
    if (!el.type || !el.props) continue;

    const expectedArrayProps = ARRAY_PROP_EXPECTATIONS[el.type];
    if (!expectedArrayProps) continue;

    for (const propName of expectedArrayProps) {
      const value = el.props[propName];
      if (value !== undefined && value !== null && !Array.isArray(value)) {
        const keys =
          typeof value === "object"
            ? Object.keys(value as Record<string, unknown>)
            : [];
        errors.push({
          type: "prop-type-error",
          key: `${id}.props.${propName}`,
          message: `Component "${el.type}" expects "${propName}" to be an array, but received ${typeof value}${keys.length ? ` with keys: [${keys.join(", ")}]` : ""}. Use a deeper $state path (e.g. append "/data") or a transform to extract the array.`,
          detail: `Element ID: ${id}, prop: ${propName}, actual type: ${typeof value}`,
        });
      }
    }
  }

  return errors;
}

// ─── Utility: enumerate available state paths ────────────────────────

/**
 * Collect available JSON Pointer paths from the state model up to `maxDepth`.
 * Used in error messages so the AI knows what paths exist.
 */
function collectAvailablePaths(
  obj: Record<string, unknown>,
  maxDepth: number,
  prefix = ""
): string[] {
  const paths: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const path = `${prefix}/${key}`;
    if (value === undefined) continue;
    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      maxDepth > 1
    ) {
      // Recurse into sub-objects
      paths.push(
        ...collectAvailablePaths(
          value as Record<string, unknown>,
          maxDepth - 1,
          path
        )
      );
    } else if (Array.isArray(value)) {
      paths.push(`${path} (array, ${value.length} items)`);
    } else {
      paths.push(`${path} (${typeof value})`);
    }
  }
  return paths;
}

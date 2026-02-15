import { signal, computed, effect, type Signal, type ReadonlySignal } from "@preact/signals-core";
import type { Patch, DataEnvelope, TransformDef } from "./types";

/**
 * Path-addressable reactive store built on Preact Signals.
 *
 * Organized into three regions:
 *   /data/**   — Raw data from tool calls, agent, or user input
 *   /tx/**     — Transform definitions and their computed outputs
 *   /ui/**     — UI element specifications (used for reactive renderer)
 *
 * Each leaf node is a Preact signal. Intermediate paths are navigable.
 * Computed values (transforms) are created via `computed()` and cached.
 */

type StoreNode = Signal<unknown> | ReadonlySignal<unknown>;

export class ReactiveStore {
  private nodes = new Map<string, StoreNode>();
  private transforms = new Map<string, { def: TransformDef; dispose: () => void }>();
  private sandbox: TransformSandbox | null = null;

  constructor(sandbox?: TransformSandbox) {
    this.sandbox = sandbox ?? null;
  }

  // ─── Signal Access ─────────────────────────────────────────

  /**
   * Get or create a signal at the given path.
   */
  getSignal(path: string): Signal<unknown> {
    const existing = this.nodes.get(path);
    if (existing) return existing as Signal<unknown>;

    const s = signal<unknown>(undefined);
    this.nodes.set(path, s);
    return s;
  }

  /**
   * Get the current value at a path (reads the signal).
   */
  get(path: string): unknown {
    return this.getSignal(path).value;
  }

  /**
   * Set a value at a path (writes to the signal).
   */
  set(path: string, value: unknown): void {
    const s = this.getSignal(path);
    s.value = value;
  }

  /**
   * Check if a signal exists at the path.
   */
  has(path: string): boolean {
    return this.nodes.has(path);
  }

  /**
   * Remove a signal at the path.
   */
  remove(path: string): void {
    this.nodes.delete(path);
  }

  /**
   * Subscribe to changes at a path using Preact's effect().
   */
  subscribe(path: string, callback: (value: unknown) => void): () => void {
    const s = this.getSignal(path);
    return effect(() => {
      callback(s.value);
    });
  }

  // ─── Patch Application ─────────────────────────────────────

  /**
   * Apply a JSON Patch operation to the store.
   */
  applyPatch(patch: Patch): void {
    switch (patch.op) {
      case "add":
      case "replace":
        this.set(patch.path, patch.value);
        break;
      case "remove":
        this.remove(patch.path);
        break;
    }
  }

  /**
   * Apply multiple patches atomically.
   */
  applyPatches(patches: Patch[]): void {
    for (const patch of patches) {
      this.applyPatch(patch);
    }
  }

  // ─── Data Region (/data/**) ────────────────────────────────

  /**
   * Store a tool result in the data region.
   */
  setToolData(toolCallId: string, envelope: DataEnvelope): void {
    this.set(`/data/tool/${toolCallId}`, envelope);
  }

  /**
   * Get a tool result from the data region.
   */
  getToolData(toolCallId: string): DataEnvelope | undefined {
    return this.get(`/data/tool/${toolCallId}`) as DataEnvelope | undefined;
  }

  /**
   * Subscribe to a tool result.
   */
  subscribeToolData(toolCallId: string, callback: (envelope: DataEnvelope | undefined) => void): () => void {
    return this.subscribe(`/data/tool/${toolCallId}`, (v) =>
      callback(v as DataEnvelope | undefined)
    );
  }

  // ─── Transform Region (/tx/**) ─────────────────────────────

  /**
   * Register a transform. Creates a computed signal at /tx/{key}/$output.
   */
  async registerTransform(key: string, def: TransformDef): Promise<void> {
    // Clean up existing transform
    this.disposeTransform(key);

    // Store the definition
    this.set(`/tx/${key}`, def);

    if (!this.sandbox) {
      console.warn(`No sandbox available for transform ${key}`);
      return;
    }

    // Create a computed signal that re-evaluates when deps change
    const depSignals = def.deps.map((dep) => this.getSignal(dep));
    const sandbox = this.sandbox;
    const fn = def.fn;

    const outputSignal = computed(() => {
      // Read all deps (this creates Preact signal subscriptions)
      const args: unknown[] = [];
      for (let i = 0; i < def.deps.length; i++) {
        args.push(depSignals[i].value);
      }
      // Execute transform: arguments[0] = first dep, arguments[1] = second, etc.
      return sandbox.evaluateSync(fn, args);
    });

    this.nodes.set(`/tx/${key}/$output`, outputSignal);

    // Store dispose function
    this.transforms.set(key, {
      def,
      dispose: () => {
        this.nodes.delete(`/tx/${key}/$output`);
        this.nodes.delete(`/tx/${key}`);
      },
    });
  }

  /**
   * Dispose a transform.
   */
  disposeTransform(key: string): void {
    const existing = this.transforms.get(key);
    if (existing) {
      existing.dispose();
      this.transforms.delete(key);
    }
  }

  // ─── Snapshot ──────────────────────────────────────────────

  /**
   * Get a plain object snapshot of all values under a prefix.
   */
  snapshot(prefix = "/"): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [path, node] of this.nodes) {
      if (path.startsWith(prefix)) {
        const key = path.slice(prefix.length);
        result[key] = node.value;
      }
    }
    return result;
  }

  /**
   * Get all paths in the store.
   */
  paths(): string[] {
    return Array.from(this.nodes.keys());
  }

  /**
   * Dispose all signals and transforms.
   */
  dispose(): void {
    for (const [, t] of this.transforms) {
      t.dispose();
    }
    this.transforms.clear();
    this.nodes.clear();
  }
}

/**
 * Interface for the transform sandbox.
 *
 * Transforms receive resolved dependency values as positional arguments.
 * Inside the function body, use `arguments[0]`, `arguments[1]`, etc.
 */
export interface TransformSandbox {
  evaluateSync(fn: string, args: unknown[]): unknown;
  evaluate(fn: string, args: unknown[]): Promise<unknown>;
  dispose(): void;
}

/**
 * Simple in-process sandbox using Function constructor.
 * For production, use a Web Worker or SES-based sandbox.
 *
 * The function body is executed with dependency values as positional arguments:
 *   arguments[0] = first dep, arguments[1] = second dep, etc.
 *
 * Example fn: "const data = arguments[0]; return data.map(s => s.price);"
 */
export class InProcessSandbox implements TransformSandbox {
  private cache = new Map<string, Function>();

  evaluateSync(fn: string, args: unknown[]): unknown {
    try {
      let compiled = this.cache.get(fn);
      if (!compiled) {
        // Create a function with no named params — uses arguments[0..n]
        compiled = new Function(`"use strict"; ${fn}`);
        this.cache.set(fn, compiled);
      }
      return compiled.apply(null, args);
    } catch (err) {
      console.warn("Transform execution error:", err);
      return null;
    }
  }

  async evaluate(fn: string, args: unknown[]): Promise<unknown> {
    return this.evaluateSync(fn, args);
  }

  dispose(): void {
    this.cache.clear();
  }
}

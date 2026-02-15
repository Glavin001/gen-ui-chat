import { z } from "zod";
import { defineSchema, defineCatalog } from "@json-render/core";

/**
 * Define the schema compatible with json-render React renderer.
 * This mirrors the schema from @json-render/react but without importing React.
 */
const appSchema = defineSchema((s) => ({
  spec: s.object({
    root: s.string(),
    elements: s.record(
      s.object({
        type: s.ref("catalog.components"),
        props: s.propsOf("catalog.components"),
        children: s.array(s.string()),
        visible: s.any(),
      })
    ),
  }),
  catalog: s.object({
    components: s.map({
      props: s.zod(),
      slots: s.array(s.string()),
      description: s.string(),
      example: s.any(),
    }),
    actions: s.map({
      params: s.zod(),
      description: s.string(),
    }),
  }),
}));

/**
 * Component catalog defining all available UI components for the AI to use.
 *
 * Each component has a Zod props schema, a description for the AI prompt, and optional slots.
 */
export const catalog = defineCatalog(appSchema, {
  components: {
    // ─── Layout ─────────────────────────────────────────────
    Card: {
      props: z.object({
        title: z.string().optional().describe("Card heading"),
        subtitle: z.string().optional().describe("Secondary text below title"),
        variant: z
          .enum(["default", "outlined", "elevated"])
          .optional()
          .default("default")
          .describe("Visual style"),
      }),
      slots: ["default"],
      description:
        "A container card with optional title and subtitle. Use for grouping related content.",
    },

    Grid: {
      props: z.object({
        columns: z
          .number()
          .min(1)
          .max(6)
          .optional()
          .default(2)
          .describe("Number of columns (1-6)"),
        gap: z
          .enum(["none", "sm", "md", "lg"])
          .optional()
          .default("md")
          .describe("Gap between items"),
      }),
      slots: ["default"],
      description: "A responsive grid layout. Children are placed in columns.",
    },

    Stack: {
      props: z.object({
        direction: z
          .enum(["horizontal", "vertical"])
          .optional()
          .default("vertical")
          .describe("Stack direction"),
        gap: z
          .enum(["none", "sm", "md", "lg"])
          .optional()
          .default("md")
          .describe("Gap between items"),
        align: z
          .enum(["start", "center", "end", "stretch"])
          .optional()
          .default("stretch")
          .describe("Cross-axis alignment"),
      }),
      slots: ["default"],
      description: "A flex stack for arranging children in a row or column.",
    },

    // ─── Data Display ───────────────────────────────────────

    Text: {
      props: z.object({
        content: z.string().describe("Text content (supports markdown)"),
        variant: z
          .enum(["body", "heading", "caption", "code"])
          .optional()
          .default("body")
          .describe("Text style variant"),
      }),
      slots: [],
      description: "Renders text content. Supports markdown formatting.",
    },

    Metric: {
      props: z.object({
        label: z.string().describe("Metric label"),
        value: z.union([z.string(), z.number()]).describe("Primary metric value"),
        unit: z.string().optional().describe("Unit suffix (e.g. %, °F, ms)"),
        trend: z
          .enum(["up", "down", "flat"])
          .optional()
          .describe("Trend direction indicator"),
        trendValue: z.string().optional().describe("Trend text (e.g. +12%)"),
        description: z.string().optional().describe("Additional context"),
      }),
      slots: [],
      description:
        "A single KPI or metric display with value, label, and optional trend indicator.",
    },

    DataTable: {
      props: z.object({
        columns: z
          .array(
            z.object({
              key: z.string().describe("Data field key"),
              header: z.string().describe("Column header label"),
              align: z.enum(["left", "center", "right"]).optional(),
            })
          )
          .describe("Column definitions"),
        rows: z
          .array(z.record(z.string(), z.unknown()))
          .describe("Array of row data objects"),
        caption: z.string().optional().describe("Table caption"),
      }),
      slots: [],
      description:
        "A data table with defined columns and rows. Good for structured data display.",
    },

    // ─── Charts ─────────────────────────────────────────────

    BarChart: {
      props: z.object({
        data: z
          .array(z.record(z.string(), z.unknown()))
          .describe("Array of data points"),
        xKey: z.string().describe("Key for X axis values"),
        yKeys: z.array(z.string()).describe("Keys for Y axis values (bar series)"),
        colors: z
          .array(z.string())
          .optional()
          .describe("Colors for each series"),
        title: z.string().optional().describe("Chart title"),
        height: z.number().optional().default(300).describe("Chart height in px"),
      }),
      slots: [],
      description: "A bar chart for comparing categorical data.",
    },

    LineChart: {
      props: z.object({
        data: z
          .array(z.record(z.string(), z.unknown()))
          .describe("Array of data points"),
        xKey: z.string().describe("Key for X axis values"),
        yKeys: z.array(z.string()).describe("Keys for Y axis values (line series)"),
        colors: z
          .array(z.string())
          .optional()
          .describe("Colors for each series"),
        title: z.string().optional().describe("Chart title"),
        height: z.number().optional().default(300).describe("Chart height in px"),
      }),
      slots: [],
      description:
        "A line chart for showing trends over time or continuous data.",
    },

    PieChart: {
      props: z.object({
        data: z
          .array(
            z.object({
              name: z.string(),
              value: z.number(),
              color: z.string().optional(),
            })
          )
          .describe("Pie chart segments"),
        title: z.string().optional().describe("Chart title"),
        height: z.number().optional().default(300).describe("Chart height in px"),
        showLabels: z.boolean().optional().default(true),
      }),
      slots: [],
      description: "A pie/donut chart for showing proportions.",
    },

    // ─── Interactive ─────────────────────────────────────────

    Button: {
      props: z.object({
        label: z.string().describe("Button text"),
        variant: z
          .enum(["primary", "secondary", "outline", "ghost", "destructive"])
          .optional()
          .default("primary")
          .describe("Button style"),
        disabled: z.boolean().optional().default(false),
        icon: z.string().optional().describe("Lucide icon name"),
      }),
      slots: [],
      description:
        "A clickable button. Use `on.press` to bind an action.",
    },

    // ─── Special ─────────────────────────────────────────────

    Image: {
      props: z.object({
        src: z.string().describe("Image URL"),
        alt: z.string().describe("Alt text for accessibility"),
        width: z.number().optional(),
        height: z.number().optional(),
        fit: z
          .enum(["cover", "contain", "fill"])
          .optional()
          .default("cover"),
      }),
      slots: [],
      description: "Displays an image.",
    },

    Badge: {
      props: z.object({
        text: z.string().describe("Badge text"),
        variant: z
          .enum(["default", "success", "warning", "error", "info"])
          .optional()
          .default("default")
          .describe("Badge color variant"),
      }),
      slots: [],
      description: "A small badge/tag for status indicators or labels.",
    },

    Divider: {
      props: z.object({
        label: z.string().optional().describe("Optional label in the divider"),
      }),
      slots: [],
      description: "A horizontal divider line, optionally with a label.",
    },

    CodeBlock: {
      props: z.object({
        code: z.string().describe("Code content"),
        language: z.string().optional().default("text").describe("Programming language"),
        title: z.string().optional().describe("Optional filename or title"),
      }),
      slots: [],
      description: "A syntax-highlighted code block.",
    },

    Progress: {
      props: z.object({
        value: z.number().min(0).max(100).describe("Progress percentage (0-100)"),
        label: z.string().optional().describe("Progress label"),
        variant: z
          .enum(["default", "success", "warning", "error"])
          .optional()
          .default("default"),
      }),
      slots: [],
      description: "A progress bar showing completion status.",
    },
  },
  actions: {
    setState: {
      params: z.object({
        statePath: z.string().describe("JSON pointer path in state"),
        value: z.unknown().describe("Value to set"),
      }),
      description: "Set a value in the state model at the given path.",
    },
  },
});

export type AppCatalog = typeof catalog;

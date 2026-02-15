import { z } from "zod";
import { tool } from "ai";
import { webSearch } from "@exalabs/ai-sdk";

/**
 * Tool descriptions, schemas, and execute functions.
 * Shared between AI SDK tool wrappers and Claude Code MCP server.
 */

// ─── Tool Definitions (pure logic, reusable) ─────────────────────────

export const toolDefs = {
  get_weather: {
    description:
      "Get current weather data for a city. Returns temperature, conditions, humidity, and wind.",
    inputSchema: z.object({
      city: z.string().describe("City name (e.g., 'San Francisco', 'Tokyo')"),
      unit: z
        .enum(["celsius", "fahrenheit"])
        .optional()
        .default("fahrenheit")
        .describe("Temperature unit"),
    }),
    execute: async ({ city, unit }: { city: string; unit: "celsius" | "fahrenheit" }) => {
      const cities: Record<string, { temp_f: number; temp_c: number; condition: string; humidity: number; wind_mph: number }> = {
        "san francisco": { temp_f: 62, temp_c: 17, condition: "Partly Cloudy", humidity: 72, wind_mph: 14 },
        "new york": { temp_f: 45, temp_c: 7, condition: "Overcast", humidity: 65, wind_mph: 18 },
        "tokyo": { temp_f: 55, temp_c: 13, condition: "Clear", humidity: 55, wind_mph: 8 },
        "london": { temp_f: 48, temp_c: 9, condition: "Rainy", humidity: 85, wind_mph: 22 },
        "paris": { temp_f: 50, temp_c: 10, condition: "Cloudy", humidity: 78, wind_mph: 12 },
        "sydney": { temp_f: 78, temp_c: 26, condition: "Sunny", humidity: 45, wind_mph: 10 },
        "mumbai": { temp_f: 88, temp_c: 31, condition: "Humid", humidity: 80, wind_mph: 6 },
        "berlin": { temp_f: 42, temp_c: 6, condition: "Snowy", humidity: 70, wind_mph: 15 },
        "nyc": { temp_f: 45, temp_c: 7, condition: "Overcast", humidity: 65, wind_mph: 18 },
      };

      const cityLower = city.toLowerCase();
      const data = cities[cityLower] ?? {
        temp_f: Math.round(40 + Math.random() * 50),
        temp_c: Math.round(4 + Math.random() * 28),
        condition: ["Sunny", "Cloudy", "Rainy", "Clear"][Math.floor(Math.random() * 4)],
        humidity: Math.round(30 + Math.random() * 60),
        wind_mph: Math.round(5 + Math.random() * 25),
      };

      return {
        city,
        temperature: unit === "celsius" ? data.temp_c : data.temp_f,
        unit: unit === "celsius" ? "°C" : "°F",
        condition: data.condition,
        humidity: data.humidity,
        wind_mph: data.wind_mph,
        retrieved_at: new Date().toISOString(),
      };
    },
  },

  search_stocks: {
    description:
      "Search for stock market data. Returns price, change, and market cap for given symbols.",
    inputSchema: z.object({
      symbols: z
        .array(z.string())
        .describe("Stock ticker symbols (e.g., ['AAPL', 'GOOGL'])"),
    }),
    execute: async ({ symbols }: { symbols: string[] }) => {
      const stockData: Record<string, { price: number; change: number; changePercent: number; marketCap: string; volume: string }> = {
        AAPL: { price: 189.84, change: 2.34, changePercent: 1.25, marketCap: "2.95T", volume: "54.2M" },
        GOOGL: { price: 141.80, change: -0.92, changePercent: -0.64, marketCap: "1.78T", volume: "22.1M" },
        MSFT: { price: 378.91, change: 4.56, changePercent: 1.22, marketCap: "2.81T", volume: "19.8M" },
        AMZN: { price: 178.25, change: 3.12, changePercent: 1.78, marketCap: "1.85T", volume: "42.3M" },
        TSLA: { price: 248.42, change: -5.63, changePercent: -2.22, marketCap: "790B", volume: "98.7M" },
        NVDA: { price: 721.33, change: 15.27, changePercent: 2.16, marketCap: "1.78T", volume: "45.6M" },
        META: { price: 474.99, change: 7.82, changePercent: 1.67, marketCap: "1.21T", volume: "15.4M" },
      };

      return symbols.map((sym) => {
        const s = sym.toUpperCase();
        const data = stockData[s] ?? {
          price: Math.round((50 + Math.random() * 300) * 100) / 100,
          change: Math.round((-10 + Math.random() * 20) * 100) / 100,
          changePercent: Math.round((-5 + Math.random() * 10) * 100) / 100,
          marketCap: `${Math.round(10 + Math.random() * 500)}B`,
          volume: `${Math.round(1 + Math.random() * 50)}M`,
        };
        return { symbol: s, ...data };
      });
    },
  },

  get_statistics: {
    description:
      "Generate sample statistics/analytics data for a given topic. Good for dashboards and charts.",
    inputSchema: z.object({
      topic: z.string().describe("The topic to generate statistics for"),
      dataPoints: z
        .number()
        .optional()
        .default(6)
        .describe("Number of data points to generate"),
    }),
    execute: async ({ topic, dataPoints }: { topic: string; dataPoints: number }) => {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const data = [];
      let base = Math.round(1000 + Math.random() * 9000);
      for (let i = 0; i < dataPoints; i++) {
        const growth = 1 + (Math.random() * 0.3 - 0.1);
        base = Math.round(base * growth);
        data.push({
          period: months[i % 12],
          value: base,
          target: Math.round(base * (0.9 + Math.random() * 0.3)),
        });
      }

      const total = data.reduce((sum, d) => sum + d.value, 0);
      const avg = Math.round(total / data.length);
      const max = Math.max(...data.map((d) => d.value));
      const min = Math.min(...data.map((d) => d.value));

      return {
        topic,
        summary: { total, average: avg, max, min, dataPoints: data.length },
        data,
      };
    },
  },

  set_state: {
    description:
      "Set state values and/or define computed transforms for the UI. " +
      "State values are available to UI components via $state references (e.g. {\"$state\":\"/weather/hourly\"}). " +
      "Computed values are derived from other state via a JS function and available at /computed/{key}. " +
      "Protected namespaces: 'computed', 'tools', 'state' cannot be used as top-level state keys.",
    inputSchema: z.object({
      state: z
        .record(z.string(), z.unknown())
        .optional()
        .describe(
          "State values to set. Keys are slash-separated paths (e.g. 'weather' sets /weather). Values can be any JSON."
        ),
      computed: z
        .record(
          z.string(),
          z.object({
            deps: z
              .array(z.string())
              .describe(
                "$state paths to read as positional arguments (e.g. [\"/tools/toolu_abc/output\"])"
              ),
            fn: z
              .string()
              .describe(
                "JavaScript function body. Deps passed as arguments[0], arguments[1], etc. Must return a value."
              ),
          })
        )
        .optional()
        .describe(
          "Computed/derived values. Each has deps (state paths) and fn (JS function body). Output available at /computed/{key}."
        ),
    }),
    execute: async ({ state, computed }: {
      state?: Record<string, unknown>;
      computed?: Record<string, { deps: string[]; fn: string }>;
    }) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Validate state keys don't use reserved namespaces
      if (state) {
        for (const key of Object.keys(state)) {
          if (key === "computed" || key === "tools" || key === "state") {
            errors.push(
              `Cannot set reserved namespace "${key}". Use a different top-level key.`
            );
          }
        }
      }

      // Validate computed transform definitions
      if (computed) {
        for (const [key, def] of Object.entries(computed)) {
          if (!def.deps || def.deps.length === 0) {
            warnings.push(`Computed "${key}" has no deps — it will receive no arguments.`);
          }
          // Validate fn parses as valid JavaScript
          try {
            new Function(
              ...def.deps.map((_, i) => `arg${i}`),
              def.fn
            );
          } catch (e) {
            errors.push(
              `Computed "${key}" has invalid fn: ${e instanceof Error ? e.message : String(e)}`
            );
          }
        }
      }

      if (errors.length > 0) {
        return { ok: false, errors, warnings };
      }

      return {
        ok: true,
        state_keys: Object.keys(state ?? {}),
        computed_keys: Object.keys(computed ?? {}),
        warnings,
        // Echo back the data so the client can extract it from the tool result
        _state: state ?? {},
        _computed: computed ?? {},
      };
    },
  },
} as const;

// ─── AI SDK Tools (for non-Claude-Code models) ──────────────────────

export const tools = {
  get_weather: tool({
    description: toolDefs.get_weather.description,
    inputSchema: toolDefs.get_weather.inputSchema,
    execute: toolDefs.get_weather.execute,
  }),
  search_stocks: tool({
    description: toolDefs.search_stocks.description,
    inputSchema: toolDefs.search_stocks.inputSchema,
    execute: toolDefs.search_stocks.execute,
  }),
  get_statistics: tool({
    description: toolDefs.get_statistics.description,
    inputSchema: toolDefs.get_statistics.inputSchema,
    execute: toolDefs.get_statistics.execute,
  }),
  set_state: tool({
    description: toolDefs.set_state.description,
    inputSchema: toolDefs.set_state.inputSchema,
    execute: toolDefs.set_state.execute,
  }),
  web_search: webSearch(),
};

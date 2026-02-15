import { z } from "zod";
import { tool } from "ai";

/**
 * Available tools for the AI agent.
 * Tool results are streamed to the client and displayed via generative UI.
 */

export const tools = {
  get_weather: tool({
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
    execute: async ({ city, unit }) => {
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
  }),

  search_stocks: tool({
    description:
      "Search for stock market data. Returns price, change, and market cap for given symbols.",
    inputSchema: z.object({
      symbols: z
        .array(z.string())
        .describe("Stock ticker symbols (e.g., ['AAPL', 'GOOGL'])"),
    }),
    execute: async ({ symbols }) => {
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
  }),

  get_statistics: tool({
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
    execute: async ({ topic, dataPoints }) => {
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
  }),

  web_search: tool({
    description:
      "Search the web for information. Returns simulated search results.",
    inputSchema: z.object({
      query: z.string().describe("Search query"),
      maxResults: z.number().optional().default(5).describe("Maximum results"),
    }),
    execute: async ({ query, maxResults }) => {
      const results = Array.from({ length: maxResults }, (_, i) => ({
        title: `${query} - Result ${i + 1}`,
        url: `https://example.com/result-${i + 1}`,
        snippet: `This is a relevant excerpt about "${query}". It contains useful information that answers the query with specific details and data points.`,
      }));
      return { query, totalResults: results.length, results };
    },
  }),
};

import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "@/components/catalog/Card";
import { Grid } from "@/components/catalog/Grid";
import { Stack } from "@/components/catalog/Stack";
import { Text } from "@/components/catalog/Text";
import { Metric } from "@/components/catalog/Metric";
import { DataTable } from "@/components/catalog/DataTable";
import { BarChartComponent } from "@/components/catalog/BarChartComponent";
import { PieChartComponent } from "@/components/catalog/PieChartComponent";
import { Badge } from "@/components/catalog/Badge";
import { Button } from "@/components/catalog/Button";
import { CodeBlock } from "@/components/catalog/CodeBlock";
import { Divider } from "@/components/catalog/Divider";
import { mockElement } from "../helpers";

/**
 * Data explorer and statistics compositions — scenarios where the AI
 * presents structured data analysis results.
 */
const meta: Meta = {
  title: "Composed/Data Explorer",
  decorators: [
    (Story) => (
      <div className="bg-zinc-950 text-zinc-100 antialiased p-6 max-w-4xl mx-auto">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

/**
 * Statistics overview — response to "Show me statistics for our product".
 */
export const StatisticsOverview: Story = {
  render: () => (
    <Stack element={mockElement("Stack", { direction: "vertical", gap: "lg" }) as never} emit={() => {}}>
      <Stack element={mockElement("Stack", { direction: "horizontal", gap: "sm", align: "center" }) as never} emit={() => {}}>
        <Text element={mockElement("Text", { content: "Product Statistics", variant: "heading" }) as never} emit={() => {}} />
        <Badge element={mockElement("Badge", { text: "Q4 2025", variant: "info" }) as never} emit={() => {}} />
      </Stack>

      <Grid element={mockElement("Grid", { columns: 4, gap: "md" }) as never} emit={() => {}}>
        <Metric element={mockElement("Metric", { label: "Mean", value: "42.7", description: "Average response time (ms)" }) as never} emit={() => {}} />
        <Metric element={mockElement("Metric", { label: "Median", value: "38.2", description: "50th percentile" }) as never} emit={() => {}} />
        <Metric element={mockElement("Metric", { label: "P99", value: "128.4", unit: "ms", trend: "down", trendValue: "-12%" }) as never} emit={() => {}} />
        <Metric element={mockElement("Metric", { label: "Std Dev", value: "15.3", description: "Variability measure" }) as never} emit={() => {}} />
      </Grid>

      <Grid element={mockElement("Grid", { columns: 2, gap: "md" }) as never} emit={() => {}}>
        <Card element={mockElement("Card", { title: "Response Time Distribution", variant: "default" }) as never} emit={() => {}}>
          <BarChartComponent
            element={mockElement("BarChart", {
              data: [
                { range: "0-20ms", count: 1200 },
                { range: "20-40ms", count: 3400 },
                { range: "40-60ms", count: 2800 },
                { range: "60-80ms", count: 1500 },
                { range: "80-100ms", count: 600 },
                { range: "100ms+", count: 300 },
              ],
              xKey: "range",
              yKeys: ["count"],
              colors: ["#6366f1"],
              height: 250,
            }) as never}
            emit={() => {}}
          />
        </Card>
        <Card element={mockElement("Card", { title: "Error Rate by Type", variant: "default" }) as never} emit={() => {}}>
          <PieChartComponent
            element={mockElement("PieChart", {
              data: [
                { name: "Timeout", value: 42, color: "#f59e0b" },
                { name: "Rate Limit", value: 28, color: "#ef4444" },
                { name: "Server Error", value: 18, color: "#8b5cf6" },
                { name: "Client Error", value: 12, color: "#06b6d4" },
              ],
              height: 250,
            }) as never}
            emit={() => {}}
          />
        </Card>
      </Grid>

      <Card element={mockElement("Card", { title: "Detailed Breakdown", variant: "default" }) as never} emit={() => {}}>
        <DataTable
          element={mockElement("DataTable", {
            columns: [
              { key: "endpoint", header: "Endpoint" },
              { key: "calls", header: "Calls", align: "right" },
              { key: "avg", header: "Avg (ms)", align: "right" },
              { key: "p99", header: "P99 (ms)", align: "right" },
              { key: "errors", header: "Errors", align: "right" },
              { key: "status", header: "Status", align: "center" },
            ],
            rows: [
              { endpoint: "GET /api/users", calls: "12,340", avg: "32", p99: "85", errors: "0.1%", status: "✅" },
              { endpoint: "POST /api/chat", calls: "8,210", avg: "245", p99: "890", errors: "1.2%", status: "⚠️" },
              { endpoint: "GET /api/products", calls: "45,600", avg: "18", p99: "42", errors: "0.0%", status: "✅" },
              { endpoint: "POST /api/upload", calls: "1,230", avg: "1200", p99: "4500", errors: "3.8%", status: "❌" },
            ],
          }) as never}
          emit={() => {}}
        />
      </Card>
    </Stack>
  ),
};

/**
 * Code generation result — response to "Generate an API handler for user authentication".
 */
export const CodeGenResult: Story = {
  render: () => (
    <Stack element={mockElement("Stack", { direction: "vertical", gap: "md" }) as never} emit={() => {}}>
      <Text element={mockElement("Text", { content: "Here's the authentication handler you requested:", variant: "body" }) as never} emit={() => {}} />

      <CodeBlock
        element={mockElement("CodeBlock", {
          code: `import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

export async function middleware(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  
  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET!);
    req.headers.set("x-user-id", (decoded as { sub: string }).sub);
    return NextResponse.next();
  } catch {
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 403 }
    );
  }
}`,
          language: "typescript",
          title: "middleware.ts",
        }) as never}
        emit={() => {}}
      />

      <Divider element={mockElement("Divider", { label: "Key Points" }) as never} emit={() => {}} />

      <Grid element={mockElement("Grid", { columns: 3, gap: "sm" }) as never} emit={() => {}}>
        <Card element={mockElement("Card", { title: "Security", variant: "outlined" }) as never} emit={() => {}}>
          <Text element={mockElement("Text", { content: "Uses JWT verification with secret from environment variables.", variant: "caption" }) as never} emit={() => {}} />
        </Card>
        <Card element={mockElement("Card", { title: "Error Handling", variant: "outlined" }) as never} emit={() => {}}>
          <Text element={mockElement("Text", { content: "Returns 401 for missing tokens, 403 for invalid tokens.", variant: "caption" }) as never} emit={() => {}} />
        </Card>
        <Card element={mockElement("Card", { title: "Integration", variant: "outlined" }) as never} emit={() => {}}>
          <Text element={mockElement("Text", { content: "Passes user ID via headers to downstream handlers.", variant: "caption" }) as never} emit={() => {}} />
        </Card>
      </Grid>

      <Stack element={mockElement("Stack", { direction: "horizontal", gap: "sm", align: "center" }) as never} emit={() => {}}>
        <Button element={mockElement("Button", { label: "Copy Code", variant: "secondary" }) as never} emit={() => {}} />
        <Button element={mockElement("Button", { label: "Apply to Project", variant: "primary" }) as never} emit={() => {}} />
      </Stack>
    </Stack>
  ),
  name: "Code Generation Result",
};

/**
 * Simulates the streaming loading state where components receive incomplete data.
 */
export const StreamingLoadingStates: Story = {
  render: () => (
    <Stack element={mockElement("Stack", { direction: "vertical", gap: "md" }) as never} emit={() => {}}>
      <Text element={mockElement("Text", { content: "Streaming Loading States", variant: "heading" }) as never} emit={() => {}} />
      <Text element={mockElement("Text", { content: "These components show how the UI degrades gracefully when receiving incomplete data during streaming.", variant: "caption" }) as never} emit={() => {}} />

      <Grid element={mockElement("Grid", { columns: 2, gap: "md" }) as never} emit={() => {}}>
        <Card element={mockElement("Card", { title: "Table (Loading)", variant: "default" }) as never} emit={() => {}}>
          <DataTable element={mockElement("DataTable", { columns: [], rows: [] }) as never} emit={() => {}} />
        </Card>
        <Card element={mockElement("Card", { title: "Bar Chart (Loading)", variant: "default" }) as never} emit={() => {}}>
          <BarChartComponent element={mockElement("BarChart", { data: [], xKey: "x", yKeys: [], height: 200 }) as never} emit={() => {}} />
        </Card>
      </Grid>
    </Stack>
  ),
  name: "Streaming Loading States",
};

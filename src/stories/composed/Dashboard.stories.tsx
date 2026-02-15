import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "@/components/catalog/Card";
import { Grid } from "@/components/catalog/Grid";
import { Stack } from "@/components/catalog/Stack";
import { Text } from "@/components/catalog/Text";
import { Metric } from "@/components/catalog/Metric";
import { DataTable } from "@/components/catalog/DataTable";
import { BarChartComponent } from "@/components/catalog/BarChartComponent";
import { LineChartComponent } from "@/components/catalog/LineChartComponent";
import { PieChartComponent } from "@/components/catalog/PieChartComponent";
import { Badge } from "@/components/catalog/Badge";
import { Progress } from "@/components/catalog/Progress";
import { Divider } from "@/components/catalog/Divider";
import { mockElement } from "../helpers";

/**
 * Composed dashboard stories demonstrating how components work together
 * in real-world scenarios — the way the AI agent would generate them.
 */
const meta: Meta = {
  title: "Composed/Dashboard",
  decorators: [
    (Story) => (
      <div className="bg-zinc-950 text-zinc-100 antialiased p-6 max-w-5xl mx-auto">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

/**
 * A full analytics dashboard with KPI metrics, charts, and a data table.
 * This represents a typical AI-generated response to "Show me my analytics dashboard".
 */
export const AnalyticsDashboard: Story = {
  render: () => (
    <Stack element={mockElement("Stack", { direction: "vertical", gap: "lg" }) as never} emit={() => {}}>
      {/* Header */}
      <Stack element={mockElement("Stack", { direction: "horizontal", gap: "sm", align: "center" }) as never} emit={() => {}}>
        <Text element={mockElement("Text", { content: "Analytics Dashboard", variant: "heading" }) as never} emit={() => {}} />
        <Badge element={mockElement("Badge", { text: "Live", variant: "success" }) as never} emit={() => {}} />
      </Stack>

      {/* KPI Row */}
      <Grid element={mockElement("Grid", { columns: 4, gap: "md" }) as never} emit={() => {}}>
        <Metric element={mockElement("Metric", { label: "Total Users", value: "24,521", trend: "up", trendValue: "+12.5%", description: "vs. last month" }) as never} emit={() => {}} />
        <Metric element={mockElement("Metric", { label: "Revenue", value: "$128.4K", trend: "up", trendValue: "+8.2%", description: "vs. last month" }) as never} emit={() => {}} />
        <Metric element={mockElement("Metric", { label: "Conversion Rate", value: "3.24", unit: "%", trend: "down", trendValue: "-0.12%", description: "vs. last month" }) as never} emit={() => {}} />
        <Metric element={mockElement("Metric", { label: "Avg. Session", value: "4:32", unit: "min", trend: "up", trendValue: "+18s" }) as never} emit={() => {}} />
      </Grid>

      {/* Charts Row */}
      <Grid element={mockElement("Grid", { columns: 2, gap: "md" }) as never} emit={() => {}}>
        <Card element={mockElement("Card", { title: "Revenue Trend", variant: "default" }) as never} emit={() => {}}>
          <LineChartComponent
            element={mockElement("LineChart", {
              data: [
                { month: "Jan", revenue: 32000, target: 30000 },
                { month: "Feb", revenue: 28000, target: 32000 },
                { month: "Mar", revenue: 41000, target: 35000 },
                { month: "Apr", revenue: 38000, target: 38000 },
                { month: "May", revenue: 45000, target: 40000 },
                { month: "Jun", revenue: 52000, target: 42000 },
              ],
              xKey: "month",
              yKeys: ["revenue", "target"],
              colors: ["#6366f1", "#3f3f46"],
              height: 250,
            }) as never}
            emit={() => {}}
          />
        </Card>
        <Card element={mockElement("Card", { title: "Traffic Sources", variant: "default" }) as never} emit={() => {}}>
          <PieChartComponent
            element={mockElement("PieChart", {
              data: [
                { name: "Organic Search", value: 45 },
                { name: "Direct", value: 25 },
                { name: "Social", value: 18 },
                { name: "Referral", value: 12 },
              ],
              height: 250,
            }) as never}
            emit={() => {}}
          />
        </Card>
      </Grid>

      {/* Table */}
      <Card element={mockElement("Card", { title: "Top Pages", variant: "default" }) as never} emit={() => {}}>
        <DataTable
          element={mockElement("DataTable", {
            columns: [
              { key: "page", header: "Page" },
              { key: "views", header: "Views", align: "right" },
              { key: "unique", header: "Unique Visitors", align: "right" },
              { key: "bounce", header: "Bounce Rate", align: "right" },
              { key: "duration", header: "Avg. Duration", align: "right" },
            ],
            rows: [
              { page: "/", views: "52,341", unique: "34,210", bounce: "32%", duration: "3:12" },
              { page: "/products", views: "28,190", unique: "19,432", bounce: "45%", duration: "2:45" },
              { page: "/blog", views: "18,302", unique: "15,120", bounce: "58%", duration: "4:10" },
              { page: "/pricing", views: "12,450", unique: "10,200", bounce: "28%", duration: "5:02" },
              { page: "/docs", views: "9,821", unique: "7,300", bounce: "22%", duration: "6:45" },
            ],
          }) as never}
          emit={() => {}}
        />
      </Card>
    </Stack>
  ),
};

/**
 * A stock market dashboard showing financial data.
 * Simulates "Show me AAPL, GOOGL, MSFT stock data".
 */
export const StockMarketDashboard: Story = {
  render: () => (
    <Stack element={mockElement("Stack", { direction: "vertical", gap: "lg" }) as never} emit={() => {}}>
      <Text element={mockElement("Text", { content: "Stock Market Dashboard", variant: "heading" }) as never} emit={() => {}} />

      <Grid element={mockElement("Grid", { columns: 3, gap: "md" }) as never} emit={() => {}}>
        <Metric element={mockElement("Metric", { label: "AAPL", value: "$178.72", trend: "up", trendValue: "+1.24%", description: "Apple Inc." }) as never} emit={() => {}} />
        <Metric element={mockElement("Metric", { label: "GOOGL", value: "$141.80", trend: "down", trendValue: "-0.45%", description: "Alphabet Inc." }) as never} emit={() => {}} />
        <Metric element={mockElement("Metric", { label: "MSFT", value: "$378.91", trend: "up", trendValue: "+2.10%", description: "Microsoft Corp." }) as never} emit={() => {}} />
      </Grid>

      <Card element={mockElement("Card", { title: "Price History (30 Days)", variant: "default" }) as never} emit={() => {}}>
        <LineChartComponent
          element={mockElement("LineChart", {
            data: Array.from({ length: 30 }, (_, i) => ({
              day: `${i + 1}`,
              AAPL: 170 + Math.sin(i / 4) * 8 + i * 0.3,
              GOOGL: 135 + Math.cos(i / 3) * 5 + i * 0.2,
              MSFT: 365 + Math.sin(i / 5) * 12 + i * 0.5,
            })),
            xKey: "day",
            yKeys: ["AAPL", "GOOGL", "MSFT"],
            colors: ["#6366f1", "#ef4444", "#10b981"],
            height: 300,
          }) as never}
          emit={() => {}}
        />
      </Card>

      <Card element={mockElement("Card", { title: "Trading Volume", variant: "default" }) as never} emit={() => {}}>
        <BarChartComponent
          element={mockElement("BarChart", {
            data: [
              { stock: "AAPL", volume: 52300000 },
              { stock: "GOOGL", volume: 21100000 },
              { stock: "MSFT", volume: 28700000 },
            ],
            xKey: "stock",
            yKeys: ["volume"],
            colors: ["#8b5cf6"],
            height: 250,
          }) as never}
          emit={() => {}}
        />
      </Card>
    </Stack>
  ),
};

/**
 * A system monitoring dashboard with progress bars and status indicators.
 */
export const SystemMonitor: Story = {
  render: () => (
    <Stack element={mockElement("Stack", { direction: "vertical", gap: "lg" }) as never} emit={() => {}}>
      <Stack element={mockElement("Stack", { direction: "horizontal", gap: "sm", align: "center" }) as never} emit={() => {}}>
        <Text element={mockElement("Text", { content: "System Monitor", variant: "heading" }) as never} emit={() => {}} />
        <Badge element={mockElement("Badge", { text: "All Systems Operational", variant: "success" }) as never} emit={() => {}} />
      </Stack>

      <Grid element={mockElement("Grid", { columns: 2, gap: "md" }) as never} emit={() => {}}>
        <Card element={mockElement("Card", { title: "Resource Usage", variant: "default" }) as never} emit={() => {}}>
          <Stack element={mockElement("Stack", { direction: "vertical", gap: "md" }) as never} emit={() => {}}>
            <Progress element={mockElement("Progress", { value: 68, label: "CPU Usage", variant: "default" }) as never} emit={() => {}} />
            <Progress element={mockElement("Progress", { value: 82, label: "Memory", variant: "warning" }) as never} emit={() => {}} />
            <Progress element={mockElement("Progress", { value: 45, label: "Disk I/O", variant: "default" }) as never} emit={() => {}} />
            <Progress element={mockElement("Progress", { value: 23, label: "Network", variant: "success" }) as never} emit={() => {}} />
          </Stack>
        </Card>
        <Card element={mockElement("Card", { title: "Service Status", variant: "default" }) as never} emit={() => {}}>
          <DataTable
            element={mockElement("DataTable", {
              columns: [
                { key: "service", header: "Service" },
                { key: "status", header: "Status", align: "center" },
                { key: "uptime", header: "Uptime", align: "right" },
                { key: "latency", header: "Latency", align: "right" },
              ],
              rows: [
                { service: "API Gateway", status: "✅ Healthy", uptime: "99.99%", latency: "12ms" },
                { service: "Database", status: "✅ Healthy", uptime: "99.97%", latency: "3ms" },
                { service: "Cache", status: "⚠️ Degraded", uptime: "99.80%", latency: "45ms" },
                { service: "CDN", status: "✅ Healthy", uptime: "100%", latency: "8ms" },
              ],
            }) as never}
            emit={() => {}}
          />
        </Card>
      </Grid>

      <Divider element={mockElement("Divider", { label: "Historical" }) as never} emit={() => {}} />

      <Card element={mockElement("Card", { title: "Request Rate (24h)", variant: "default" }) as never} emit={() => {}}>
        <LineChartComponent
          element={mockElement("LineChart", {
            data: Array.from({ length: 24 }, (_, i) => ({
              hour: `${i}:00`,
              requests: Math.floor(1000 + Math.sin(i / 3) * 500 + Math.random() * 200),
              errors: Math.floor(10 + Math.random() * 15),
            })),
            xKey: "hour",
            yKeys: ["requests", "errors"],
            colors: ["#6366f1", "#ef4444"],
            height: 280,
          }) as never}
          emit={() => {}}
        />
      </Card>
    </Stack>
  ),
};

import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "@/components/catalog/Card";
import { Grid } from "@/components/catalog/Grid";
import { Stack } from "@/components/catalog/Stack";
import { Text } from "@/components/catalog/Text";
import { Metric } from "@/components/catalog/Metric";
import { LineChartComponent } from "@/components/catalog/LineChartComponent";
import { Badge } from "@/components/catalog/Badge";
import { mockElement } from "../helpers";

/**
 * Weather report compositions demonstrating how the AI generates
 * weather-related UI in response to tool calls like `get_weather`.
 */
const meta: Meta = {
  title: "Composed/Weather Report",
  decorators: [
    (Story) => (
      <div className="bg-zinc-950 text-zinc-100 antialiased p-6 max-w-3xl mx-auto">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

/**
 * A complete weather card for a single city, as the AI would render
 * after calling `get_weather` tool.
 */
export const SingleCity: Story = {
  render: () => (
    <Card element={mockElement("Card", { title: "Weather in San Francisco", subtitle: "Current conditions", variant: "elevated" }) as never} emit={() => {}}>
      <Stack element={mockElement("Stack", { direction: "vertical", gap: "md" }) as never} emit={() => {}}>
        <Grid element={mockElement("Grid", { columns: 3, gap: "sm" }) as never} emit={() => {}}>
          <Metric element={mockElement("Metric", { label: "Temperature", value: "68", unit: "°F" }) as never} emit={() => {}} />
          <Metric element={mockElement("Metric", { label: "Humidity", value: "72", unit: "%" }) as never} emit={() => {}} />
          <Metric element={mockElement("Metric", { label: "Wind", value: "12", unit: "mph" }) as never} emit={() => {}} />
        </Grid>
        <Stack element={mockElement("Stack", { direction: "horizontal", gap: "sm", align: "center" }) as never} emit={() => {}}>
          <Badge element={mockElement("Badge", { text: "Partly Cloudy", variant: "info" }) as never} emit={() => {}} />
          <Text element={mockElement("Text", { content: "High: 72°F  •  Low: 58°F", variant: "caption" }) as never} emit={() => {}} />
        </Stack>
      </Stack>
    </Card>
  ),
};

/**
 * Multi-city comparison — response to "Compare weather in Tokyo, London, New York".
 */
export const MultiCityComparison: Story = {
  render: () => (
    <Stack element={mockElement("Stack", { direction: "vertical", gap: "lg" }) as never} emit={() => {}}>
      <Text element={mockElement("Text", { content: "Weather Comparison", variant: "heading" }) as never} emit={() => {}} />

      <Grid element={mockElement("Grid", { columns: 3, gap: "md" }) as never} emit={() => {}}>
        {[
          { city: "Tokyo", temp: 75, humidity: 65, condition: "Sunny", variant: "success" as const },
          { city: "London", temp: 58, humidity: 88, condition: "Rainy", variant: "warning" as const },
          { city: "New York", temp: 45, humidity: 55, condition: "Clear", variant: "info" as const },
        ].map((w) => (
          <Card key={w.city} element={mockElement("Card", { title: w.city, variant: "default" }) as never} emit={() => {}}>
            <Stack element={mockElement("Stack", { direction: "vertical", gap: "sm" }) as never} emit={() => {}}>
              <Metric element={mockElement("Metric", { label: "Temperature", value: w.temp, unit: "°F" }) as never} emit={() => {}} />
              <Metric element={mockElement("Metric", { label: "Humidity", value: w.humidity, unit: "%" }) as never} emit={() => {}} />
              <Badge element={mockElement("Badge", { text: w.condition, variant: w.variant }) as never} emit={() => {}} />
            </Stack>
          </Card>
        ))}
      </Grid>

      <Card element={mockElement("Card", { title: "Temperature Forecast (5-Day)", variant: "default" }) as never} emit={() => {}}>
        <LineChartComponent
          element={mockElement("LineChart", {
            data: [
              { day: "Mon", Tokyo: 75, London: 58, "New York": 45 },
              { day: "Tue", Tokyo: 77, London: 55, "New York": 48 },
              { day: "Wed", Tokyo: 73, London: 60, "New York": 52 },
              { day: "Thu", Tokyo: 78, London: 57, "New York": 50 },
              { day: "Fri", Tokyo: 80, London: 62, "New York": 47 },
            ],
            xKey: "day",
            yKeys: ["Tokyo", "London", "New York"],
            colors: ["#ef4444", "#6366f1", "#10b981"],
            height: 280,
          }) as never}
          emit={() => {}}
        />
      </Card>
    </Stack>
  ),
};

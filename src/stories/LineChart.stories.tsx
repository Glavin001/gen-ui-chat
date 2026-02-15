import type { Meta, StoryObj } from "@storybook/react";
import { LineChartComponent } from "@/components/catalog/LineChartComponent";
import { mockElement } from "./helpers";

const meta: Meta = {
  title: "Catalog/LineChart",
  component: LineChartComponent as unknown as React.ComponentType,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="bg-zinc-950 text-zinc-100 antialiased p-6 max-w-2xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

const render = (args: Record<string, unknown>) => (
  <LineChartComponent element={mockElement("LineChart", args) as never} emit={() => {}} />
);

export const StockPrice: Story = {
  render,
  args: {
    title: "AAPL Stock Price (30 days)",
    data: Array.from({ length: 30 }, (_, i) => ({
      day: `Day ${i + 1}`,
      price: 170 + Math.sin(i / 3) * 8 + Math.random() * 4,
    })),
    xKey: "day",
    yKeys: ["price"],
    colors: ["#6366f1"],
    height: 350,
  },
};

export const MultiLine: Story = {
  render,
  args: {
    title: "Website Traffic",
    data: [
      { week: "W1", desktop: 4200, mobile: 2400, tablet: 800 },
      { week: "W2", desktop: 3800, mobile: 2800, tablet: 900 },
      { week: "W3", desktop: 5100, mobile: 3200, tablet: 1100 },
      { week: "W4", desktop: 4700, mobile: 3600, tablet: 1000 },
      { week: "W5", desktop: 5600, mobile: 4100, tablet: 1300 },
      { week: "W6", desktop: 5200, mobile: 4500, tablet: 1200 },
    ],
    xKey: "week",
    yKeys: ["desktop", "mobile", "tablet"],
    height: 320,
  },
};

export const TemperatureTrend: Story = {
  render,
  args: {
    title: "Temperature (°C)",
    data: [
      { time: "6am", temp: 12 },
      { time: "9am", temp: 15 },
      { time: "12pm", temp: 22 },
      { time: "3pm", temp: 25 },
      { time: "6pm", temp: 20 },
      { time: "9pm", temp: 16 },
    ],
    xKey: "time",
    yKeys: ["temp"],
    colors: ["#f59e0b"],
    height: 260,
  },
};

import type { Meta, StoryObj } from "@storybook/react";
import { Metric } from "@/components/catalog/Metric";
import { mockElement } from "./helpers";

const meta: Meta = {
  title: "Catalog/Metric",
  component: Metric as unknown as React.ComponentType,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    value: { control: "text" },
    unit: { control: "text" },
    trend: { control: "select", options: ["up", "down", "flat"] },
    trendValue: { control: "text" },
    description: { control: "text" },
  },
  decorators: [
    (Story) => (
      <div className="bg-zinc-950 text-zinc-100 antialiased p-6 max-w-xs">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

const render = (args: Record<string, unknown>) => (
  <Metric element={mockElement("Metric", args) as never} emit={() => {}} />
);

export const Default: Story = {
  render,
  args: {
    label: "Revenue",
    value: "$12,450",
    trend: "up",
    trendValue: "+14.2%",
    description: "vs. last month",
  },
};

export const TrendDown: Story = {
  render,
  args: {
    label: "Bounce Rate",
    value: "42.3",
    unit: "%",
    trend: "down",
    trendValue: "-3.1%",
  },
};

export const TrendFlat: Story = {
  render,
  args: {
    label: "Active Users",
    value: 8420,
    trend: "flat",
    trendValue: "0%",
    description: "No change this week",
  },
};

export const WithUnit: Story = {
  render,
  args: {
    label: "Temperature",
    value: 72,
    unit: "°F",
  },
};

export const LargeNumber: Story = {
  render,
  args: {
    label: "Total API Calls",
    value: "1,234,567",
    trend: "up",
    trendValue: "+28%",
    description: "Last 30 days",
  },
};

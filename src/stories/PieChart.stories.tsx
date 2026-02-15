import type { Meta, StoryObj } from "@storybook/react";
import { PieChartComponent } from "@/components/catalog/PieChartComponent";
import { mockElement } from "./helpers";

const meta: Meta = {
  title: "Catalog/PieChart",
  component: PieChartComponent as unknown as React.ComponentType,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="bg-zinc-950 text-zinc-100 antialiased p-6 max-w-xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

const render = (args: Record<string, unknown>) => (
  <PieChartComponent element={mockElement("PieChart", args) as never} emit={() => {}} />
);

export const MarketShare: Story = {
  render,
  args: {
    title: "Browser Market Share",
    data: [
      { name: "Chrome", value: 64 },
      { name: "Safari", value: 19 },
      { name: "Firefox", value: 4 },
      { name: "Edge", value: 4 },
      { name: "Other", value: 9 },
    ],
    height: 350,
  },
};

export const BudgetBreakdown: Story = {
  render,
  args: {
    title: "Monthly Budget",
    data: [
      { name: "Housing", value: 1500, color: "#6366f1" },
      { name: "Food", value: 600, color: "#10b981" },
      { name: "Transport", value: 300, color: "#f59e0b" },
      { name: "Entertainment", value: 200, color: "#ec4899" },
      { name: "Savings", value: 400, color: "#06b6d4" },
    ],
    height: 320,
  },
};

export const WithoutLabels: Story = {
  render,
  args: {
    title: "Revenue by Region",
    data: [
      { name: "North America", value: 45 },
      { name: "Europe", value: 30 },
      { name: "Asia Pacific", value: 20 },
      { name: "Other", value: 5 },
    ],
    showLabels: false,
    height: 300,
  },
};

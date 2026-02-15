import type { Meta, StoryObj } from "@storybook/react";
import { BarChartComponent } from "@/components/catalog/BarChartComponent";
import { mockElement } from "./helpers";

const meta: Meta = {
  title: "Catalog/BarChart",
  component: BarChartComponent as unknown as React.ComponentType,
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
  <BarChartComponent element={mockElement("BarChart", args) as never} emit={() => {}} />
);

export const MonthlySales: Story = {
  render,
  args: {
    title: "Monthly Sales",
    data: [
      { month: "Jan", revenue: 4000, expenses: 2400 },
      { month: "Feb", revenue: 3000, expenses: 1398 },
      { month: "Mar", revenue: 5000, expenses: 3200 },
      { month: "Apr", revenue: 4780, expenses: 2908 },
      { month: "May", revenue: 5890, expenses: 3800 },
      { month: "Jun", revenue: 6390, expenses: 3900 },
    ],
    xKey: "month",
    yKeys: ["revenue", "expenses"],
    height: 350,
  },
};

export const SingleSeries: Story = {
  render,
  args: {
    title: "Page Views",
    data: [
      { page: "Home", views: 12500 },
      { page: "Products", views: 8200 },
      { page: "Blog", views: 6100 },
      { page: "About", views: 3400 },
      { page: "Contact", views: 2100 },
    ],
    xKey: "page",
    yKeys: ["views"],
    colors: ["#06b6d4"],
    height: 300,
  },
};

export const CustomColors: Story = {
  render,
  args: {
    title: "Quarterly Performance",
    data: [
      { quarter: "Q1", actual: 120, target: 100 },
      { quarter: "Q2", actual: 135, target: 120 },
      { quarter: "Q3", actual: 110, target: 130 },
      { quarter: "Q4", actual: 160, target: 140 },
    ],
    xKey: "quarter",
    yKeys: ["actual", "target"],
    colors: ["#10b981", "#3f3f46"],
    height: 280,
  },
};

/** Simulates incomplete data during streaming */
export const LoadingState: Story = {
  render,
  args: {
    data: [],
    xKey: "x",
    yKeys: [],
    height: 300,
  },
  name: "Loading (Streaming)",
};

import type { Meta, StoryObj } from "@storybook/react";
import { DataTable } from "@/components/catalog/DataTable";
import { mockElement } from "./helpers";

const meta: Meta = {
  title: "Catalog/DataTable",
  component: DataTable as unknown as React.ComponentType,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="bg-zinc-950 text-zinc-100 antialiased p-6 max-w-3xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

const render = (args: Record<string, unknown>) => (
  <DataTable element={mockElement("DataTable", args) as never} emit={() => {}} />
);

export const StockData: Story = {
  render,
  args: {
    columns: [
      { key: "symbol", header: "Symbol" },
      { key: "name", header: "Company" },
      { key: "price", header: "Price", align: "right" },
      { key: "change", header: "Change", align: "right" },
      { key: "volume", header: "Volume", align: "right" },
    ],
    rows: [
      { symbol: "AAPL", name: "Apple Inc.", price: "$178.72", change: "+1.24%", volume: "52.3M" },
      { symbol: "GOOGL", name: "Alphabet Inc.", price: "$141.80", change: "-0.45%", volume: "21.1M" },
      { symbol: "MSFT", name: "Microsoft Corp.", price: "$378.91", change: "+2.10%", volume: "28.7M" },
      { symbol: "AMZN", name: "Amazon.com Inc.", price: "$185.07", change: "+0.82%", volume: "45.9M" },
      { symbol: "NVDA", name: "NVIDIA Corp.", price: "$875.38", change: "+3.54%", volume: "38.2M" },
    ],
    caption: "Top Tech Stocks — Real-time data",
  },
};

export const UserTable: Story = {
  render,
  args: {
    columns: [
      { key: "name", header: "Name" },
      { key: "email", header: "Email" },
      { key: "role", header: "Role" },
      { key: "status", header: "Status", align: "center" },
    ],
    rows: [
      { name: "Alice Johnson", email: "alice@example.com", role: "Admin", status: "Active" },
      { name: "Bob Smith", email: "bob@example.com", role: "Editor", status: "Active" },
      { name: "Charlie Brown", email: "charlie@example.com", role: "Viewer", status: "Inactive" },
    ],
  },
};

export const SingleRow: Story = {
  render,
  args: {
    columns: [
      { key: "metric", header: "Metric" },
      { key: "value", header: "Value", align: "right" },
    ],
    rows: [{ metric: "Uptime", value: "99.99%" }],
  },
};

/** Simulates incomplete data during streaming */
export const LoadingState: Story = {
  render,
  args: {
    columns: [],
    rows: [],
  },
  name: "Loading (Streaming)",
};

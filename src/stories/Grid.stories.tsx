import type { Meta, StoryObj } from "@storybook/react";
import { Grid } from "@/components/catalog/Grid";
import { Card } from "@/components/catalog/Card";
import { Metric } from "@/components/catalog/Metric";
import { mockElement } from "./helpers";

const meta: Meta = {
  title: "Catalog/Grid",
  component: Grid as unknown as React.ComponentType,
  tags: ["autodocs"],
  argTypes: {
    columns: { control: { type: "range", min: 1, max: 6 } },
    gap: { control: "select", options: ["none", "sm", "md", "lg"] },
  },
  decorators: [
    (Story) => (
      <div className="bg-zinc-950 text-zinc-100 antialiased p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

export const TwoColumns: Story = {
  render: (args: Record<string, unknown>) => (
    <Grid element={mockElement("Grid", { columns: 2, gap: "md", ...args }) as never} emit={() => {}}>
      {[1, 2, 3, 4].map((i) => (
        <Card
          key={i}
          element={mockElement("Card", { title: `Card ${i}`, variant: "default" }) as never}
          emit={() => {}}
        >
          <p className="text-sm text-zinc-400">Content for card {i}</p>
        </Card>
      ))}
    </Grid>
  ),
  args: { columns: 2, gap: "md" },
};

export const ThreeColumnMetrics: Story = {
  render: () => (
    <Grid element={mockElement("Grid", { columns: 3, gap: "md" }) as never} emit={() => {}}>
      <Metric element={mockElement("Metric", { label: "Users", value: "12.4K", trend: "up", trendValue: "+8%" }) as never} emit={() => {}} />
      <Metric element={mockElement("Metric", { label: "Revenue", value: "$48.2K", trend: "up", trendValue: "+12%" }) as never} emit={() => {}} />
      <Metric element={mockElement("Metric", { label: "Churn", value: "2.1%", trend: "down", trendValue: "-0.3%" }) as never} emit={() => {}} />
    </Grid>
  ),
  name: "3-Column Metrics",
};

export const FourColumns: Story = {
  render: () => (
    <Grid element={mockElement("Grid", { columns: 4, gap: "sm" }) as never} emit={() => {}}>
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="h-20 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm text-zinc-400">
          Item {i + 1}
        </div>
      ))}
    </Grid>
  ),
};

export const NoGap: Story = {
  render: () => (
    <Grid element={mockElement("Grid", { columns: 3, gap: "none" }) as never} emit={() => {}}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm text-zinc-400">
          No Gap {i}
        </div>
      ))}
    </Grid>
  ),
};

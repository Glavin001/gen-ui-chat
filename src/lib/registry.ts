"use client";

import type { ComponentRegistry } from "@json-render/react";
import { Card } from "@/components/catalog/Card";
import { Grid } from "@/components/catalog/Grid";
import { Stack } from "@/components/catalog/Stack";
import { Text } from "@/components/catalog/Text";
import { Metric } from "@/components/catalog/Metric";
import { DataTable } from "@/components/catalog/DataTable";
import { BarChartComponent } from "@/components/catalog/BarChartComponent";
import { LineChartComponent } from "@/components/catalog/LineChartComponent";
import { PieChartComponent } from "@/components/catalog/PieChartComponent";
import { Button } from "@/components/catalog/Button";
import { ImageComponent } from "@/components/catalog/Image";
import { Badge } from "@/components/catalog/Badge";
import { Divider } from "@/components/catalog/Divider";
import { CodeBlock } from "@/components/catalog/CodeBlock";
import { Progress } from "@/components/catalog/Progress";

/**
 * Component registry mapping catalog component types to React implementations.
 * Used by json-render's <Renderer /> to render specs.
 */
export const registry: ComponentRegistry = {
  Card,
  Grid,
  Stack,
  Text,
  Metric,
  DataTable,
  BarChart: BarChartComponent,
  LineChart: LineChartComponent,
  PieChart: PieChartComponent,
  Button,
  Image: ImageComponent,
  Badge,
  Divider,
  CodeBlock,
  Progress,
};

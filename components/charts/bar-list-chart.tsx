"use client";

import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const config = {
  value: { label: "Count", color: "var(--chart-1)" },
} satisfies ChartConfig;

export type BarListDatum = { label: string; value: number; color?: string };

/**
 * Horizontal bar chart for distributions (categories, tools, results).
 * Pass a per-datum `color` to encode meaning with the app's accent language;
 * otherwise the chart palette cycles.
 */
export function BarListChart({
  data,
  height = 240,
  showValues = true,
}: {
  data: BarListDatum[];
  height?: number;
  showValues?: boolean;
}) {
  return (
    <ChartContainer config={config} style={{ height }} className="w-full">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 8, right: showValues ? 28 : 16, top: 4, bottom: 4 }}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          tickLine={false}
          axisLine={false}
          width={120}
          fontSize={11}
          tickFormatter={(v: string) => (v.length > 18 ? `${v.slice(0, 17)}…` : v)}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color ?? PALETTE[i % PALETTE.length]} />
          ))}
          {showValues && (
            <LabelList
              dataKey="value"
              position="right"
              offset={8}
              className="fill-muted-foreground"
              fontSize={11}
            />
          )}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

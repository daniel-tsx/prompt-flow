"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const config = {
  score: { label: "Avg result", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function QualityTrendChart({
  data,
}: {
  data: { week: string; score: number | null; runs: number }[];
}) {
  return (
    <ChartContainer config={config} className="h-56 w-full">
      <AreaChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="fillScore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.25} />
        <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
        <YAxis domain={[0, 100]} tickLine={false} axisLine={false} width={28} fontSize={11} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          type="monotone"
          dataKey="score"
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill="url(#fillScore)"
          connectNulls
          dot={{ r: 2.5, fill: "var(--chart-1)" }}
        />
      </AreaChart>
    </ChartContainer>
  );
}

"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const config = {
  score: { label: "Avg result", color: "var(--chart-1)" },
  runs: { label: "Runs", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

/**
 * Quality (avg run result, 0-100) as the headline area, with weekly run
 * volume as faint context bars behind it — so a high score backed by one
 * run reads differently from one backed by twenty.
 */
export function QualityTrendChart({
  data,
}: {
  data: { week: string; score: number | null; runs: number }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4 px-1 text-[0.7rem] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[var(--chart-1)]" /> Avg result
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-[2px] bg-muted-foreground/40" /> Run volume
        </span>
      </div>
      <ChartContainer config={config} className="h-52 w-full">
        <ComposedChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
          <defs>
            <linearGradient id="fillScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.25} />
          <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
          <YAxis
            yAxisId="score"
            domain={[0, 100]}
            tickLine={false}
            axisLine={false}
            width={28}
            fontSize={11}
          />
          <YAxis yAxisId="runs" hide domain={[0, (max: number) => Math.max(4, max * 4)]} />
          <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
          <Bar
            yAxisId="runs"
            dataKey="runs"
            barSize={18}
            fill="var(--muted-foreground)"
            fillOpacity={0.16}
            radius={[3, 3, 0, 0]}
          />
          <Area
            yAxisId="score"
            type="monotone"
            dataKey="score"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="url(#fillScore)"
            connectNulls
            dot={{ r: 2.5, fill: "var(--chart-1)" }}
            activeDot={{ r: 4 }}
          />
        </ComposedChart>
      </ChartContainer>
    </div>
  );
}

import { accentDot, accentHex, type Accent } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type CompositionSegment = { label: string; value: number; accent: Accent };

/**
 * A single segmented "share of the whole" bar over a ranked legend with
 * counts and percentages — the app's standard way to show a distribution
 * as composition rather than a row of bars.
 */
export function CompositionBar({
  segments,
  total,
  className,
}: {
  segments: CompositionSegment[];
  total?: number;
  className?: string;
}) {
  const sum = total ?? segments.reduce((s, x) => s + x.value, 0);
  const safeTotal = Math.max(1, sum);
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        {segments.map((d) => (
          <div
            key={d.label}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{ width: `${(d.value / safeTotal) * 100}%`, backgroundColor: accentHex[d.accent] }}
            title={`${d.label}: ${d.value}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-x-5 gap-y-1.5 sm:grid-cols-2">
        {segments.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-sm">
            <span className={cn("size-2 shrink-0 rounded-full", accentDot[d.accent])} />
            <span className="truncate">{d.label}</span>
            <span className="ml-auto font-medium tabular-nums">{d.value}</span>
            <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
              {Math.round((d.value / safeTotal) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

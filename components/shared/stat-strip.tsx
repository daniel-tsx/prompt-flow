import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type Stat = { label: string; value: React.ReactNode; tone?: string };

/** A single labelled readout in an instrument strip. */
export function StatTile({ label, value, tone }: Stat) {
  return (
    <div className="flex flex-col gap-1 p-4">
      <span className="text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className={cn("text-xl font-semibold leading-none tabular-nums", tone)}>{value}</span>
    </div>
  );
}

/** A row of instrument readouts in one divided card — the app's standard list-page summary. */
export function StatStrip({ items, className }: { items: Stat[]; className?: string }) {
  return (
    <Card
      className={cn(
        "grid grid-cols-2 gap-0 divide-x divide-y divide-border p-0 sm:grid-cols-4 sm:divide-y-0",
        className,
      )}
    >
      {items.map((s) => (
        <StatTile key={s.label} {...s} />
      ))}
    </Card>
  );
}

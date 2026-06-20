import Link from "next/link";
import { Card } from "@/components/ui/card";
import { accentBadge, accentText, type Accent } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "violet",
  hint,
  href,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  accent?: Accent;
  hint?: string;
  href?: string;
}) {
  const body = (
    <Card
      className={cn(
        "gap-0 p-4 transition-colors",
        href && "hover:border-primary/40 hover:bg-card/80",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-md border",
            accentBadge[accent],
          )}
        >
          <Icon className="size-3.5" />
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        {hint && <span className={cn("text-xs", accentText[accent])}>{hint}</span>}
      </div>
    </Card>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}

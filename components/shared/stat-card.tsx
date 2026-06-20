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
        "gap-0 p-4 transition-all duration-200",
        href && "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-lg border",
            accentBadge[accent],
          )}
        >
          <Icon className="size-3.5" />
        </span>
      </div>
      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="text-[1.7rem] font-semibold leading-none tracking-tight tabular-nums">
          {value}
        </span>
        {hint && <span className={cn("text-xs", accentText[accent])}>{hint}</span>}
      </div>
    </Card>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}

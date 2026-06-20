import { accentText, accentBadge } from "@/lib/constants";
import { scoreTier, TIER_ACCENT } from "@/lib/scoring";
import { cn } from "@/lib/utils";

/** Compact pill showing a 0-100 score with tier color. */
export function ScoreBadge({
  label,
  score,
  className,
}: {
  label: string;
  score: number | null | undefined;
  className?: string;
}) {
  const accent = TIER_ACCENT[scoreTier(score)];
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs",
        accentBadge[accent],
        className,
      )}
    >
      <span className="opacity-80">{label}</span>
      <span className="font-semibold tabular-nums">{score ?? "—"}</span>
    </div>
  );
}

/** A small score readout used in dense rows. */
export function ScoreInline({
  score,
  className,
}: {
  score: number | null | undefined;
  className?: string;
}) {
  const accent = TIER_ACCENT[scoreTier(score)];
  return (
    <span className={cn("font-semibold tabular-nums", accentText[accent], className)}>
      {score ?? "—"}
    </span>
  );
}

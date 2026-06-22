import Link from "next/link";
import { ListChecks, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OptionBadge } from "@/components/shared/option-badge";
import { ScoreInline } from "@/components/shared/score-badge";
import { WorkflowFavoriteToggle } from "@/components/workflows/workflow-favorite-toggle";
import { WorkflowActions } from "@/components/workflows/workflow-actions";
import { accentHex, workflowStatusMap, workflowTypeMap } from "@/lib/constants";
import { scoreTier, TIER_ACCENT } from "@/lib/scoring";
import type { WorkflowListItem } from "@/db/queries/workflows";

export function WorkflowCard({ workflow }: { workflow: WorkflowListItem }) {
  const maturityAccent = TIER_ACCENT[scoreTier(workflow.maturity)];
  return (
    <Card className="group gap-0 p-4 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/workflows/${workflow.slug}`} className="min-w-0 flex-1">
          <h3 className="truncate font-medium leading-snug transition-colors group-hover:text-primary">
            {workflow.title}
          </h3>
          {workflow.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{workflow.description}</p>
          )}
        </Link>
        <div className="flex shrink-0 items-center gap-0.5">
          <WorkflowFavoriteToggle id={workflow.id} favorite={workflow.favorite} />
          <WorkflowActions id={workflow.id} slug={workflow.slug} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <OptionBadge option={workflowTypeMap[workflow.workflowType]} />
        <OptionBadge option={workflowStatusMap[workflow.status]} withIcon={false} />
        {workflow.toolsUsed.slice(0, 2).map((t) => (
          <Badge key={t} variant="secondary" className="font-normal">{t}</Badge>
        ))}
        {workflow.projectName && (
          <Badge variant="outline" className="gap-1.5 font-normal">
            <span className="size-2 rounded-full" style={{ backgroundColor: workflow.projectColor ?? "#8b5cf6" }} />
            {workflow.projectName}
          </Badge>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <ListChecks className="size-3.5" /> {workflow.stepCount} steps
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="size-3.5" /> {workflow.linkedPromptCount} prompts
          </span>
        </div>
        <span className="flex items-center gap-1.5">
          Maturity
          <span className="hidden h-1.5 w-12 overflow-hidden rounded-full bg-muted sm:block">
            <span
              className="block h-full rounded-full"
              style={{ width: `${workflow.maturity}%`, backgroundColor: accentHex[maturityAccent] }}
            />
          </span>
          <ScoreInline score={workflow.maturity} />
        </span>
      </div>
    </Card>
  );
}

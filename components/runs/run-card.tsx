"use client";

import Link from "next/link";
import { Clock, Flag, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OptionBadge } from "@/components/shared/option-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { runResultMap, targetToolMap } from "@/lib/constants";
import { deleteRun } from "@/lib/actions/runs";
import { formatDate, formatMinutes } from "@/lib/utils";
import type { RunListItem } from "@/db/queries/runs";

export function RunCard({
  run,
  showPrompt = false,
}: {
  run: RunListItem;
  showPrompt?: boolean;
}) {
  return (
    <Card className="gap-0 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <OptionBadge option={runResultMap[run.resultStatus]} withIcon={false} />
            <span className="font-medium">{run.title}</span>
          </div>
          {showPrompt && run.promptTitle && (
            <Link
              href={`/prompts/${run.promptSlug}`}
              className="text-xs text-muted-foreground hover:text-primary"
            >
              {run.promptTitle}
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatDate(run.date)}</span>
          <ConfirmDialog
            title="Delete this run?"
            confirmLabel="Delete"
            onConfirm={async () => {
              const res = await deleteRun(run.id);
              toast[res.ok ? "success" : "error"](res.ok ? "Run deleted" : res.error);
            }}
            trigger={
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                <Trash2 className="size-3.5" />
              </Button>
            }
          />
        </div>
      </div>

      {run.taskDescription && <p className="mt-2 text-sm">{run.taskDescription}</p>}
      {run.outputSummary && (
        <p className="mt-1 text-sm text-muted-foreground">{run.outputSummary}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <OptionBadge option={targetToolMap[run.toolUsed]} />
        {run.modelUsed && (
          <Badge variant="secondary" className="font-mono font-normal">
            {run.modelUsed}
          </Badge>
        )}
        {run.projectName && (
          <Badge variant="outline" className="font-normal">
            {run.projectName}
          </Badge>
        )}
        {run.estimatedTimeSavedMinutes != null && run.estimatedTimeSavedMinutes > 0 && (
          <Badge variant="outline" className="gap-1 border-emerald-500/25 bg-emerald-500/10 font-normal text-emerald-300">
            <Zap className="size-3" /> {formatMinutes(run.estimatedTimeSavedMinutes)} saved
          </Badge>
        )}
        {run.timeSpentMinutes != null && run.timeSpentMinutes > 0 && (
          <Badge variant="outline" className="gap-1 font-normal text-muted-foreground">
            <Clock className="size-3" /> {formatMinutes(run.timeSpentMinutes)}
          </Badge>
        )}
      </div>

      {run.problems.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {run.problems.map((p) => (
            <Badge key={p} variant="outline" className="border-rose-500/25 bg-rose-500/10 font-normal text-rose-300">
              {p}
            </Badge>
          ))}
        </div>
      )}

      {run.lessonsLearned && (
        <p className="mt-2 text-sm">
          <span className="text-muted-foreground">Lesson: </span>
          {run.lessonsLearned}
        </p>
      )}
      {run.followUpNeeded && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-amber-300">
          <Flag className="size-3.5" /> {run.followUpNote || "Needs follow-up"}
        </p>
      )}
    </Card>
  );
}

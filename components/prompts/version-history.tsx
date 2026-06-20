"use client";

import { useState, useTransition } from "react";
import { Check, GitCompare, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/shared/copy-button";
import { ScoreInline } from "@/components/shared/score-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  deletePromptVersion,
  setCurrentVersion,
} from "@/lib/actions/prompts";
import { lineDiff, diffStats } from "@/lib/diff";
import { formatDate, cn } from "@/lib/utils";
import type { PromptVersion } from "@/db/schema";

export function VersionHistory({
  promptId,
  versions,
  currentVersionId,
  currentText,
}: {
  promptId: string;
  versions: PromptVersion[];
  currentVersionId: string | null;
  currentText: string;
}) {
  const [compareId, setCompareId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  if (versions.length === 0) {
    return <p className="text-sm text-muted-foreground">No versions yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {versions.map((v) => {
        const isCurrent = v.id === currentVersionId;
        const showDiff = compareId === v.id;
        const diff = showDiff ? lineDiff(v.promptText, currentText) : [];
        const stats = showDiff ? diffStats(diff) : null;

        return (
          <Card key={v.id} className="gap-0 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant={isCurrent ? "default" : "secondary"} className="font-mono">
                  v{v.versionNumber}
                </Badge>
                {isCurrent && (
                  <Badge variant="outline" className="border-emerald-500/25 bg-emerald-500/10 text-emerald-300">
                    <Star className="size-3 fill-current" /> Current
                  </Badge>
                )}
                <span className="text-sm font-medium">{v.title}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {v.qualityScore != null && (
                  <span>
                    Quality <ScoreInline score={v.qualityScore * 10} />
                  </span>
                )}
                <span>{formatDate(v.createdAt)}</span>
              </div>
            </div>

            {v.changeSummary && (
              <p className="mt-2 text-sm">
                <span className="text-muted-foreground">Changed: </span>
                {v.changeSummary}
              </p>
            )}
            {v.reasonForChange && (
              <p className="text-sm text-muted-foreground">Why: {v.reasonForChange}</p>
            )}
            {v.resultNotes && (
              <p className="mt-1 text-sm text-muted-foreground">Result: {v.resultNotes}</p>
            )}

            {showDiff ? (
              <div className="mt-3 overflow-x-auto rounded-md border bg-muted/30 p-3 font-mono text-xs leading-relaxed">
                <div className="mb-2 flex gap-3 text-[0.7rem] text-muted-foreground">
                  <span className="text-rose-300">− {stats?.removed} removed</span>
                  <span className="text-emerald-300">+ {stats?.added} added</span>
                  <span>(this version → current)</span>
                </div>
                {diff.map((line, i) => (
                  <div
                    key={i}
                    className={cn(
                      "whitespace-pre-wrap px-1",
                      line.type === "add" && "bg-emerald-500/10 text-emerald-200",
                      line.type === "remove" && "bg-rose-500/10 text-rose-200",
                      line.type === "same" && "text-muted-foreground",
                    )}
                  >
                    {line.type === "add" ? "+ " : line.type === "remove" ? "− " : "  "}
                    {line.text || " "}
                  </div>
                ))}
              </div>
            ) : (
              <pre className="mt-3 max-h-40 overflow-auto rounded-md border bg-muted/30 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                {v.promptText || "(empty)"}
              </pre>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <CopyButton text={v.promptText} variant="ghost" size="sm" label="Copy" />
              {!isCurrent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCompareId(showDiff ? null : v.id)}
                >
                  <GitCompare className="size-3.5" /> {showDiff ? "Hide diff" : "Compare to current"}
                </Button>
              )}
              {!isCurrent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    startTransition(async () => {
                      const res = await setCurrentVersion(promptId, v.id);
                      toast[res.ok ? "success" : "error"](
                        res.ok ? `v${v.versionNumber} is now current` : res.error,
                      );
                    })
                  }
                >
                  <Check className="size-3.5" /> Set as current
                </Button>
              )}
              {versions.length > 1 && (
                <ConfirmDialog
                  title="Delete this version?"
                  description="This removes the version permanently."
                  confirmLabel="Delete"
                  onConfirm={async () => {
                    const res = await deletePromptVersion(promptId, v.id);
                    toast[res.ok ? "success" : "error"](
                      res.ok ? "Version deleted" : res.error,
                    );
                  }}
                  trigger={
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <Trash2 className="size-3.5" />
                    </Button>
                  }
                />
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

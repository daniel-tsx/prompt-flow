"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, CircleDot, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { CopyButton } from "@/components/shared/copy-button";
import { Markdown } from "@/components/markdown";
import { OptionBadge } from "@/components/shared/option-badge";
import { promptCategoryMap } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type DetailStep = {
  id: string;
  title: string;
  description: string | null;
  instruction: string | null;
  expectedOutput: string | null;
  checklist: string[];
  linkedPrompt: {
    title: string;
    slug: string;
    promptText: string;
    category: string;
  } | null;
};

export function WorkflowSteps({ steps }: { steps: DetailStep[] }) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const completed = steps.filter((s) => done[s.id]).length;
  const progress = steps.length ? (completed / steps.length) * 100 : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-2.5">
        <CircleDot className="size-4 text-primary" />
        <span className="text-sm font-medium">Run progress</span>
        <Progress value={progress} className="flex-1" />
        <span className="text-sm tabular-nums text-muted-foreground">
          {completed}/{steps.length}
        </span>
      </div>

      {steps.map((step, i) => {
        const isDone = !!done[step.id];
        return (
          <Card key={step.id} className={cn("gap-0 p-4 transition-opacity", isDone && "opacity-60")}>
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => setDone((d) => ({ ...d, [step.id]: !d[step.id] }))}
                className={cn(
                  "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                  isDone
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                    : "border-border bg-muted text-muted-foreground hover:border-primary/40",
                )}
                aria-label={isDone ? "Mark incomplete" : "Mark complete"}
              >
                {isDone ? <Check className="size-4" /> : i + 1}
              </button>

              <div className="min-w-0 flex-1">
                <h3 className={cn("font-medium", isDone && "line-through")}>{step.title}</h3>
                {step.description && (
                  <p className="mt-0.5 text-sm text-muted-foreground">{step.description}</p>
                )}

                {step.instruction && (
                  <div className="mt-2 rounded-md border bg-muted/30 px-3 py-2">
                    <Markdown>{step.instruction}</Markdown>
                  </div>
                )}

                {step.linkedPrompt && (
                  <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2">
                    <Sparkles className="size-4 text-primary" />
                    <Link
                      href={`/prompts/${step.linkedPrompt.slug}`}
                      className="text-sm font-medium hover:text-primary"
                    >
                      {step.linkedPrompt.title}
                    </Link>
                    <OptionBadge option={promptCategoryMap[step.linkedPrompt.category]} />
                    <CopyButton
                      text={step.linkedPrompt.promptText}
                      label="Copy prompt"
                      size="sm"
                      variant="outline"
                      className="ml-auto"
                    />
                  </div>
                )}

                {step.expectedOutput && (
                  <p className="mt-2 text-sm">
                    <span className="text-muted-foreground">Expected output: </span>
                    {step.expectedOutput}
                  </p>
                )}

                {step.checklist.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1.5">
                    {step.checklist.map((item, j) => (
                      <ChecklistItem key={j} label={item} />
                    ))}
                  </div>
                )}

                {!step.instruction && !step.linkedPrompt && !step.expectedOutput && step.checklist.length === 0 && (
                  <Badge variant="secondary" className="mt-2 font-normal">No details</Badge>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function ChecklistItem({ label }: { label: string }) {
  const [checked, setChecked] = useState(false);
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <Checkbox checked={checked} onCheckedChange={(c) => setChecked(!!c)} />
      <span className={cn(checked && "text-muted-foreground line-through")}>{label}</span>
    </label>
  );
}

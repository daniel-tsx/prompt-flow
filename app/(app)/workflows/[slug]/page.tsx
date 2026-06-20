import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  CircleSlash,
  FolderKanban,
  Pencil,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/shared/page-header";
import { OptionBadge } from "@/components/shared/option-badge";
import { ScoreBadge } from "@/components/shared/score-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { WorkflowFavoriteToggle } from "@/components/workflows/workflow-favorite-toggle";
import { WorkflowActions } from "@/components/workflows/workflow-actions";
import { WorkflowSteps } from "@/components/workflows/workflow-steps";
import { LinkedNoteComposer } from "@/components/notes/linked-note-composer";
import { getWorkflowBySlug } from "@/db/queries/workflows";
import { noteTypeMap, workflowStatusMap, workflowTypeMap } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const workflow = await getWorkflowBySlug(slug);
  return { title: workflow?.title ?? "Workflow" };
}

export default async function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const workflow = await getWorkflowBySlug(slug);
  if (!workflow) notFound();

  return (
    <PageContainer>
      <Button render={<Link href="/workflows" />} variant="ghost" size="sm" className="mb-3">
        <ArrowLeft className="size-4" /> Workflows
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <WorkflowFavoriteToggle id={workflow.id} favorite={workflow.favorite} size="icon" />
            <h1 className="text-xl font-semibold tracking-tight text-balance">{workflow.title}</h1>
          </div>
          {workflow.description && (
            <p className="mt-1 text-sm text-muted-foreground">{workflow.description}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <OptionBadge option={workflowTypeMap[workflow.workflowType]} />
            <OptionBadge option={workflowStatusMap[workflow.status]} withIcon={false} />
            {workflow.toolsUsed.map((t) => (
              <Badge key={t} variant="secondary" className="font-normal">{t}</Badge>
            ))}
            {workflow.project && (
              <Link href={`/projects/${workflow.project.slug}`}>
                <Badge variant="outline" className="gap-1.5 font-normal">
                  <span className="size-2 rounded-full" style={{ backgroundColor: workflow.project.color }} />
                  {workflow.project.name}
                </Badge>
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ScoreBadge label="Maturity" score={workflow.maturity} />
          <Button render={<Link href={`/workflows/${workflow.slug}/edit`} />} variant="outline" size="sm">
            <Pencil className="size-4" /> Edit
          </Button>
          <WorkflowActions id={workflow.id} slug={workflow.slug} redirectOnDelete="/workflows" />
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            Steps ({workflow.steps.length})
          </h2>
          {workflow.steps.length === 0 ? (
            <EmptyState icon={Target} title="No steps yet" description="Edit this workflow to add steps." />
          ) : (
            <WorkflowSteps
              steps={workflow.steps.map((s) => ({
                id: s.id,
                title: s.title,
                description: s.description,
                instruction: s.instruction,
                expectedOutput: s.expectedOutput,
                checklist: s.checklist,
                linkedPrompt: s.linkedPrompt
                  ? {
                      title: s.linkedPrompt.title,
                      slug: s.linkedPrompt.slug,
                      promptText: s.linkedPrompt.promptText,
                      category: s.linkedPrompt.category,
                    }
                  : null,
              }))}
            />
          )}

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Related notes</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <LinkedNoteComposer relatedWorkflowId={workflow.id} />
              {workflow.relatedNotes.map((n) => (
                <div key={n.id} className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
                  <span className="text-sm">{n.title}</span>
                  <OptionBadge option={noteTypeMap[n.noteType]} withIcon={false} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          {workflow.outcome && (
            <GuidanceCard icon={Target} title="Outcome" tone="violet">
              {workflow.outcome}
            </GuidanceCard>
          )}
          {workflow.whenToUse && (
            <GuidanceCard icon={CheckCircle2} title="When to use" tone="emerald">
              {workflow.whenToUse}
            </GuidanceCard>
          )}
          {workflow.whenNotToUse && (
            <GuidanceCard icon={CircleSlash} title="When not to use" tone="rose">
              {workflow.whenNotToUse}
            </GuidanceCard>
          )}
          {workflow.notes && (
            <GuidanceCard icon={Pencil} title="Notes" tone="slate">
              {workflow.notes}
            </GuidanceCard>
          )}
          {workflow.project ? (
            <Link href={`/projects/${workflow.project.slug}`}>
              <Card className="gap-1 p-4 transition-colors hover:border-primary/40">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full" style={{ backgroundColor: workflow.project.color }} />
                  <CardTitle className="text-sm">{workflow.project.name}</CardTitle>
                </div>
                {workflow.project.description && (
                  <p className="text-xs text-muted-foreground">{workflow.project.description}</p>
                )}
              </Card>
            </Link>
          ) : (
            <EmptyState icon={FolderKanban} title="No project linked" />
          )}
        </div>
      </div>
    </PageContainer>
  );
}

const TONE: Record<string, string> = {
  violet: "text-violet-300",
  emerald: "text-emerald-300",
  rose: "text-rose-300",
  slate: "text-slate-300",
};

function GuidanceCard({
  icon: Icon,
  title,
  tone,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  tone: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="gap-1 p-4">
      <div className={`flex items-center gap-2 text-sm font-medium ${TONE[tone]}`}>
        <Icon className="size-4" /> {title}
      </div>
      <p className="text-sm text-muted-foreground">{children}</p>
    </Card>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  Clock,
  FolderKanban,
  GitBranch,
  Pencil,
  Plus,
  Workflow,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer } from "@/components/shared/page-header";
import { OptionBadge } from "@/components/shared/option-badge";
import { ScoreBadge } from "@/components/shared/score-badge";
import { CopyButton } from "@/components/shared/copy-button";
import { EmptyState } from "@/components/shared/empty-state";
import { Markdown } from "@/components/markdown";
import { FavoriteToggle } from "@/components/prompts/favorite-toggle";
import { PromptActions } from "@/components/prompts/prompt-actions";
import { VersionDialog } from "@/components/prompts/version-dialog";
import { VersionHistory } from "@/components/prompts/version-history";
import { RunDialog } from "@/components/runs/run-dialog";
import { RunCard } from "@/components/runs/run-card";
import { LinkedNoteComposer } from "@/components/notes/linked-note-composer";
import { getPromptBySlug } from "@/db/queries/prompts";
import { listProjectsForPicker } from "@/db/queries/projects";
import {
  noteTypeMap,
  promptCategoryMap,
  promptIntentMap,
  promptStatusMap,
  targetToolMap,
  workflowTypeMap,
} from "@/lib/constants";
import { formatMinutes, relativeTime } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const prompt = await getPromptBySlug(slug);
  return { title: prompt?.title ?? "Prompt" };
}

export default async function PromptDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { slug } = await params;
  const { tab } = await searchParams;
  const [prompt, projects] = await Promise.all([
    getPromptBySlug(slug),
    listProjectsForPicker(),
  ]);
  if (!prompt) notFound();

  const totalSaved = prompt.runs.reduce(
    (s, r) => s + (r.estimatedTimeSavedMinutes ?? 0),
    0,
  );
  const workflowsLinked = new Map(
    prompt.linkedSteps.map((s) => [s.workflowId, s]),
  );

  const defaultTab = ["overview", "current", "versions", "runs", "notes", "workflows", "project"].includes(
    tab ?? "",
  )
    ? tab!
    : "overview";

  return (
    <PageContainer>
      <Button render={<Link href="/prompts" />} variant="ghost" size="sm" className="mb-3">
        <ArrowLeft className="size-4" /> Prompts
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <FavoriteToggle id={prompt.id} favorite={prompt.favorite} size="icon" />
            <h1 className="text-xl font-semibold tracking-tight text-balance">{prompt.title}</h1>
          </div>
          {prompt.description && (
            <p className="mt-1 text-sm text-muted-foreground">{prompt.description}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <OptionBadge option={promptCategoryMap[prompt.category]} />
            <OptionBadge option={promptIntentMap[prompt.intent]} />
            <OptionBadge option={targetToolMap[prompt.targetTool]} />
            <OptionBadge option={promptStatusMap[prompt.status]} withIcon={false} />
            {prompt.reusable && <Badge variant="secondary" className="font-normal">Reusable</Badge>}
            {prompt.targetModel && (
              <Badge variant="outline" className="font-mono font-normal">{prompt.targetModel}</Badge>
            )}
            {prompt.project && (
              <Link href={`/projects/${prompt.project.slug}`}>
                <Badge variant="outline" className="gap-1.5 font-normal">
                  <span className="size-2 rounded-full" style={{ backgroundColor: prompt.project.color }} />
                  {prompt.project.name}
                </Badge>
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <CopyButton text={prompt.promptText} label="Copy prompt" />
          <VersionDialog
            promptId={prompt.id}
            currentTitle={prompt.title}
            currentText={prompt.promptText}
            trigger={
              <Button variant="outline" size="sm">
                <GitBranch className="size-4" /> New version
              </Button>
            }
          />
          <RunDialog
            defaultPromptId={prompt.id}
            lockPrompt
            prompts={[{ id: prompt.id, title: prompt.title }]}
            projects={projects}
            versions={prompt.versions.map((v) => ({ id: v.id, versionNumber: v.versionNumber, title: v.title }))}
            defaultTool={prompt.targetTool}
            trigger={
              <Button size="sm">
                <Activity className="size-4" /> Record run
              </Button>
            }
          />
          <Button render={<Link href={`/prompts/${prompt.slug}/edit`} />} variant="outline" size="icon-sm">
            <Pencil className="size-4" />
          </Button>
          <PromptActions
            id={prompt.id}
            slug={prompt.slug}
            promptText={prompt.promptText}
            redirectOnDelete="/prompts"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <ScoreBadge label="Reliability" score={prompt.reliability} />
        <ScoreBadge label="Usefulness" score={prompt.usefulness} />
        {prompt.qualityScore != null && <ScoreBadge label="Quality" score={prompt.qualityScore * 10} />}
        {prompt.clarityScore != null && <ScoreBadge label="Clarity" score={prompt.clarityScore * 10} />}
        {prompt.resultScore != null && <ScoreBadge label="Result" score={prompt.resultScore * 10} />}
        {prompt.costEfficiencyScore != null && <ScoreBadge label="Cost eff." score={prompt.costEfficiencyScore * 10} />}
      </div>

      <Tabs defaultValue={defaultTab} className="mt-5 gap-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="current">Current Prompt</TabsTrigger>
          <TabsTrigger value="versions">Versions ({prompt.versions.length})</TabsTrigger>
          <TabsTrigger value="runs">Runs ({prompt.runs.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes ({prompt.relatedNotes.length})</TabsTrigger>
          <TabsTrigger value="workflows">Workflows ({workflowsLinked.size})</TabsTrigger>
          <TabsTrigger value="project">Project</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat icon={Activity} label="Runs" value={prompt.runs.length} />
            <MiniStat icon={GitBranch} label="Versions" value={prompt.versions.length} />
            <MiniStat icon={Zap} label="Time saved" value={formatMinutes(totalSaved)} />
            <MiniStat
              icon={Clock}
              label="Last used"
              value={prompt.runs[0] ? relativeTime(prompt.runs[0].date) : "—"}
            />
          </div>
          {prompt.notes && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Working notes</CardTitle></CardHeader>
              <CardContent><Markdown>{prompt.notes}</Markdown></CardContent>
            </Card>
          )}
          {prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {prompt.tags.map((t) => (
                <Link key={t} href={`/prompts?search=${encodeURIComponent(t)}`}>
                  <Badge variant="secondary" className="font-normal">#{t}</Badge>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="current">
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Current prompt</CardTitle>
              <CopyButton text={prompt.promptText} size="sm" variant="ghost" />
            </CardHeader>
            <CardContent>
              {prompt.promptText ? (
                <Markdown>{prompt.promptText}</Markdown>
              ) : (
                <p className="text-sm text-muted-foreground">This prompt has no text yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions">
          <div className="mb-3 flex justify-end">
            <VersionDialog
              promptId={prompt.id}
              currentTitle={prompt.title}
              currentText={prompt.promptText}
              trigger={<Button size="sm"><Plus className="size-4" /> New version</Button>}
            />
          </div>
          <VersionHistory
            promptId={prompt.id}
            versions={prompt.versions}
            currentVersionId={prompt.currentVersionId}
            currentText={prompt.promptText}
          />
        </TabsContent>

        <TabsContent value="runs" className="flex flex-col gap-3">
          {prompt.runs.length === 0 ? (
            <EmptyState icon={Activity} title="No runs logged" description="Record how this prompt performs in real tasks." />
          ) : (
            prompt.runs.map((run) => (
              <RunCard
                key={run.id}
                run={{ ...run, promptTitle: prompt.title, promptSlug: prompt.slug, projectName: null }}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="notes" className="flex flex-col gap-3">
          <LinkedNoteComposer relatedPromptId={prompt.id} />
          {prompt.relatedNotes.map((n) => (
            <Card key={n.id} className="gap-0 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{n.title}</span>
                <OptionBadge option={noteTypeMap[n.noteType]} withIcon={false} />
              </div>
              {n.body && <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>}
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="workflows" className="flex flex-col gap-2">
          {workflowsLinked.size === 0 ? (
            <EmptyState icon={Workflow} title="Not used in any workflow" description="Link this prompt to a workflow step to see it here." />
          ) : (
            [...workflowsLinked.values()].map((s) => (
              <Link key={s.workflowId} href={`/workflows/${s.workflowSlug}`}>
                <Card className="flex-row items-center justify-between gap-2 p-3 transition-colors hover:border-primary/40">
                  <div className="flex items-center gap-2">
                    <Workflow className="size-4 text-primary" />
                    <span className="font-medium">{s.workflowTitle}</span>
                  </div>
                  <OptionBadge option={workflowTypeMap[s.workflowType]} />
                </Card>
              </Link>
            ))
          )}
        </TabsContent>

        <TabsContent value="project">
          {prompt.project ? (
            <Link href={`/projects/${prompt.project.slug}`}>
              <Card className="gap-1 p-4 transition-colors hover:border-primary/40">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full" style={{ backgroundColor: prompt.project.color }} />
                  <CardTitle className="text-base">{prompt.project.name}</CardTitle>
                </div>
                {prompt.project.description && (
                  <p className="text-sm text-muted-foreground">{prompt.project.description}</p>
                )}
              </Card>
            </Link>
          ) : (
            <EmptyState icon={FolderKanban} title="No project linked" description="Edit the prompt to link it to a project." />
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Card className="gap-0 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <span className="mt-1 text-lg font-semibold tabular-nums">{value}</span>
    </Card>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { Activity, ArrowLeft, ExternalLink, FileText, Sparkles, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer } from "@/components/shared/page-header";
import { OptionBadge } from "@/components/shared/option-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { NoteCard } from "@/components/notes/note-card";
import { RunCard } from "@/components/runs/run-card";
import { ProjectHeaderActions } from "@/components/projects/project-header-actions";
import { getProjectBySlug, listProjectsForPicker } from "@/db/queries/projects";
import { listRuns } from "@/db/queries/runs";
import {
  projectStatusMap,
  projectTypeMap,
  promptCategoryMap,
  promptStatusMap,
  workflowStatusMap,
  workflowTypeMap,
} from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  return { title: project?.name ?? "Project" };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const [pickerProjects, runs] = await Promise.all([
    listProjectsForPicker(),
    listRuns({ projectId: project.id }),
  ]);

  return (
    <PageContainer>
      <Button render={<Link href="/projects" />} variant="ghost" size="sm" className="mb-3">
        <ArrowLeft className="size-4" /> Projects
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <span className="size-4 rounded-full" style={{ backgroundColor: project.color }} />
            <h1 className="text-xl font-semibold tracking-tight">{project.name}</h1>
          </div>
          {project.description && <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <OptionBadge option={projectTypeMap[project.type]} withIcon={false} />
            <OptionBadge option={projectStatusMap[project.status]} withIcon={false} />
            {project.domain && (
              <a
                href={`https://${project.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
              >
                <ExternalLink className="size-3" /> {project.domain}
              </a>
            )}
          </div>
        </div>
        <ProjectHeaderActions
          project={{
            id: project.id,
            account: project.account,
            name: project.name,
            slug: project.slug,
            description: project.description,
            domain: project.domain,
            type: project.type,
            status: project.status,
            color: project.color,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
          }}
        />
      </div>

      <Tabs defaultValue="prompts" className="mt-5 gap-4">
        <TabsList>
          <TabsTrigger value="prompts">Prompts ({project.prompts.length})</TabsTrigger>
          <TabsTrigger value="workflows">Workflows ({project.workflows.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes ({project.notes.length})</TabsTrigger>
          <TabsTrigger value="runs">Runs ({runs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="prompts" className="flex flex-col gap-2">
          {project.prompts.length === 0 ? (
            <EmptyState icon={Sparkles} title="No prompts" description="Link prompts to this project from the prompt editor." />
          ) : (
            project.prompts.map((p) => (
              <Link key={p.id} href={`/prompts/${p.slug}`}>
                <Card className="flex-row items-center justify-between gap-2 p-3 transition-colors hover:border-primary/40">
                  <span className="min-w-0 truncate font-medium">{p.title}</span>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <OptionBadge option={promptCategoryMap[p.category]} />
                    <OptionBadge option={promptStatusMap[p.status]} withIcon={false} />
                  </div>
                </Card>
              </Link>
            ))
          )}
        </TabsContent>

        <TabsContent value="workflows" className="flex flex-col gap-2">
          {project.workflows.length === 0 ? (
            <EmptyState icon={Workflow} title="No workflows" />
          ) : (
            project.workflows.map((w) => (
              <Link key={w.id} href={`/workflows/${w.slug}`}>
                <Card className="flex-row items-center justify-between gap-2 p-3 transition-colors hover:border-primary/40">
                  <span className="min-w-0 truncate font-medium">{w.title}</span>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <OptionBadge option={workflowTypeMap[w.workflowType]} />
                    <OptionBadge option={workflowStatusMap[w.status]} withIcon={false} />
                  </div>
                </Card>
              </Link>
            ))
          )}
        </TabsContent>

        <TabsContent value="notes" className="grid gap-2.5 lg:grid-cols-2">
          {project.notes.length === 0 ? (
            <div className="lg:col-span-2">
              <EmptyState icon={FileText} title="No notes" />
            </div>
          ) : (
            project.notes.map((n) => (
              <NoteCard
                key={n.id}
                note={{ ...n, projectName: project.name, projectColor: project.color }}
                projects={pickerProjects}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="runs" className="flex flex-col gap-3">
          {runs.length === 0 ? (
            <EmptyState icon={Activity} title="No runs" />
          ) : (
            runs.map((run) => <RunCard key={run.id} run={run} showPrompt />)
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

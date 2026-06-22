import { FolderKanban, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatStrip } from "@/components/shared/stat-strip";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectDialog } from "@/components/projects/project-dialog";
import { listProjects } from "@/db/queries/projects";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const projects = await listProjects();
  const activeCount = projects.filter((p) => p.status === "active").length;
  const totalPrompts = projects.reduce((s, p) => s + p.promptCount, 0);
  const totalWorkflows = projects.reduce((s, p) => s + p.workflowCount, 0);

  return (
    <PageContainer>
      <PageHeader
        icon={FolderKanban}
        title="Projects"
        description={`${projects.length} projects linking your prompts, workflows, and notes.`}
        actions={
          <ProjectDialog
            trigger={
              <Button>
                <Plus className="size-4" /> New project
              </Button>
            }
          />
        }
      />

      {projects.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects yet" description="Create a project to organize your work.">
          <ProjectDialog
            trigger={
              <Button>
                <Plus className="size-4" /> New project
              </Button>
            }
          />
        </EmptyState>
      ) : (
        <>
          <StatStrip
            className="mb-4"
            items={[
              { label: "Projects", value: projects.length },
              { label: "Active", value: activeCount, tone: activeCount > 0 ? "text-emerald-300" : undefined },
              { label: "Prompts", value: totalPrompts },
              { label: "Workflows", value: totalWorkflows },
            ]}
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </>
      )}
    </PageContainer>
  );
}

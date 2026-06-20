import Link from "next/link";
import { Plus, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { WorkflowCard } from "@/components/workflows/workflow-card";
import { WorkflowFilters } from "@/components/workflows/workflow-filters";
import { listWorkflows, type WorkflowFilters as Filters } from "@/db/queries/workflows";
import { listProjectsForPicker } from "@/db/queries/projects";

export const metadata = { title: "Workflow Library" };

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function WorkflowsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const filters: Filters = {
    search: sp.search,
    workflowType: sp.type,
    status: sp.status,
    projectId: sp.project,
    favorite: sp.favorite === "1",
  };

  const [workflows, projects] = await Promise.all([
    listWorkflows(filters),
    listProjectsForPicker(),
  ]);

  return (
    <PageContainer>
      <PageHeader
        icon={Workflow}
        title="Workflow Library"
        description={`${workflows.length} reusable multi-step AI workflows.`}
        actions={
          <Button render={<Link href="/workflows/new" />}>
            <Plus className="size-4" /> New workflow
          </Button>
        }
      />

      <WorkflowFilters projects={projects} />

      {workflows.length === 0 ? (
        <EmptyState icon={Workflow} title="No workflows match" description="Build a repeatable AI workflow to get started.">
          <Button render={<Link href="/workflows/new" />}>
            <Plus className="size-4" /> New workflow
          </Button>
        </EmptyState>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {workflows.map((w) => (
            <WorkflowCard key={w.id} workflow={w} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

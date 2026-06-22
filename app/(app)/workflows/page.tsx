import Link from "next/link";
import { Plus, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { WorkflowCard } from "@/components/workflows/workflow-card";
import { WorkflowFilters } from "@/components/workflows/workflow-filters";
import { listWorkflows, type WorkflowFilters as Filters } from "@/db/queries/workflows";
import { listProjectsForPicker } from "@/db/queries/projects";
import { scoreTier, TIER_ACCENT } from "@/lib/scoring";
import { accentText } from "@/lib/constants";
import { avg, cn } from "@/lib/utils";

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

  const reliableCount = workflows.filter((w) => w.status === "reliable").length;
  const avgMaturity = Math.round(avg(workflows.map((w) => w.maturity)) ?? 0);
  const totalSteps = workflows.reduce((s, w) => s + w.stepCount, 0);

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

      {workflows.length > 0 && (
        <Card className="mb-4 grid grid-cols-2 gap-0 p-0 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
          <Stat label="Workflows" value={workflows.length} />
          <Stat label="Reliable" value={reliableCount} tone={reliableCount > 0 ? "text-emerald-300" : undefined} />
          <Stat
            label="Avg maturity"
            value={avgMaturity}
            tone={accentText[TIER_ACCENT[scoreTier(avgMaturity)]]}
          />
          <Stat label="Total steps" value={totalSteps} />
        </Card>
      )}

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

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  tone?: string;
}) {
  return (
    <div className="flex flex-col gap-1 p-4">
      <span className="text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className={cn("text-xl font-semibold leading-none tabular-nums", tone)}>{value}</span>
    </div>
  );
}

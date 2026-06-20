import Link from "next/link";
import { Activity, Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { RunCard } from "@/components/runs/run-card";
import { RunFilters } from "@/components/runs/run-filters";
import { listRuns, type RunFilters as Filters } from "@/db/queries/runs";
import { listProjectsForPicker } from "@/db/queries/projects";
import { formatMinutes } from "@/lib/utils";

export const metadata = { title: "Prompt Runs" };

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function RunsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const filters: Filters = {
    search: sp.search,
    toolUsed: sp.tool,
    resultStatus: sp.result,
    projectId: sp.project,
  };

  const [runs, projects] = await Promise.all([listRuns(filters), listProjectsForPicker()]);
  const totalSaved = runs.reduce((s, r) => s + (r.estimatedTimeSavedMinutes ?? 0), 0);

  return (
    <PageContainer>
      <PageHeader
        icon={Activity}
        title="Prompt Runs"
        description={`${runs.length} logged runs`}
        actions={
          <Button render={<Link href="/runs/new" />}>
            <Plus className="size-4" /> Log run
          </Button>
        }
      />

      {runs.length > 0 && (
        <Card className="mb-4 flex-row items-center gap-2 p-3 text-sm">
          <Zap className="size-4 text-emerald-400" />
          <span className="font-medium">{formatMinutes(totalSaved)}</span>
          <span className="text-muted-foreground">of time saved across these runs</span>
        </Card>
      )}

      <RunFilters projects={projects} />

      {runs.length === 0 ? (
        <EmptyState icon={Activity} title="No runs logged" description="Log how a prompt performed in a real task.">
          <Button render={<Link href="/runs/new" />}>
            <Plus className="size-4" /> Log run
          </Button>
        </EmptyState>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {runs.map((run) => (
            <RunCard key={run.id} run={run} showPrompt />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

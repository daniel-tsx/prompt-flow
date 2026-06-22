import Link from "next/link";
import { Activity, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CompositionBar } from "@/components/shared/composition-bar";
import { StatTile } from "@/components/shared/stat-strip";
import { RunCard } from "@/components/runs/run-card";
import { RunFilters } from "@/components/runs/run-filters";
import { listRuns, type RunFilters as Filters } from "@/db/queries/runs";
import { listProjectsForPicker } from "@/db/queries/projects";
import { RESULT_WEIGHT, scoreTier, TIER_ACCENT } from "@/lib/scoring";
import { RUN_RESULTS, accentText } from "@/lib/constants";
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
  const successCount = runs.filter((r) => RESULT_WEIGHT[r.resultStatus] >= 0.6).length;
  const successRate = runs.length ? Math.round((successCount / runs.length) * 100) : 0;
  const followUps = runs.filter((r) => r.followUpNeeded).length;
  const resultMix = RUN_RESULTS.map((o) => ({
    label: o.label,
    value: runs.filter((r) => r.resultStatus === o.value).length,
    accent: o.accent,
  })).filter((s) => s.value > 0);

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
        <Card className="mb-4 gap-0 overflow-hidden p-0">
          <div className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
            <StatTile label="Runs" value={runs.length} />
            <StatTile
              label="Success rate"
              value={`${successRate}%`}
              tone={accentText[TIER_ACCENT[scoreTier(successRate)]]}
            />
            <StatTile label="Time saved" value={formatMinutes(totalSaved)} tone="text-emerald-300" />
            <StatTile
              label="Follow-ups"
              value={followUps}
              tone={followUps > 0 ? "text-amber-300" : undefined}
            />
          </div>
          {resultMix.length > 0 && (
            <div className="border-t p-4">
              <span className="text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">
                Result mix
              </span>
              <div className="mt-3">
                <CompositionBar segments={resultMix} total={runs.length} />
              </div>
            </div>
          )}
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

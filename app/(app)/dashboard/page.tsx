import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  FolderKanban,
  Gauge,
  Inbox,
  LayoutDashboard,
  ListChecks,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Workflow,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ScoreInline } from "@/components/shared/score-badge";
import { OptionBadge } from "@/components/shared/option-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { QualityTrendChart } from "@/components/charts/quality-trend-chart";
import { BarListChart } from "@/components/charts/bar-list-chart";
import { listPrompts } from "@/db/queries/prompts";
import { recentNotes, inboxMetrics } from "@/db/queries/notes";
import {
  dashboardCounters,
  promptCategoryDistribution,
  promptQualityTrend,
  topProjectsByPromptUsage,
} from "@/db/queries/stats";
import { runsByTool } from "@/db/queries/runs";
import { inboxPressure, PRESSURE_ACCENT } from "@/lib/scoring";
import {
  accentBadge,
  accentHex,
  noteTypeMap,
  promptCategoryMap,
  targetToolMap,
} from "@/lib/constants";
import { relativeTime } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

function PromptLine({
  slug,
  title,
  category,
  metricLabel,
  metric,
}: {
  slug: string;
  title: string;
  category: string;
  metricLabel: string;
  metric: React.ReactNode;
}) {
  return (
    <Link
      href={`/prompts/${slug}`}
      className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {promptCategoryMap[category]?.label ?? category}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end">
        <span className="text-sm font-semibold tabular-nums">{metric}</span>
        <span className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
          {metricLabel}
        </span>
      </div>
    </Link>
  );
}

export default async function DashboardPage() {
  const [counters, prompts, trend, catDist, toolRuns, topProjects, notes, metrics] =
    await Promise.all([
      dashboardCounters(),
      listPrompts(),
      promptQualityTrend(10),
      promptCategoryDistribution(),
      runsByTool(),
      topProjectsByPromptUsage(),
      recentNotes(5),
      inboxMetrics(),
    ]);

  const pressure = inboxPressure(metrics);
  const recentlyUsed = [...prompts]
    .filter((p) => p.lastRunAt)
    .sort((a, b) => (b.lastRunAt?.getTime() ?? 0) - (a.lastRunAt?.getTime() ?? 0))
    .slice(0, 5);
  const mostSuccessful = [...prompts]
    .filter((p) => p.reliability != null)
    .sort((a, b) => (b.reliability ?? 0) - (a.reliability ?? 0))
    .slice(0, 5);
  const needsImprovement = [...prompts]
    .filter((p) => p.status === "needs-improvement" || p.healthFlags.length > 0)
    .sort((a, b) => b.healthFlags.length - a.healthFlags.length)
    .slice(0, 5);

  const maxProjectPrompts = Math.max(1, ...topProjects.map((p) => p.promptCount));

  return (
    <PageContainer>
      <PageHeader
        icon={LayoutDashboard}
        title="Command Dashboard"
        description="Your prompt and workflow operating system at a glance."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Prompts" value={counters.totalPrompts} icon={Sparkles} accent="violet" href="/prompts" />
        <StatCard label="Reliable" value={counters.reliablePrompts} icon={Gauge} accent="emerald" href="/prompts?status=reliable" />
        <StatCard label="Favorites" value={counters.favoritePrompts} icon={Star} accent="amber" href="/prompts?favorite=1" />
        <StatCard label="Workflows" value={counters.activeWorkflows} icon={Workflow} accent="teal" href="/workflows" />
        <StatCard label="Inbox" value={counters.inboxCount} icon={Inbox} accent="blue" href="/inbox" />
        <StatCard label="Runs" value={counters.totalRuns} icon={Activity} accent="cyan" href="/runs" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4 text-primary" /> Prompt quality trend
            </CardTitle>
            <CardDescription>Average run result over the last 10 weeks.</CardDescription>
          </CardHeader>
          <CardContent>
            <QualityTrendChart data={trend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Inbox className="size-4 text-primary" /> Inbox pressure
              </span>
              <Badge variant="outline" className={`${accentBadge[PRESSURE_ACCENT[pressure.tier]]} capitalize`}>
                {pressure.tier}
              </Badge>
            </CardTitle>
            <CardDescription>How much is piling up to triage.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-end justify-between">
              <span className="text-3xl font-semibold tabular-nums">{pressure.score}</span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
            <Progress value={pressure.score} />
            <dl className="mt-1 grid grid-cols-2 gap-2 text-sm">
              <Metric label="Inbox" value={metrics.inboxCount} />
              <Metric label="Overdue" value={metrics.overdueCount} tone={metrics.overdueCount ? "rose" : undefined} />
              <Metric label="High priority" value={metrics.highPriorityCount} />
              <Metric label="Unconverted ideas" value={metrics.unconvertedIdeaCount} />
            </dl>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prompt runs by tool</CardTitle>
            <CardDescription>Where your prompts get used.</CardDescription>
          </CardHeader>
          <CardContent>
            {toolRuns.length ? (
              <BarListChart
                data={toolRuns.map((t) => ({
                  label: targetToolMap[t.tool]?.label ?? t.tool,
                  value: t.count,
                  color: accentHex[targetToolMap[t.tool]?.accent ?? "slate"],
                }))}
                height={200}
              />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No runs logged yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Category distribution</CardTitle>
            <CardDescription>What you build prompts for.</CardDescription>
          </CardHeader>
          <CardContent>
            {catDist.length ? (
              <BarListChart
                data={catDist
                  .slice(0, 8)
                  .map((c) => ({
                    label: promptCategoryMap[c.category]?.label ?? c.category,
                    value: c.count,
                    color: accentHex[promptCategoryMap[c.category]?.accent ?? "slate"],
                  }))}
                height={200}
              />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No prompts yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="size-4 text-emerald-400" /> Most successful
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3">
            {mostSuccessful.length ? (
              mostSuccessful.map((p) => (
                <PromptLine
                  key={p.id}
                  slug={p.slug}
                  title={p.title}
                  category={p.category}
                  metricLabel="reliability"
                  metric={<ScoreInline score={p.reliability} />}
                />
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">Log some runs to rank prompts.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="size-4 text-cyan-400" /> Recently used
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3">
            {recentlyUsed.length ? (
              recentlyUsed.map((p) => (
                <PromptLine
                  key={p.id}
                  slug={p.slug}
                  title={p.title}
                  category={p.category}
                  metricLabel="last run"
                  metric={<span className="text-xs font-normal text-muted-foreground">{relativeTime(p.lastRunAt)}</span>}
                />
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">No prompt runs yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-amber-400" /> Needs improvement
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3">
            {needsImprovement.length ? (
              needsImprovement.map((p) => (
                <PromptLine
                  key={p.id}
                  slug={p.slug}
                  title={p.title}
                  category={p.category}
                  metricLabel="issues"
                  metric={p.healthFlags.length || "review"}
                />
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">Everything looks healthy. 🎉</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderKanban className="size-4 text-primary" /> Top projects by prompt usage
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {topProjects.length ? (
              topProjects.map((p) => (
                <Link key={p.id} href={`/projects/${p.slug}`} className="flex items-center gap-3">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="w-32 shrink-0 truncate text-sm">{p.name}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(p.promptCount / maxProjectPrompts) * 100}%`,
                        backgroundColor: p.color,
                      }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
                    {p.promptCount}
                  </span>
                </Link>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">Link prompts to projects to see this.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ListChecks className="size-4 text-primary" /> Recently captured
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3">
            {notes.length ? (
              notes.map((n) => (
                <Link
                  key={n.id}
                  href={`/inbox?focus=${n.id}`}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
                >
                  <span className="min-w-0 truncate text-sm">{n.title}</span>
                  <OptionBadge option={noteTypeMap[n.noteType]} withIcon={false} className="shrink-0" />
                </Link>
              ))
            ) : (
              <EmptyState icon={Inbox} title="Inbox is clear" description="Capture an idea with ⌘⇧N." />
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "rose";
}) {
  return (
    <div className="flex items-center justify-between rounded-md border bg-muted/30 px-2.5 py-1.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={`text-sm font-semibold tabular-nums ${tone === "rose" ? "text-rose-300" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

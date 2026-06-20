import Link from "next/link";
import { format, startOfWeek } from "date-fns";
import {
  AlertTriangle,
  BarChart3,
  Gauge,
  Repeat,
  Trophy,
  Workflow as WorkflowIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { ScoreInline } from "@/components/shared/score-badge";
import { OptionBadge } from "@/components/shared/option-badge";
import { BarListChart } from "@/components/charts/bar-list-chart";
import { listPrompts } from "@/db/queries/prompts";
import { listWorkflows } from "@/db/queries/workflows";
import { inboxMetrics } from "@/db/queries/notes";
import { captureActivity, toolPerformanceByCategory } from "@/db/queries/stats";
import { libraryHealthScore, inboxPressure, HEALTH_FLAG_LABEL } from "@/lib/scoring";
import { promptCategoryMap, targetToolMap } from "@/lib/constants";
import { avg } from "@/lib/utils";

export const metadata = { title: "Reports" };

export default async function ReportsPage() {
  const [prompts, workflows, metrics, toolPerf, capture] = await Promise.all([
    listPrompts(),
    listWorkflows(),
    inboxMetrics(),
    toolPerformanceByCategory(),
    captureActivity(42),
  ]);

  const mostReused = [...prompts].filter((p) => p.runCount > 0).sort((a, b) => b.runCount - a.runCount).slice(0, 6);
  const highestQuality = [...prompts].filter((p) => p.reliability != null).sort((a, b) => (b.reliability ?? 0) - (a.reliability ?? 0)).slice(0, 6);
  const needsWork = prompts.filter((p) => p.healthFlags.length > 0).sort((a, b) => b.healthFlags.length - a.healthFlags.length).slice(0, 8);

  const libraryHealth = libraryHealthScore(prompts.map((p) => ({ flags: p.healthFlags })));
  const workflowHealth = Math.round(avg(workflows.map((w) => w.maturity)) ?? 0);
  const pressure = inboxPressure(metrics);

  // Weekly capture buckets (last 6 weeks)
  const buckets = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const wk = startOfWeek(new Date(Date.now() - i * 7 * 86_400_000), { weekStartsOn: 1 });
    buckets.set(format(wk, "yyyy-MM-dd"), 0);
  }
  for (const c of capture) {
    const key = format(startOfWeek(new Date(c.createdAt), { weekStartsOn: 1 }), "yyyy-MM-dd");
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  const captureData = [...buckets.entries()].map(([k, v]) => ({ label: format(new Date(k), "MMM d"), value: v }));

  return (
    <PageContainer>
      <PageHeader icon={BarChart3} title="Reports" description="Health and performance across your library." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <HealthCard icon={Gauge} label="Prompt library health" score={libraryHealth} hint={`${prompts.filter((p) => p.healthFlags.length === 0).length}/${prompts.length} healthy`} />
        <HealthCard icon={WorkflowIcon} label="Workflow maturity" score={workflowHealth} hint={`${workflows.length} workflows`} />
        <HealthCard icon={AlertTriangle} label="Inbox pressure" score={pressure.score} hint={pressure.tier} invert />
        <HealthCard icon={Repeat} label="Total runs" score={prompts.reduce((s, p) => s + p.runCount, 0)} raw hint="logged" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <ReportList icon={Repeat} title="Most reused prompts" iconClass="text-cyan-400" items={mostReused} metric={(p) => `${p.runCount} runs`} />
        <ReportList icon={Trophy} title="Highest quality" iconClass="text-emerald-400" items={highestQuality} metric={(p) => <ScoreInline score={p.reliability} />} />
        <ReportList icon={AlertTriangle} title="Needs improvement" iconClass="text-amber-400" items={needsWork} metric={(p) => `${p.healthFlags.length} issues`} subtitle={(p) => HEALTH_FLAG_LABEL[p.healthFlags[0]]} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Best tool by category</CardTitle>
          </CardHeader>
          <CardContent>
            {toolPerf.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Log runs to see tool performance.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Category</TableHead>
                    <TableHead>Best tool</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Runs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {toolPerf.slice(0, 10).map((t) => (
                    <TableRow key={`${t.category}-${t.tool}`}>
                      <TableCell><OptionBadge option={promptCategoryMap[t.category]} /></TableCell>
                      <TableCell><OptionBadge option={targetToolMap[t.tool]} /></TableCell>
                      <TableCell className="text-right"><ScoreInline score={t.score} /></TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">{t.runs}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly capture activity</CardTitle>
          </CardHeader>
          <CardContent>
            <BarListChart data={captureData} height={220} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Open task summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryStat label="Inbox" value={metrics.inboxCount} />
          <SummaryStat label="Overdue tasks" value={metrics.overdueCount} tone={metrics.overdueCount ? "rose" : undefined} />
          <SummaryStat label="High priority" value={metrics.highPriorityCount} />
          <SummaryStat label="Unconverted ideas" value={metrics.unconvertedIdeaCount} />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function HealthCard({
  icon: Icon,
  label,
  score,
  hint,
  raw,
  invert,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  score: number;
  hint?: string;
  raw?: boolean;
  invert?: boolean;
}) {
  const good = invert ? score < 45 : score >= 60;
  return (
    <Card className="gap-2 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums">{score}{!raw && <span className="text-sm text-muted-foreground">/100</span>}</span>
        {hint && <span className={`text-xs capitalize ${good ? "text-emerald-300" : "text-amber-300"}`}>{hint}</span>}
      </div>
      {!raw && <Progress value={score} />}
    </Card>
  );
}

function ReportList({
  icon: Icon,
  iconClass,
  title,
  items,
  metric,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  title: string;
  items: Awaited<ReturnType<typeof listPrompts>>;
  metric: (p: Awaited<ReturnType<typeof listPrompts>>[number]) => React.ReactNode;
  subtitle?: (p: Awaited<ReturnType<typeof listPrompts>>[number]) => React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className={`size-4 ${iconClass}`} /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3">
        {items.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Nothing yet.</p>
        ) : (
          items.map((p) => (
            <Link key={p.id} href={`/prompts/${p.slug}`} className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted/50">
              <div className="min-w-0">
                <p className="truncate font-medium">{p.title}</p>
                {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle(p)}</p>}
              </div>
              <Badge variant="secondary" className="shrink-0 font-normal">{metric(p)}</Badge>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function SummaryStat({ label, value, tone }: { label: string; value: number; tone?: "rose" }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-xl font-semibold tabular-nums ${tone === "rose" ? "text-rose-300" : ""}`}>{value}</p>
    </div>
  );
}

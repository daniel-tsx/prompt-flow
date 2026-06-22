import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Command,
  Compass,
  FolderKanban,
  Gauge,
  Inbox,
  Lightbulb,
  ListChecks,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageContainer } from "@/components/shared/page-header";
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
import { isOwner } from "@/lib/account";
import {
  inboxPressure,
  libraryHealthScore,
  PRESSURE_ACCENT,
  scoreTier,
  TIER_ACCENT,
} from "@/lib/scoring";
import {
  accentBadge,
  accentDot,
  accentHex,
  accentText,
  noteTypeMap,
  promptCategoryMap,
  targetToolMap,
  type Accent,
} from "@/lib/constants";
import { cn, relativeTime } from "@/lib/utils";

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
  const [counters, prompts, trend, catDist, toolRuns, topProjects, notes, metrics, owner] =
    await Promise.all([
      dashboardCounters(),
      listPrompts(),
      promptQualityTrend(10),
      promptCategoryDistribution(),
      runsByTool(),
      topProjectsByPromptUsage(),
      recentNotes(5),
      inboxMetrics(),
      isOwner(),
    ]);

  const pressure = inboxPressure(metrics);
  const libraryHealth = libraryHealthScore(prompts.map((p) => ({ flags: p.healthFlags })));
  const healthAccent = TIER_ACCENT[scoreTier(libraryHealth)];
  const attentionCount = prompts.filter(
    (p) => p.status === "needs-improvement" || p.healthFlags.length > 0,
  ).length;

  const attention = [
    { icon: AlertTriangle, label: "Prompts to improve", value: attentionCount, href: "/prompts?status=needs-improvement", accent: "amber" as Accent },
    { icon: ListChecks, label: "Tasks due soon", value: counters.tasksDueSoon, href: "/tasks", accent: "rose" as Accent },
    { icon: Lightbulb, label: "Ideas to triage", value: metrics.unconvertedIdeaCount, href: "/inbox", accent: "cyan" as Accent },
  ].filter((a) => a.value > 0);
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

  const catTotal = catDist.reduce((s, c) => s + c.count, 0);
  const topCats = catDist.slice(0, 7).map((c) => ({
    label: promptCategoryMap[c.category]?.label ?? c.category,
    value: c.count,
    accent: promptCategoryMap[c.category]?.accent ?? ("slate" as Accent),
  }));
  const restCat = catDist.slice(7).reduce((s, c) => s + c.count, 0);
  const catComposition =
    restCat > 0 ? [...topCats, { label: "Other", value: restCat, accent: "slate" as Accent }] : topCats;

  return (
    <PageContainer>
      <section
        aria-label="Command center"
        className="overflow-hidden rounded-xl border bg-card/55 shadow-sm"
      >
        <div className="grid lg:grid-cols-[1fr_22rem]">
          {/* Status console */}
          <div className="flex flex-col gap-5 border-b p-5 sm:p-6 lg:border-r lg:border-b-0">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                <span className="relative flex size-1.5">
                  <span className={cn("absolute inline-flex size-full animate-ping rounded-full opacity-60", accentDot[healthAccent])} />
                  <span className={cn("relative inline-flex size-1.5 rounded-full", accentDot[healthAccent])} />
                </span>
                Command Center
              </span>
              <Badge variant="outline" className="font-normal text-muted-foreground">
                {owner ? "Owner" : "Demo"}
              </Badge>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl font-semibold tracking-tight text-balance">
                {attentionCount > 0
                  ? `${attentionCount} ${attentionCount === 1 ? "prompt needs" : "prompts need"} a look`
                  : "Your library is running clean"}
              </h1>
              <p className="font-mono text-[0.8rem] text-muted-foreground">
                {counters.totalPrompts} prompts · {counters.reliablePrompts} reliable ·{" "}
                {counters.activeWorkflows} workflows · {counters.totalRuns} runs logged
              </p>
            </div>

            <div className="mt-auto flex flex-wrap items-center gap-2">
              {owner ? (
                <Button render={<Link href="/prompts/new" />} size="sm">
                  <Plus className="size-4" /> New prompt
                </Button>
              ) : (
                <Button render={<Link href="/prompts" />} size="sm">
                  <Compass className="size-4" /> Explore the library
                </Button>
              )}
              <Button render={<Link href="/reports" />} variant="outline" size="sm">
                <Gauge className="size-4" /> Reports
              </Button>
              <span className="ml-1 hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                <Command className="size-3.5" />
                <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[0.65rem] font-medium">⌘K</kbd>
                to search everything
              </span>
            </div>
          </div>

          {/* Health + attention focal panel */}
          <div className="flex flex-col gap-4 p-5 sm:p-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">
                  Library health
                </span>
                <ShieldCheck className={cn("size-4", accentText[healthAccent])} />
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-3xl font-semibold tabular-nums">{libraryHealth}</span>
                <span className="text-sm text-muted-foreground">/ 100</span>
                <span className={cn("ml-auto text-xs font-medium capitalize", accentText[healthAccent])}>
                  {scoreTier(libraryHealth)}
                </span>
              </div>
              <Progress value={libraryHealth} className="mt-2.5" />
            </div>

            <div className="border-t pt-3.5">
              <span className="text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">
                Needs attention
              </span>
              <div className="mt-2 flex flex-col gap-1">
                {attention.length > 0 ? (
                  attention.map((a) => (
                    <Link
                      key={a.label}
                      href={a.href}
                      className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 -mx-2 transition-colors hover:bg-muted/50"
                    >
                      <span className={cn("flex size-6 items-center justify-center rounded-md border", accentBadge[a.accent])}>
                        <a.icon className="size-3.5" />
                      </span>
                      <span className="text-sm">{a.label}</span>
                      <span className="ml-auto text-sm font-semibold tabular-nums">{a.value}</span>
                      <ArrowRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  ))
                ) : (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-500/5 px-2.5 py-2 text-sm text-emerald-300">
                    <CheckCircle2 className="size-4" /> All clear — nothing to triage.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Instrument cluster */}
        <div className="grid grid-cols-3 divide-x divide-y divide-border border-t sm:grid-cols-6 sm:divide-y-0">
          <Instrument label="Prompts" value={counters.totalPrompts} icon={Sparkles} accent="violet" href="/prompts" />
          <Instrument label="Reliable" value={counters.reliablePrompts} icon={Gauge} accent="emerald" href="/prompts?status=reliable" />
          <Instrument label="Favorites" value={counters.favoritePrompts} icon={Star} accent="amber" href="/prompts?favorite=1" />
          <Instrument label="Workflows" value={counters.activeWorkflows} icon={Workflow} accent="teal" href="/workflows" />
          <Instrument label="Inbox" value={counters.inboxCount} icon={Inbox} accent="blue" href="/inbox" />
          <Instrument label="Runs" value={counters.totalRuns} icon={Activity} accent="cyan" href="/runs" />
        </div>
      </section>

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
            <CardTitle className="flex items-center justify-between text-base">
              Category distribution
              <span className="text-xs font-normal text-muted-foreground">
                {catTotal} across {catDist.length} {catDist.length === 1 ? "category" : "categories"}
              </span>
            </CardTitle>
            <CardDescription>What you build prompts for.</CardDescription>
          </CardHeader>
          <CardContent>
            {catComposition.length ? (
              <CategoryComposition data={catComposition} total={catTotal} />
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

function CategoryComposition({
  data,
  total,
}: {
  data: { label: string; value: number; accent: Accent }[];
  total: number;
}) {
  const safeTotal = Math.max(1, total);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        {data.map((d) => (
          <div
            key={d.label}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{ width: `${(d.value / safeTotal) * 100}%`, backgroundColor: accentHex[d.accent] }}
            title={`${d.label}: ${d.value}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-x-5 gap-y-1.5 sm:grid-cols-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-sm">
            <span className={cn("size-2 shrink-0 rounded-full", accentDot[d.accent])} />
            <span className="truncate">{d.label}</span>
            <span className="ml-auto font-medium tabular-nums">{d.value}</span>
            <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
              {Math.round((d.value / safeTotal) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Instrument({
  label,
  value,
  icon: Icon,
  accent,
  href,
}: {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  accent: Accent;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-1.5 p-3.5 transition-colors hover:bg-muted/40 sm:p-4"
    >
      <div className="flex items-center justify-between">
        <span className="text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Icon className={cn("size-3.5 opacity-70 transition-opacity group-hover:opacity-100", accentText[accent])} />
      </div>
      <span className="text-xl font-semibold leading-none tabular-nums">{value}</span>
    </Link>
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

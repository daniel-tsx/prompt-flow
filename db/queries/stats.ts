import { startOfWeek, subWeeks, format } from "date-fns";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { notes, projects, promptRuns, prompts, workflows } from "@/db/schema";
import { RESULT_WEIGHT } from "@/lib/scoring";
import { getAccount } from "@/lib/account";

/** Top-line counters for the dashboard hero row. */
export async function dashboardCounters() {
  const account = await getAccount();
  const [
    [totalPrompts],
    [reliablePrompts],
    [favoritePrompts],
    [activeWorkflows],
    [inboxCount],
    [tasksDue],
    [totalRuns],
  ] = await Promise.all([
    db.select({ c: sql<number>`count(*)::int` }).from(prompts).where(and(eq(prompts.account, account), sql`status <> 'archived'`)),
    db.select({ c: sql<number>`count(*)::int` }).from(prompts).where(and(eq(prompts.account, account), sql`status = 'reliable'`)),
    db.select({ c: sql<number>`count(*)::int` }).from(prompts).where(and(eq(prompts.account, account), sql`favorite = true`)),
    db.select({ c: sql<number>`count(*)::int` }).from(workflows).where(and(eq(workflows.account, account), sql`status IN ('active','reliable')`)),
    db.select({ c: sql<number>`count(*)::int` }).from(notes).where(and(eq(notes.account, account), sql`status = 'inbox'`)),
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(notes)
      .where(and(eq(notes.account, account), sql`note_type = 'task' AND status NOT IN ('done','archived') AND due_date < now() + interval '3 days'`)),
    db.select({ c: sql<number>`count(*)::int` }).from(promptRuns).where(eq(promptRuns.account, account)),
  ]);

  return {
    totalPrompts: totalPrompts?.c ?? 0,
    reliablePrompts: reliablePrompts?.c ?? 0,
    favoritePrompts: favoritePrompts?.c ?? 0,
    activeWorkflows: activeWorkflows?.c ?? 0,
    inboxCount: inboxCount?.c ?? 0,
    tasksDueSoon: tasksDue?.c ?? 0,
    totalRuns: totalRuns?.c ?? 0,
  };
}

export async function promptCategoryDistribution() {
  const account = await getAccount();
  const rows = await db
    .select({ category: prompts.category, count: sql<number>`count(*)::int` })
    .from(prompts)
    .where(and(eq(prompts.account, account), sql`status <> 'archived'`))
    .groupBy(prompts.category)
    .orderBy(sql`count(*) desc`);
  return rows;
}

/** Weekly prompt-quality trend from run results (last `weeks` weeks). */
export async function promptQualityTrend(weeks = 10) {
  const account = await getAccount();
  const since = subWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), weeks - 1);
  const runs = await db
    .select({ date: promptRuns.date, result: promptRuns.resultStatus })
    .from(promptRuns)
    .where(and(eq(promptRuns.account, account), sql`${promptRuns.date} >= ${since.toISOString()}`));

  // Pre-seed buckets so the chart has continuous weeks.
  const buckets = new Map<string, { sum: number; n: number }>();
  for (let i = 0; i < weeks; i++) {
    const wk = startOfWeek(subWeeks(new Date(), weeks - 1 - i), { weekStartsOn: 1 });
    buckets.set(format(wk, "yyyy-MM-dd"), { sum: 0, n: 0 });
  }

  for (const r of runs) {
    const key = format(startOfWeek(new Date(r.date), { weekStartsOn: 1 }), "yyyy-MM-dd");
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.sum += RESULT_WEIGHT[r.result] * 100;
      bucket.n += 1;
    }
  }

  return [...buckets.entries()].map(([key, b]) => ({
    week: format(new Date(key), "MMM d"),
    score: b.n ? Math.round(b.sum / b.n) : null,
    runs: b.n,
  }));
}

export async function topProjectsByPromptUsage(limit = 6) {
  const account = await getAccount();
  const rows = await db
    .select({
      id: projects.id,
      name: projects.name,
      color: projects.color,
      slug: projects.slug,
      promptCount: sql<number>`count(${prompts.id})::int`,
    })
    .from(projects)
    .leftJoin(prompts, sql`${prompts.relatedProjectId} = ${projects.id}`)
    .where(eq(projects.account, account))
    .groupBy(projects.id)
    .orderBy(sql`count(${prompts.id}) desc`)
    .limit(limit);
  return rows.filter((r) => r.promptCount > 0);
}

/** Best tool/model per prompt category (avg result weight) for reports. */
export async function toolPerformanceByCategory() {
  const account = await getAccount();
  const rows = await db
    .select({
      category: prompts.category,
      tool: promptRuns.toolUsed,
      result: promptRuns.resultStatus,
    })
    .from(promptRuns)
    .innerJoin(prompts, sql`${prompts.id} = ${promptRuns.promptId}`)
    .where(eq(prompts.account, account));

  const map = new Map<string, Map<string, { sum: number; n: number }>>();
  for (const r of rows) {
    const cat = map.get(r.category) ?? new Map();
    const tool = cat.get(r.tool) ?? { sum: 0, n: 0 };
    tool.sum += RESULT_WEIGHT[r.result] * 100;
    tool.n += 1;
    cat.set(r.tool, tool);
    map.set(r.category, cat);
  }

  const result: { category: string; tool: string; score: number; runs: number }[] = [];
  for (const [category, tools] of map) {
    let best: { tool: string; score: number; runs: number } | null = null;
    for (const [tool, { sum, n }] of tools) {
      const score = Math.round(sum / n);
      if (!best || score > best.score) best = { tool, score, runs: n };
    }
    if (best) result.push({ category, ...best });
  }
  return result.sort((a, b) => b.score - a.score);
}

/** Capture activity over the last `days` days for the weekly-summary report. */
export async function captureActivity(days = 28) {
  const account = await getAccount();
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const rows = await db
    .select({ createdAt: notes.createdAt, type: notes.noteType })
    .from(notes)
    .where(and(eq(notes.account, account), sql`${notes.createdAt} >= ${since}`));
  return rows;
}

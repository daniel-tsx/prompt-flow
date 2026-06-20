import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  notes,
  projects,
  promptRuns,
  promptVersions,
  prompts,
  workflowSteps,
  type Prompt,
} from "@/db/schema";
import { reliabilityScore, usefulnessScore } from "@/lib/scoring";

export type PromptFilters = {
  search?: string;
  category?: string;
  intent?: string;
  targetTool?: string;
  status?: string;
  projectId?: string;
  favorite?: boolean;
  tag?: string;
  includeArchived?: boolean;
};

export type PromptListItem = Prompt & {
  projectName: string | null;
  projectColor: string | null;
  runCount: number;
  versionCount: number;
  workflowCount: number;
  lastRunAt: Date | null;
  reliability: number | null;
  usefulness: number;
};

type RunAgg = {
  resultStatus: (typeof promptRuns.$inferSelect)["resultStatus"];
  date: Date;
  estimatedTimeSavedMinutes: number | null;
};

/** Build run/version/workflow aggregates for a set of prompt ids, in JS. */
async function buildAggregates(promptIds: string[]) {
  if (promptIds.length === 0) {
    return {
      runs: new Map<string, RunAgg[]>(),
      versionCounts: new Map<string, number>(),
      workflowCounts: new Map<string, number>(),
    };
  }

  const [runRows, versionRows, stepRows] = await Promise.all([
    db
      .select({
        promptId: promptRuns.promptId,
        resultStatus: promptRuns.resultStatus,
        date: promptRuns.date,
        estimatedTimeSavedMinutes: promptRuns.estimatedTimeSavedMinutes,
      })
      .from(promptRuns)
      .where(inArray(promptRuns.promptId, promptIds)),
    db
      .select({ promptId: promptVersions.promptId, id: promptVersions.id })
      .from(promptVersions)
      .where(inArray(promptVersions.promptId, promptIds)),
    db
      .select({ linkedPromptId: workflowSteps.linkedPromptId })
      .from(workflowSteps)
      .where(inArray(workflowSteps.linkedPromptId, promptIds)),
  ]);

  const runs = new Map<string, RunAgg[]>();
  for (const r of runRows) {
    const list = runs.get(r.promptId) ?? [];
    list.push({
      resultStatus: r.resultStatus,
      date: r.date,
      estimatedTimeSavedMinutes: r.estimatedTimeSavedMinutes,
    });
    runs.set(r.promptId, list);
  }

  const versionCounts = new Map<string, number>();
  for (const v of versionRows) {
    versionCounts.set(v.promptId, (versionCounts.get(v.promptId) ?? 0) + 1);
  }

  const workflowCounts = new Map<string, number>();
  for (const s of stepRows) {
    if (!s.linkedPromptId) continue;
    workflowCounts.set(
      s.linkedPromptId,
      (workflowCounts.get(s.linkedPromptId) ?? 0) + 1,
    );
  }

  return { runs, versionCounts, workflowCounts };
}

function enrich(
  prompt: Prompt & { projectName: string | null; projectColor: string | null },
  agg: Awaited<ReturnType<typeof buildAggregates>>,
): PromptListItem {
  const runs = agg.runs.get(prompt.id) ?? [];
  const versionCount = agg.versionCounts.get(prompt.id) ?? 0;
  const workflowCount = agg.workflowCounts.get(prompt.id) ?? 0;
  const lastRunAt = runs.length
    ? runs.reduce((latest, r) => (r.date > latest ? r.date : latest), runs[0].date)
    : null;

  return {
    ...prompt,
    runCount: runs.length,
    versionCount,
    workflowCount,
    lastRunAt,
    reliability: reliabilityScore({
      runs,
      qualityScore: prompt.qualityScore,
      resultScore: prompt.resultScore,
    }),
    usefulness: usefulnessScore({
      favorite: prompt.favorite,
      runs,
      qualityScore: prompt.qualityScore,
      linkedWorkflowCount: workflowCount,
    }),
  };
}

export async function listPrompts(
  filters: PromptFilters = {},
): Promise<PromptListItem[]> {
  const conditions = [];

  if (!filters.includeArchived && filters.status !== "archived") {
    conditions.push(sql`${prompts.status} <> 'archived'`);
  }
  if (filters.category) conditions.push(eq(prompts.category, filters.category as Prompt["category"]));
  if (filters.intent) conditions.push(eq(prompts.intent, filters.intent as Prompt["intent"]));
  if (filters.targetTool) conditions.push(eq(prompts.targetTool, filters.targetTool as Prompt["targetTool"]));
  if (filters.status) conditions.push(eq(prompts.status, filters.status as Prompt["status"]));
  if (filters.projectId) conditions.push(eq(prompts.relatedProjectId, filters.projectId));
  if (filters.favorite) conditions.push(eq(prompts.favorite, true));
  if (filters.tag) conditions.push(sql`${filters.tag} = ANY(${prompts.tags})`);
  if (filters.search) {
    const q = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(prompts.title, q),
        ilike(prompts.description, q),
        ilike(prompts.promptText, q),
        ilike(prompts.notes, q),
      ),
    );
  }

  const rows = await db
    .select({
      prompt: prompts,
      projectName: projects.name,
      projectColor: projects.color,
    })
    .from(prompts)
    .leftJoin(projects, eq(prompts.relatedProjectId, projects.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(prompts.favorite), desc(prompts.updatedAt));

  const flat = rows.map((r) => ({
    ...r.prompt,
    projectName: r.projectName,
    projectColor: r.projectColor,
  }));

  const agg = await buildAggregates(flat.map((p) => p.id));
  return flat.map((p) => enrich(p, agg));
}

export async function getPromptBySlug(slug: string) {
  const prompt = await db.query.prompts.findFirst({
    where: eq(prompts.slug, slug),
    with: {
      project: true,
      versions: { orderBy: (v, { desc }) => [desc(v.versionNumber)] },
      runs: { orderBy: (r, { desc }) => [desc(r.date)] },
    },
  });
  if (!prompt) return null;

  const linkedSteps = await db
    .select({
      stepId: workflowSteps.id,
      stepTitle: workflowSteps.title,
      workflowId: workflowSteps.workflowId,
    })
    .from(workflowSteps)
    .where(eq(workflowSteps.linkedPromptId, prompt.id));

  const relatedNotes = await db
    .select()
    .from(notes)
    .where(eq(notes.relatedPromptId, prompt.id))
    .orderBy(desc(notes.updatedAt));

  const reliability = reliabilityScore({
    runs: prompt.runs,
    qualityScore: prompt.qualityScore,
    resultScore: prompt.resultScore,
  });
  const usefulness = usefulnessScore({
    favorite: prompt.favorite,
    runs: prompt.runs,
    qualityScore: prompt.qualityScore,
    linkedWorkflowCount: linkedSteps.length,
  });

  return { ...prompt, linkedSteps, relatedNotes, reliability, usefulness };
}

export type PromptDetail = NonNullable<Awaited<ReturnType<typeof getPromptBySlug>>>;

export async function getPromptById(id: string) {
  return db.query.prompts.findFirst({ where: eq(prompts.id, id) });
}

export async function listPromptsForPicker() {
  return db
    .select({
      id: prompts.id,
      title: prompts.title,
      slug: prompts.slug,
      category: prompts.category,
      promptText: prompts.promptText,
    })
    .from(prompts)
    .where(sql`${prompts.status} <> 'archived'`)
    .orderBy(desc(prompts.updatedAt));
}

export async function recentPrompts(limit = 6) {
  const all = await listPrompts();
  return all
    .filter((p) => p.lastRunAt)
    .sort((a, b) => (b.lastRunAt?.getTime() ?? 0) - (a.lastRunAt?.getTime() ?? 0))
    .slice(0, limit);
}

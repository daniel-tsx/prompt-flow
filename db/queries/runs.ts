import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  projects,
  promptRuns,
  prompts,
  type PromptRun,
} from "@/db/schema";

export type RunFilters = {
  search?: string;
  promptId?: string;
  projectId?: string;
  toolUsed?: string;
  resultStatus?: string;
};

export type RunListItem = PromptRun & {
  promptTitle: string | null;
  promptSlug: string | null;
  projectName: string | null;
};

export async function listRuns(filters: RunFilters = {}): Promise<RunListItem[]> {
  const conditions = [];
  if (filters.promptId) conditions.push(eq(promptRuns.promptId, filters.promptId));
  if (filters.projectId) conditions.push(eq(promptRuns.projectId, filters.projectId));
  if (filters.toolUsed) conditions.push(eq(promptRuns.toolUsed, filters.toolUsed as PromptRun["toolUsed"]));
  if (filters.resultStatus)
    conditions.push(eq(promptRuns.resultStatus, filters.resultStatus as PromptRun["resultStatus"]));
  if (filters.search) {
    const q = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(promptRuns.title, q),
        ilike(promptRuns.taskDescription, q),
        ilike(promptRuns.outputSummary, q),
        ilike(promptRuns.lessonsLearned, q),
      ),
    );
  }

  const rows = await db
    .select({
      run: promptRuns,
      promptTitle: prompts.title,
      promptSlug: prompts.slug,
      projectName: projects.name,
    })
    .from(promptRuns)
    .leftJoin(prompts, eq(promptRuns.promptId, prompts.id))
    .leftJoin(projects, eq(promptRuns.projectId, projects.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(promptRuns.date));

  return rows.map((r) => ({
    ...r.run,
    promptTitle: r.promptTitle,
    promptSlug: r.promptSlug,
    projectName: r.projectName,
  }));
}

export async function recentRuns(limit = 6) {
  return listRuns().then((r) => r.slice(0, limit));
}

export async function runsByTool() {
  return db
    .select({
      tool: promptRuns.toolUsed,
      count: sql<number>`count(*)::int`,
    })
    .from(promptRuns)
    .groupBy(promptRuns.toolUsed)
    .orderBy(desc(sql`count(*)`));
}

export async function runsByResult() {
  return db
    .select({
      result: promptRuns.resultStatus,
      count: sql<number>`count(*)::int`,
    })
    .from(promptRuns)
    .groupBy(promptRuns.resultStatus);
}

export async function runById(id: string) {
  return db.query.promptRuns.findFirst({ where: eq(promptRuns.id, id) });
}

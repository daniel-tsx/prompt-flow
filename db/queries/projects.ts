import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  notes,
  projects,
  promptRuns,
  prompts,
  workflows,
  type Project,
} from "@/db/schema";
import { getAccount } from "@/lib/account";

export type ProjectListItem = Project & {
  promptCount: number;
  workflowCount: number;
  noteCount: number;
  runCount: number;
};

export async function listProjects(): Promise<ProjectListItem[]> {
  const account = await getAccount();
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.account, account))
    .orderBy(projects.name);

  const [promptCounts, workflowCounts, noteCounts, runCounts] = await Promise.all([
    db
      .select({ id: prompts.relatedProjectId, c: sql<number>`count(*)::int` })
      .from(prompts)
      .where(eq(prompts.account, account))
      .groupBy(prompts.relatedProjectId),
    db
      .select({ id: workflows.relatedProjectId, c: sql<number>`count(*)::int` })
      .from(workflows)
      .where(eq(workflows.account, account))
      .groupBy(workflows.relatedProjectId),
    db
      .select({ id: notes.relatedProjectId, c: sql<number>`count(*)::int` })
      .from(notes)
      .where(eq(notes.account, account))
      .groupBy(notes.relatedProjectId),
    db
      .select({ id: promptRuns.projectId, c: sql<number>`count(*)::int` })
      .from(promptRuns)
      .where(eq(promptRuns.account, account))
      .groupBy(promptRuns.projectId),
  ]);

  const toMap = (arr: { id: string | null; c: number }[]) =>
    new Map(arr.filter((r) => r.id).map((r) => [r.id as string, r.c]));

  const pm = toMap(promptCounts);
  const wm = toMap(workflowCounts);
  const nm = toMap(noteCounts);
  const rm = toMap(runCounts);

  return rows.map((p) => ({
    ...p,
    promptCount: pm.get(p.id) ?? 0,
    workflowCount: wm.get(p.id) ?? 0,
    noteCount: nm.get(p.id) ?? 0,
    runCount: rm.get(p.id) ?? 0,
  }));
}

export async function listProjectsForPicker() {
  const account = await getAccount();
  return db
    .select({
      id: projects.id,
      name: projects.name,
      color: projects.color,
      status: projects.status,
    })
    .from(projects)
    .where(eq(projects.account, account))
    .orderBy(projects.name);
}

export async function getProjectBySlug(slug: string) {
  const account = await getAccount();
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.slug, slug), eq(projects.account, account)),
  });
  if (!project) return null;

  const [projectPrompts, projectWorkflows, projectNotes, projectRuns] =
    await Promise.all([
      db
        .select()
        .from(prompts)
        .where(eq(prompts.relatedProjectId, project.id))
        .orderBy(desc(prompts.updatedAt)),
      db
        .select()
        .from(workflows)
        .where(eq(workflows.relatedProjectId, project.id))
        .orderBy(desc(workflows.updatedAt)),
      db
        .select()
        .from(notes)
        .where(eq(notes.relatedProjectId, project.id))
        .orderBy(desc(notes.updatedAt)),
      db
        .select()
        .from(promptRuns)
        .where(eq(promptRuns.projectId, project.id))
        .orderBy(desc(promptRuns.date)),
    ]);

  return {
    ...project,
    prompts: projectPrompts,
    workflows: projectWorkflows,
    notes: projectNotes,
    runs: projectRuns,
  };
}

export async function getProjectById(id: string) {
  const account = await getAccount();
  return db.query.projects.findFirst({
    where: and(eq(projects.id, id), eq(projects.account, account)),
  });
}

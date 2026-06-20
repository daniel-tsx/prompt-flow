import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  notes,
  projects,
  promptRuns,
  prompts,
  workflows,
  type Project,
} from "@/db/schema";

export type ProjectListItem = Project & {
  promptCount: number;
  workflowCount: number;
  noteCount: number;
  runCount: number;
};

export async function listProjects(): Promise<ProjectListItem[]> {
  const rows = await db.select().from(projects).orderBy(projects.name);

  const [promptCounts, workflowCounts, noteCounts, runCounts] = await Promise.all([
    db
      .select({ id: prompts.relatedProjectId, c: sql<number>`count(*)::int` })
      .from(prompts)
      .groupBy(prompts.relatedProjectId),
    db
      .select({ id: workflows.relatedProjectId, c: sql<number>`count(*)::int` })
      .from(workflows)
      .groupBy(workflows.relatedProjectId),
    db
      .select({ id: notes.relatedProjectId, c: sql<number>`count(*)::int` })
      .from(notes)
      .groupBy(notes.relatedProjectId),
    db
      .select({ id: promptRuns.projectId, c: sql<number>`count(*)::int` })
      .from(promptRuns)
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
  return db
    .select({
      id: projects.id,
      name: projects.name,
      color: projects.color,
      status: projects.status,
    })
    .from(projects)
    .orderBy(projects.name);
}

export async function getProjectBySlug(slug: string) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.slug, slug),
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
  return db.query.projects.findFirst({ where: eq(projects.id, id) });
}

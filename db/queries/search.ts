import { ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  collections,
  notes,
  projects,
  promptRuns,
  promptVersions,
  prompts,
  templates,
  workflowSteps,
  workflows,
} from "@/db/schema";

export type SearchResult = {
  type:
    | "prompt"
    | "prompt-version"
    | "prompt-run"
    | "workflow"
    | "workflow-step"
    | "note"
    | "template"
    | "collection"
    | "project";
  id: string;
  title: string;
  subtitle: string | null;
  href: string;
};

export async function globalSearch(query: string, limit = 8): Promise<SearchResult[]> {
  const q = query.trim();
  if (!q) return [];
  const like = `%${q}%`;

  const [
    promptRows,
    versionRows,
    runRows,
    workflowRows,
    stepRows,
    noteRows,
    templateRows,
    collectionRows,
    projectRows,
  ] = await Promise.all([
    db
      .select({ id: prompts.id, slug: prompts.slug, title: prompts.title, category: prompts.category })
      .from(prompts)
      .where(or(ilike(prompts.title, like), ilike(prompts.description, like), ilike(prompts.promptText, like)))
      .limit(limit),
    db
      .select({
        id: promptVersions.id,
        title: promptVersions.title,
        summary: promptVersions.changeSummary,
        promptId: promptVersions.promptId,
        promptSlug: prompts.slug,
      })
      .from(promptVersions)
      .innerJoin(prompts, sql`${prompts.id} = ${promptVersions.promptId}`)
      .where(or(ilike(promptVersions.title, like), ilike(promptVersions.promptText, like)))
      .limit(limit),
    db
      .select({ id: promptRuns.id, title: promptRuns.title, slug: prompts.slug })
      .from(promptRuns)
      .innerJoin(prompts, sql`${prompts.id} = ${promptRuns.promptId}`)
      .where(or(ilike(promptRuns.title, like), ilike(promptRuns.taskDescription, like), ilike(promptRuns.outputSummary, like)))
      .limit(limit),
    db
      .select({ id: workflows.id, slug: workflows.slug, title: workflows.title, type: workflows.workflowType })
      .from(workflows)
      .where(or(ilike(workflows.title, like), ilike(workflows.description, like), ilike(workflows.outcome, like)))
      .limit(limit),
    db
      .select({ id: workflowSteps.id, title: workflowSteps.title, workflowSlug: workflows.slug })
      .from(workflowSteps)
      .innerJoin(workflows, sql`${workflows.id} = ${workflowSteps.workflowId}`)
      .where(or(ilike(workflowSteps.title, like), ilike(workflowSteps.instruction, like)))
      .limit(limit),
    db
      .select({ id: notes.id, title: notes.title, type: notes.noteType })
      .from(notes)
      .where(or(ilike(notes.title, like), ilike(notes.body, like)))
      .limit(limit),
    db
      .select({ id: templates.id, name: templates.name, type: templates.templateType })
      .from(templates)
      .where(or(ilike(templates.name, like), ilike(templates.description, like), ilike(templates.content, like)))
      .limit(limit),
    db
      .select({ id: collections.id, name: collections.name, type: collections.collectionType })
      .from(collections)
      .where(or(ilike(collections.name, like), ilike(collections.description, like)))
      .limit(limit),
    db
      .select({ id: projects.id, slug: projects.slug, name: projects.name, type: projects.type })
      .from(projects)
      .where(or(ilike(projects.name, like), ilike(projects.description, like)))
      .limit(limit),
  ]);

  const results: SearchResult[] = [
    ...promptRows.map((p) => ({
      type: "prompt" as const,
      id: p.id,
      title: p.title,
      subtitle: p.category,
      href: `/prompts/${p.slug}`,
    })),
    ...versionRows.map((v) => ({
      type: "prompt-version" as const,
      id: v.id,
      title: v.title,
      subtitle: v.summary ?? "Prompt version",
      href: `/prompts/${v.promptSlug}?tab=versions`,
    })),
    ...runRows.map((r) => ({
      type: "prompt-run" as const,
      id: r.id,
      title: r.title,
      subtitle: "Prompt run",
      href: `/runs?prompt=${r.slug ?? ""}`,
    })),
    ...workflowRows.map((w) => ({
      type: "workflow" as const,
      id: w.id,
      title: w.title,
      subtitle: w.type,
      href: `/workflows/${w.slug}`,
    })),
    ...stepRows.map((s) => ({
      type: "workflow-step" as const,
      id: s.id,
      title: s.title,
      subtitle: "Workflow step",
      href: `/workflows/${s.workflowSlug}`,
    })),
    ...noteRows.map((n) => ({
      type: "note" as const,
      id: n.id,
      title: n.title,
      subtitle: n.type,
      href: `/inbox?focus=${n.id}`,
    })),
    ...templateRows.map((t) => ({
      type: "template" as const,
      id: t.id,
      title: t.name,
      subtitle: t.type,
      href: `/templates?focus=${t.id}`,
    })),
    ...collectionRows.map((c) => ({
      type: "collection" as const,
      id: c.id,
      title: c.name,
      subtitle: c.type,
      href: `/collections/${c.id}`,
    })),
    ...projectRows.map((p) => ({
      type: "project" as const,
      id: p.id,
      title: p.name,
      subtitle: p.type,
      href: `/projects/${p.slug}`,
    })),
  ];

  return results;
}

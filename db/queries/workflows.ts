import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  notes,
  projects,
  prompts,
  workflowSteps,
  workflows,
  type Workflow,
} from "@/db/schema";
import { workflowMaturityScore } from "@/lib/scoring";

export type WorkflowFilters = {
  search?: string;
  workflowType?: string;
  status?: string;
  projectId?: string;
  favorite?: boolean;
  tag?: string;
  includeArchived?: boolean;
};

export type WorkflowListItem = Workflow & {
  projectName: string | null;
  projectColor: string | null;
  stepCount: number;
  linkedPromptCount: number;
  maturity: number;
};

export async function listWorkflows(
  filters: WorkflowFilters = {},
): Promise<WorkflowListItem[]> {
  const conditions = [];
  if (!filters.includeArchived && filters.status !== "archived") {
    conditions.push(sql`${workflows.status} <> 'archived'`);
  }
  if (filters.workflowType)
    conditions.push(eq(workflows.workflowType, filters.workflowType as Workflow["workflowType"]));
  if (filters.status) conditions.push(eq(workflows.status, filters.status as Workflow["status"]));
  if (filters.projectId) conditions.push(eq(workflows.relatedProjectId, filters.projectId));
  if (filters.favorite) conditions.push(eq(workflows.favorite, true));
  if (filters.tag) conditions.push(sql`${filters.tag} = ANY(${workflows.tags})`);
  if (filters.search) {
    const q = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(workflows.title, q),
        ilike(workflows.description, q),
        ilike(workflows.outcome, q),
        ilike(workflows.notes, q),
      ),
    );
  }

  const rows = await db
    .select({
      workflow: workflows,
      projectName: projects.name,
      projectColor: projects.color,
    })
    .from(workflows)
    .leftJoin(projects, eq(workflows.relatedProjectId, projects.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(workflows.favorite), desc(workflows.updatedAt));

  const stepRows = await db
    .select({
      workflowId: workflowSteps.workflowId,
      linkedPromptId: workflowSteps.linkedPromptId,
    })
    .from(workflowSteps);

  const stepCounts = new Map<string, number>();
  const linkedCounts = new Map<string, number>();
  for (const s of stepRows) {
    stepCounts.set(s.workflowId, (stepCounts.get(s.workflowId) ?? 0) + 1);
    if (s.linkedPromptId)
      linkedCounts.set(s.workflowId, (linkedCounts.get(s.workflowId) ?? 0) + 1);
  }

  return rows.map((r) => {
    const stepCount = stepCounts.get(r.workflow.id) ?? 0;
    const linkedPromptCount = linkedCounts.get(r.workflow.id) ?? 0;
    return {
      ...r.workflow,
      projectName: r.projectName,
      projectColor: r.projectColor,
      stepCount,
      linkedPromptCount,
      maturity: workflowMaturityScore({
        stepCount,
        linkedPromptCount,
        status: r.workflow.status,
        whenToUse: r.workflow.whenToUse,
        whenNotToUse: r.workflow.whenNotToUse,
        outcome: r.workflow.outcome,
      }),
    };
  });
}

export async function getWorkflowBySlug(slug: string) {
  const workflow = await db.query.workflows.findFirst({
    where: eq(workflows.slug, slug),
    with: {
      project: true,
      steps: {
        orderBy: (s, { asc }) => [asc(s.order)],
        with: { linkedPrompt: true },
      },
    },
  });
  if (!workflow) return null;

  const relatedNotes = await db
    .select()
    .from(notes)
    .where(eq(notes.relatedWorkflowId, workflow.id))
    .orderBy(desc(notes.updatedAt));

  const linkedPromptCount = workflow.steps.filter((s) => s.linkedPromptId).length;
  const maturity = workflowMaturityScore({
    stepCount: workflow.steps.length,
    linkedPromptCount,
    status: workflow.status,
    whenToUse: workflow.whenToUse,
    whenNotToUse: workflow.whenNotToUse,
    outcome: workflow.outcome,
  });

  return { ...workflow, relatedNotes, maturity, linkedPromptCount };
}

export type WorkflowDetail = NonNullable<
  Awaited<ReturnType<typeof getWorkflowBySlug>>
>;

export async function getWorkflowById(id: string) {
  return db.query.workflows.findFirst({
    where: eq(workflows.id, id),
    with: { steps: { orderBy: (s, { asc }) => [asc(s.order)] } },
  });
}

export async function listWorkflowsForPicker() {
  return db
    .select({ id: workflows.id, title: workflows.title, slug: workflows.slug })
    .from(workflows)
    .orderBy(desc(workflows.updatedAt));
}

/** Prompts available to link into a workflow step. */
export async function listLinkablePrompts() {
  return db
    .select({
      id: prompts.id,
      title: prompts.title,
      category: prompts.category,
      promptText: prompts.promptText,
    })
    .from(prompts)
    .where(sql`${prompts.status} <> 'archived'`)
    .orderBy(desc(prompts.updatedAt));
}

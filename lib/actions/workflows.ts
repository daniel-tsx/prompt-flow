"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { workflowSteps, workflows } from "@/db/schema";
import { ownerAction } from "@/lib/action-result";
import { uniqueSlug } from "@/lib/utils";
import { workflowSchema, type WorkflowInput } from "@/lib/validations";

function revalidate() {
  revalidatePath("/", "layout");
}

async function replaceSteps(workflowId: string, steps: WorkflowInput["steps"]) {
  await db.delete(workflowSteps).where(eq(workflowSteps.workflowId, workflowId));
  if (steps.length) {
    await db.insert(workflowSteps).values(
      steps.map((s, i) => ({
        workflowId,
        order: i,
        title: s.title,
        description: s.description ?? null,
        linkedPromptId: s.linkedPromptId ?? null,
        instruction: s.instruction ?? null,
        expectedOutput: s.expectedOutput ?? null,
        checklist: s.checklist ?? [],
      })),
    );
  }
}

export async function createWorkflow(input: WorkflowInput) {
  return ownerAction(async () => {
    const { steps, ...data } = workflowSchema.parse(input);
    const [row] = await db
      .insert(workflows)
      .values({ ...data, slug: uniqueSlug(data.title) })
      .returning({ id: workflows.id, slug: workflows.slug });
    await replaceSteps(row.id, steps);
    revalidate();
    return row;
  });
}

export async function updateWorkflow(id: string, input: WorkflowInput) {
  return ownerAction(async () => {
    const { steps, ...data } = workflowSchema.parse(input);
    const [row] = await db
      .update(workflows)
      .set(data)
      .where(eq(workflows.id, id))
      .returning({ id: workflows.id, slug: workflows.slug });
    await replaceSteps(id, steps);
    revalidate();
    return row;
  });
}

export async function toggleWorkflowFavorite(id: string, favorite: boolean) {
  return ownerAction(async () => {
    await db.update(workflows).set({ favorite }).where(eq(workflows.id, id));
    revalidate();
  });
}

export async function setWorkflowStatus(id: string, status: WorkflowInput["status"]) {
  return ownerAction(async () => {
    await db.update(workflows).set({ status }).where(eq(workflows.id, id));
    revalidate();
  });
}

export async function deleteWorkflow(id: string) {
  return ownerAction(async () => {
    await db.delete(workflows).where(eq(workflows.id, id));
    revalidate();
  });
}

export async function duplicateWorkflow(id: string) {
  return ownerAction(async () => {
    const original = await db.query.workflows.findFirst({
      where: eq(workflows.id, id),
      with: { steps: { orderBy: (s, { asc }) => [asc(s.order)] } },
    });
    if (!original) throw new Error("Workflow not found");
    const { steps, id: _omit, createdAt, updatedAt, slug, title, ...rest } = original;
    void _omit;
    void createdAt;
    void updatedAt;
    void slug;
    const newTitle = `${title} (copy)`;
    const [row] = await db
      .insert(workflows)
      .values({ ...rest, title: newTitle, slug: uniqueSlug(newTitle), favorite: false })
      .returning({ id: workflows.id, slug: workflows.slug });
    if (steps.length) {
      await db.insert(workflowSteps).values(
        steps.map((s, i) => ({
          workflowId: row.id,
          order: i,
          title: s.title,
          description: s.description,
          linkedPromptId: s.linkedPromptId,
          instruction: s.instruction,
          expectedOutput: s.expectedOutput,
          checklist: s.checklist,
        })),
      );
    }
    revalidate();
    return row;
  });
}

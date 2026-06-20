"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { prompts, promptVersions, templates, workflows } from "@/db/schema";
import { ownerAction } from "@/lib/action-result";
import { uniqueSlug } from "@/lib/utils";
import { templateSchema, type TemplateInput } from "@/lib/validations";

function revalidate() {
  revalidatePath("/", "layout");
}

export async function createTemplate(input: TemplateInput) {
  return ownerAction(async () => {
    const data = templateSchema.parse(input);
    const [row] = await db.insert(templates).values(data).returning({ id: templates.id });
    revalidate();
    return row;
  });
}

export async function updateTemplate(id: string, input: TemplateInput) {
  return ownerAction(async () => {
    const data = templateSchema.parse(input);
    await db.update(templates).set(data).where(eq(templates.id, id));
    revalidate();
  });
}

export async function deleteTemplate(id: string) {
  return ownerAction(async () => {
    await db.delete(templates).where(eq(templates.id, id));
    revalidate();
  });
}

export async function createPromptFromTemplate(id: string) {
  return ownerAction(async () => {
    const template = await db.query.templates.findFirst({ where: eq(templates.id, id) });
    if (!template) throw new Error("Template not found");
    const title = `${template.name}`;
    const [prompt] = await db
      .insert(prompts)
      .values({
        title,
        slug: uniqueSlug(title),
        description: template.description,
        promptText: template.content,
        category: "other",
        intent: "other",
        targetTool: "other",
        status: "draft",
        notes: template.usageNotes,
      })
      .returning({ id: prompts.id, slug: prompts.slug });
    await db.insert(promptVersions).values({
      promptId: prompt.id,
      versionNumber: 1,
      title,
      promptText: template.content,
      changeSummary: `Created from template "${template.name}"`,
    });
    revalidate();
    return prompt;
  });
}

export async function createWorkflowFromTemplate(id: string) {
  return ownerAction(async () => {
    const template = await db.query.templates.findFirst({ where: eq(templates.id, id) });
    if (!template) throw new Error("Template not found");
    const [workflow] = await db
      .insert(workflows)
      .values({
        title: template.name,
        slug: uniqueSlug(template.name),
        description: template.description,
        workflowType: "other",
        status: "draft",
        notes: template.usageNotes,
      })
      .returning({ id: workflows.id, slug: workflows.slug });
    revalidate();
    return workflow;
  });
}

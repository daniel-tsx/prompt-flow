"use server";

import { revalidatePath } from "next/cache";
import { and, eq, max, ne } from "drizzle-orm";
import { db } from "@/db";
import { promptRuns, promptVersions, prompts, templates } from "@/db/schema";
import { runAction } from "@/lib/action-result";
import { uniqueSlug } from "@/lib/utils";
import {
  promptSchema,
  promptVersionSchema,
  type PromptInput,
  type PromptVersionInput,
} from "@/lib/validations";

function revalidate() {
  revalidatePath("/", "layout");
}

export async function createPrompt(input: PromptInput) {
  return runAction(async () => {
    const data = promptSchema.parse(input);
    const [row] = await db
      .insert(prompts)
      .values({ ...data, slug: uniqueSlug(data.title) })
      .returning({ id: prompts.id, slug: prompts.slug });

    // Seed an initial version so the history is never empty.
    await db.insert(promptVersions).values({
      promptId: row.id,
      versionNumber: 1,
      title: data.title,
      promptText: data.promptText,
      changeSummary: "Initial version",
      qualityScore: data.qualityScore ?? null,
    });
    revalidate();
    return row;
  });
}

export async function updatePrompt(id: string, input: PromptInput) {
  return runAction(async () => {
    const data = promptSchema.parse(input);
    const [row] = await db
      .update(prompts)
      .set(data)
      .where(eq(prompts.id, id))
      .returning({ id: prompts.id, slug: prompts.slug });
    revalidate();
    return row;
  });
}

export async function togglePromptFavorite(id: string, favorite: boolean) {
  return runAction(async () => {
    await db.update(prompts).set({ favorite }).where(eq(prompts.id, id));
    revalidate();
  });
}

export async function setPromptStatus(id: string, status: PromptInput["status"]) {
  return runAction(async () => {
    await db.update(prompts).set({ status }).where(eq(prompts.id, id));
    revalidate();
  });
}

export async function archivePrompt(id: string) {
  return setPromptStatus(id, "archived");
}

export async function deletePrompt(id: string) {
  return runAction(async () => {
    await db.delete(prompts).where(eq(prompts.id, id));
    revalidate();
  });
}

export async function duplicatePrompt(id: string) {
  return runAction(async () => {
    const original = await db.query.prompts.findFirst({ where: eq(prompts.id, id) });
    if (!original) throw new Error("Prompt not found");
    const { id: _omit, createdAt, updatedAt, currentVersionId, slug, title, ...rest } =
      original;
    void _omit;
    void createdAt;
    void updatedAt;
    void currentVersionId;
    void slug;
    const newTitle = `${title} (copy)`;
    const [row] = await db
      .insert(prompts)
      .values({ ...rest, title: newTitle, slug: uniqueSlug(newTitle), favorite: false })
      .returning({ id: prompts.id, slug: prompts.slug });
    await db.insert(promptVersions).values({
      promptId: row.id,
      versionNumber: 1,
      title: newTitle,
      promptText: rest.promptText,
      changeSummary: `Duplicated from "${title}"`,
    });
    revalidate();
    return row;
  });
}

export async function createPromptVersion(input: PromptVersionInput, markCurrent = true) {
  return runAction(async () => {
    const data = promptVersionSchema.parse(input);
    const [{ value: currentMax }] = await db
      .select({ value: max(promptVersions.versionNumber) })
      .from(promptVersions)
      .where(eq(promptVersions.promptId, data.promptId));

    const [version] = await db
      .insert(promptVersions)
      .values({ ...data, versionNumber: (currentMax ?? 0) + 1 })
      .returning();

    if (markCurrent) {
      await db
        .update(prompts)
        .set({
          currentVersionId: version.id,
          promptText: data.promptText,
          title: data.title,
          qualityScore: data.qualityScore ?? undefined,
        })
        .where(eq(prompts.id, data.promptId));
    }
    revalidate();
    return version;
  });
}

export async function setCurrentVersion(promptId: string, versionId: string) {
  return runAction(async () => {
    const version = await db.query.promptVersions.findFirst({
      where: eq(promptVersions.id, versionId),
    });
    if (!version) throw new Error("Version not found");
    await db
      .update(prompts)
      .set({ currentVersionId: versionId, promptText: version.promptText, title: version.title })
      .where(eq(prompts.id, promptId));
    revalidate();
  });
}

export async function deletePromptVersion(promptId: string, versionId: string) {
  return runAction(async () => {
    // Keep at least one version around.
    const remaining = await db
      .select({ id: promptVersions.id })
      .from(promptVersions)
      .where(and(eq(promptVersions.promptId, promptId), ne(promptVersions.id, versionId)));
    if (remaining.length === 0) throw new Error("Can't delete the only version");
    await db.delete(promptVersions).where(eq(promptVersions.id, versionId));
    revalidate();
  });
}

export async function convertPromptToTemplate(id: string) {
  return runAction(async () => {
    const prompt = await db.query.prompts.findFirst({ where: eq(prompts.id, id) });
    if (!prompt) throw new Error("Prompt not found");
    const [row] = await db
      .insert(templates)
      .values({
        name: prompt.title,
        templateType: "prompt",
        description: prompt.description,
        content: prompt.promptText,
        usageNotes: prompt.notes,
      })
      .returning({ id: templates.id });
    revalidate();
    return row;
  });
}

export async function deletePromptRun(id: string) {
  return runAction(async () => {
    await db.delete(promptRuns).where(eq(promptRuns.id, id));
    revalidate();
  });
}

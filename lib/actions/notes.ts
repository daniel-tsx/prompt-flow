"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { notes, prompts, promptVersions, templates, workflows } from "@/db/schema";
import { ownerAction } from "@/lib/action-result";
import { uniqueSlug } from "@/lib/utils";
import {
  noteSchema,
  quickCaptureSchema,
  type NoteInput,
  type QuickCaptureInput,
} from "@/lib/validations";

function revalidate() {
  revalidatePath("/", "layout");
}

export async function createNote(input: NoteInput) {
  return ownerAction(async () => {
    const data = noteSchema.parse(input);
    const [row] = await db.insert(notes).values(data).returning({ id: notes.id });
    revalidate();
    return row;
  });
}

export async function quickCapture(input: QuickCaptureInput) {
  return ownerAction(async () => {
    const data = quickCaptureSchema.parse(input);
    const [row] = await db
      .insert(notes)
      .values({ ...data, status: "inbox" })
      .returning({ id: notes.id });
    revalidate();
    return row;
  });
}

export async function updateNote(id: string, input: NoteInput) {
  return ownerAction(async () => {
    const data = noteSchema.parse(input);
    await db.update(notes).set(data).where(eq(notes.id, id));
    revalidate();
  });
}

export async function setNoteStatus(id: string, status: NoteInput["status"]) {
  return ownerAction(async () => {
    await db.update(notes).set({ status }).where(eq(notes.id, id));
    revalidate();
  });
}

export async function toggleNotePin(id: string, pinned: boolean) {
  return ownerAction(async () => {
    await db.update(notes).set({ pinned }).where(eq(notes.id, id));
    revalidate();
  });
}

export async function deleteNote(id: string) {
  return ownerAction(async () => {
    await db.delete(notes).where(eq(notes.id, id));
    revalidate();
  });
}

export async function convertNoteToPrompt(id: string) {
  return ownerAction(async () => {
    const note = await db.query.notes.findFirst({ where: eq(notes.id, id) });
    if (!note) throw new Error("Note not found");
    const [prompt] = await db
      .insert(prompts)
      .values({
        title: note.title,
        slug: uniqueSlug(note.title),
        description: note.body ? note.body.slice(0, 200) : null,
        promptText: note.body ?? "",
        category: "other",
        intent: "other",
        targetTool: "other",
        status: "draft",
        relatedProjectId: note.relatedProjectId,
        tags: note.tags,
      })
      .returning({ id: prompts.id, slug: prompts.slug });
    await db.insert(promptVersions).values({
      promptId: prompt.id,
      versionNumber: 1,
      title: note.title,
      promptText: note.body ?? "",
      changeSummary: "Converted from note",
    });
    await db
      .update(notes)
      .set({ status: "converted", relatedPromptId: prompt.id })
      .where(eq(notes.id, id));
    revalidate();
    return prompt;
  });
}

export async function convertNoteToWorkflow(id: string) {
  return ownerAction(async () => {
    const note = await db.query.notes.findFirst({ where: eq(notes.id, id) });
    if (!note) throw new Error("Note not found");
    const [workflow] = await db
      .insert(workflows)
      .values({
        title: note.title,
        slug: uniqueSlug(note.title),
        description: note.body,
        workflowType: "other",
        status: "draft",
        relatedProjectId: note.relatedProjectId,
        tags: note.tags,
      })
      .returning({ id: workflows.id, slug: workflows.slug });
    await db
      .update(notes)
      .set({ status: "converted", relatedWorkflowId: workflow.id })
      .where(eq(notes.id, id));
    revalidate();
    return workflow;
  });
}

export async function convertNoteToTemplate(id: string) {
  return ownerAction(async () => {
    const note = await db.query.notes.findFirst({ where: eq(notes.id, id) });
    if (!note) throw new Error("Note not found");
    const [template] = await db
      .insert(templates)
      .values({
        name: note.title,
        templateType: "note",
        description: note.body ? note.body.slice(0, 200) : null,
        content: note.body ?? "",
      })
      .returning({ id: templates.id });
    await db.update(notes).set({ status: "converted" }).where(eq(notes.id, id));
    revalidate();
    return template;
  });
}

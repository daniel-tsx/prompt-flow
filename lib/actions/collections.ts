"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  collectionItems,
  collections,
  notes,
  prompts,
  templates,
  workflowSteps,
  workflows,
} from "@/db/schema";
import { runAction } from "@/lib/action-result";
import {
  collectionToMarkdown,
  promptToMarkdown,
  workflowToMarkdown,
} from "@/lib/export";
import {
  collectionItemSchema,
  collectionSchema,
  type CollectionInput,
  type CollectionItemInput,
} from "@/lib/validations";

function revalidate() {
  revalidatePath("/", "layout");
}

export async function createCollection(input: CollectionInput) {
  return runAction(async () => {
    const data = collectionSchema.parse(input);
    const [row] = await db.insert(collections).values(data).returning({ id: collections.id });
    revalidate();
    return row;
  });
}

export async function updateCollection(id: string, input: CollectionInput) {
  return runAction(async () => {
    const data = collectionSchema.parse(input);
    await db.update(collections).set(data).where(eq(collections.id, id));
    revalidate();
  });
}

export async function deleteCollection(id: string) {
  return runAction(async () => {
    await db.delete(collections).where(eq(collections.id, id));
    revalidate();
  });
}

export async function addCollectionItem(input: CollectionItemInput) {
  return runAction(async () => {
    const data = collectionItemSchema.parse(input);
    const existing = await db
      .select({ id: collectionItems.id })
      .from(collectionItems)
      .where(
        and(
          eq(collectionItems.collectionId, data.collectionId),
          eq(collectionItems.itemType, data.itemType),
          eq(collectionItems.itemId, data.itemId),
        ),
      );
    if (existing.length) return existing[0];
    const [row] = await db.insert(collectionItems).values(data).returning({ id: collectionItems.id });
    revalidate();
    return row;
  });
}

export async function removeCollectionItem(rowId: string) {
  return runAction(async () => {
    await db.delete(collectionItems).where(eq(collectionItems.id, rowId));
    revalidate();
  });
}

export async function exportCollectionMarkdown(id: string) {
  return runAction(async () => {
    const collection = await db.query.collections.findFirst({ where: eq(collections.id, id) });
    if (!collection) throw new Error("Collection not found");
    const items = await db
      .select()
      .from(collectionItems)
      .where(eq(collectionItems.collectionId, id))
      .orderBy(collectionItems.position);

    const promptIds = items.filter((i) => i.itemType === "prompt").map((i) => i.itemId);
    const workflowIds = items.filter((i) => i.itemType === "workflow").map((i) => i.itemId);
    const templateIds = items.filter((i) => i.itemType === "template").map((i) => i.itemId);
    const noteIds = items.filter((i) => i.itemType === "note").map((i) => i.itemId);

    const [promptRows, workflowRows, templateRows, noteRows, allSteps] = await Promise.all([
      promptIds.length ? db.select().from(prompts).where(inArray(prompts.id, promptIds)) : Promise.resolve([]),
      workflowIds.length ? db.select().from(workflows).where(inArray(workflows.id, workflowIds)) : Promise.resolve([]),
      templateIds.length ? db.select().from(templates).where(inArray(templates.id, templateIds)) : Promise.resolve([]),
      noteIds.length ? db.select().from(notes).where(inArray(notes.id, noteIds)) : Promise.resolve([]),
      workflowIds.length ? db.select().from(workflowSteps).where(inArray(workflowSteps.workflowId, workflowIds)) : Promise.resolve([]),
    ]);

    const sections: { heading: string; markdown: string }[] = [];
    if (promptRows.length)
      sections.push({ heading: "Prompts", markdown: promptRows.map(promptToMarkdown).join("\n\n---\n\n") });
    if (workflowRows.length)
      sections.push({
        heading: "Workflows",
        markdown: workflowRows
          .map((w) => workflowToMarkdown(w, allSteps.filter((s) => s.workflowId === w.id)))
          .join("\n\n---\n\n"),
      });
    if (templateRows.length)
      sections.push({
        heading: "Templates",
        markdown: templateRows.map((t) => `### ${t.name}\n\n\`\`\`\n${t.content}\n\`\`\``).join("\n\n"),
      });
    if (noteRows.length)
      sections.push({
        heading: "Notes",
        markdown: noteRows.map((n) => `### ${n.title}\n\n${n.body ?? ""}`).join("\n\n"),
      });

    return { markdown: collectionToMarkdown(collection, sections), name: collection.name };
  });
}

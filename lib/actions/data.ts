"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  collectionItems,
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
import { ownerAction, runAction } from "@/lib/action-result";
import { getAccount } from "@/lib/account";
import {
  buildBackup,
  notesToCsv,
  promptsToMarkdown,
  workflowsToMarkdown,
  type FullBackup,
} from "@/lib/export";

/** Export the current account's library as a JSON backup string. */
export async function exportAllData() {
  return runAction(async () => {
    const account = await getAccount();
    const [
      allProjects,
      allPrompts,
      allVersions,
      allRuns,
      allWorkflows,
      allSteps,
      allNotes,
      allTemplates,
      allCollections,
      allItems,
    ] = await Promise.all([
      db.select().from(projects).where(eq(projects.account, account)),
      db.select().from(prompts).where(eq(prompts.account, account)),
      db.select().from(promptVersions).where(eq(promptVersions.account, account)),
      db.select().from(promptRuns).where(eq(promptRuns.account, account)),
      db.select().from(workflows).where(eq(workflows.account, account)),
      db.select().from(workflowSteps).where(eq(workflowSteps.account, account)),
      db.select().from(notes).where(eq(notes.account, account)),
      db.select().from(templates).where(eq(templates.account, account)),
      db.select().from(collections).where(eq(collections.account, account)),
      db.select().from(collectionItems).where(eq(collectionItems.account, account)),
    ]);

    return buildBackup({
      projects: allProjects,
      prompts: allPrompts,
      promptVersions: allVersions,
      promptRuns: allRuns,
      workflows: allWorkflows,
      workflowSteps: allSteps,
      notes: allNotes,
      templates: allTemplates,
      collections: allCollections,
      collectionItems: allItems,
    });
  });
}

export async function exportPromptsMarkdown() {
  return runAction(async () => {
    const account = await getAccount();
    const rows = await db.select().from(prompts).where(eq(prompts.account, account));
    return promptsToMarkdown(rows);
  });
}

export async function exportWorkflowsMarkdown() {
  return runAction(async () => {
    const account = await getAccount();
    const [wfRows, stepRows] = await Promise.all([
      db.select().from(workflows).where(eq(workflows.account, account)),
      db.select().from(workflowSteps).where(eq(workflowSteps.account, account)),
    ]);
    return workflowsToMarkdown(
      wfRows.map((workflow) => ({
        workflow,
        steps: stepRows.filter((s) => s.workflowId === workflow.id),
      })),
    );
  });
}

export async function exportNotesCsv() {
  return runAction(async () => {
    const account = await getAccount();
    const rows = await db.select().from(notes).where(eq(notes.account, account));
    return notesToCsv(rows);
  });
}

/** Replace the owner account's data with a JSON backup (demo data is untouched). */
export async function importBackup(json: string) {
  return ownerAction(async () => {
    let parsed: FullBackup;
    try {
      // Revive ISO date strings back into Date objects for timestamp columns.
      parsed = JSON.parse(json, (_key, value) => {
        if (
          typeof value === "string" &&
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)
        ) {
          return new Date(value);
        }
        return value;
      });
    } catch {
      throw new Error("Invalid JSON file");
    }
    if (parsed?.meta?.app !== "PromptFlow Library") {
      throw new Error("This doesn't look like a PromptFlow backup");
    }

    // Clear ONLY the owner account, in reverse FK order. Demo stays intact.
    await db.delete(collectionItems).where(eq(collectionItems.account, "owner"));
    await db.delete(collections).where(eq(collections.account, "owner"));
    await db.delete(templates).where(eq(templates.account, "owner"));
    await db.delete(notes).where(eq(notes.account, "owner"));
    await db.delete(workflowSteps).where(eq(workflowSteps.account, "owner"));
    await db.delete(workflows).where(eq(workflows.account, "owner"));
    await db.delete(promptRuns).where(eq(promptRuns.account, "owner"));
    await db.delete(promptVersions).where(eq(promptVersions.account, "owner"));
    await db.delete(prompts).where(eq(prompts.account, "owner"));
    await db.delete(projects).where(eq(projects.account, "owner"));

    // Force every imported row into the owner account.
    const asOwner = <T extends Record<string, unknown>>(rows: T[] | undefined) =>
      (rows ?? []).map((r) => ({ ...r, account: "owner" as const }));

    const insertIf = async <T>(table: Parameters<typeof db.insert>[0], rows: T[]) => {
      if (rows?.length) await db.insert(table).values(rows as never);
    };

    await insertIf(projects, asOwner(parsed.projects));
    await insertIf(prompts, asOwner(parsed.prompts));
    await insertIf(promptVersions, asOwner(parsed.promptVersions));
    await insertIf(promptRuns, asOwner(parsed.promptRuns));
    await insertIf(workflows, asOwner(parsed.workflows));
    await insertIf(workflowSteps, asOwner(parsed.workflowSteps));
    await insertIf(notes, asOwner(parsed.notes));
    await insertIf(templates, asOwner(parsed.templates));
    await insertIf(collections, asOwner(parsed.collections));
    await insertIf(collectionItems, asOwner(parsed.collectionItems));

    revalidatePath("/", "layout");
    return {
      prompts: parsed.prompts?.length ?? 0,
      workflows: parsed.workflows?.length ?? 0,
      notes: parsed.notes?.length ?? 0,
    };
  });
}

"use server";

import { revalidatePath } from "next/cache";
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
import { runAction } from "@/lib/action-result";
import {
  buildBackup,
  notesToCsv,
  promptsToMarkdown,
  workflowsToMarkdown,
  type FullBackup,
} from "@/lib/export";

/** Export the entire library as a JSON backup string. */
export async function exportAllData() {
  return runAction(async () => {
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
      db.select().from(projects),
      db.select().from(prompts),
      db.select().from(promptVersions),
      db.select().from(promptRuns),
      db.select().from(workflows),
      db.select().from(workflowSteps),
      db.select().from(notes),
      db.select().from(templates),
      db.select().from(collections),
      db.select().from(collectionItems),
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
    const rows = await db.select().from(prompts);
    return promptsToMarkdown(rows);
  });
}

export async function exportWorkflowsMarkdown() {
  return runAction(async () => {
    const [wfRows, stepRows] = await Promise.all([
      db.select().from(workflows),
      db.select().from(workflowSteps),
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
    const rows = await db.select().from(notes);
    return notesToCsv(rows);
  });
}

/** Replace all data with the contents of a JSON backup. */
export async function importBackup(json: string) {
  return runAction(async () => {
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

    // Clear in reverse FK order
    await db.delete(collectionItems);
    await db.delete(collections);
    await db.delete(templates);
    await db.delete(notes);
    await db.delete(workflowSteps);
    await db.delete(workflows);
    await db.delete(promptRuns);
    await db.delete(promptVersions);
    await db.delete(prompts);
    await db.delete(projects);

    const insertIf = async <T>(table: Parameters<typeof db.insert>[0], rows: T[]) => {
      if (rows?.length) await db.insert(table).values(rows as never);
    };

    await insertIf(projects, parsed.projects);
    await insertIf(prompts, parsed.prompts);
    await insertIf(promptVersions, parsed.promptVersions);
    await insertIf(promptRuns, parsed.promptRuns);
    await insertIf(workflows, parsed.workflows);
    await insertIf(workflowSteps, parsed.workflowSteps);
    await insertIf(notes, parsed.notes);
    await insertIf(templates, parsed.templates);
    await insertIf(collections, parsed.collections);
    await insertIf(collectionItems, parsed.collectionItems);

    revalidatePath("/", "layout");
    return {
      prompts: parsed.prompts?.length ?? 0,
      workflows: parsed.workflows?.length ?? 0,
      notes: parsed.notes?.length ?? 0,
    };
  });
}

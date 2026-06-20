/**
 * Export builders — pure functions producing JSON / Markdown / CSV strings.
 * Inputs are the Drizzle row types; outputs are plain strings.
 */

import type {
  Collection,
  CollectionItem,
  Note,
  Prompt,
  PromptRun,
  PromptVersion,
  Template,
  Project,
  Workflow,
  WorkflowStep,
} from "@/db/schema";

export type FullBackup = {
  meta: { app: "PromptFlow Library"; version: 1; exportedAt: string };
  projects: Project[];
  prompts: Prompt[];
  promptVersions: PromptVersion[];
  promptRuns: PromptRun[];
  workflows: Workflow[];
  workflowSteps: WorkflowStep[];
  notes: Note[];
  templates: Template[];
  collections: Collection[];
  collectionItems: CollectionItem[];
};

export function buildBackup(data: Omit<FullBackup, "meta">): string {
  const backup: FullBackup = {
    meta: {
      app: "PromptFlow Library",
      version: 1,
      exportedAt: new Date().toISOString(),
    },
    ...data,
  };
  return JSON.stringify(backup, null, 2);
}

/* -------------------------------- Markdown -------------------------------- */

export function promptToMarkdown(p: Prompt): string {
  const lines = [
    `## ${p.title}`,
    "",
    p.description ? `> ${p.description}` : "",
    "",
    `- **Category:** ${p.category}`,
    `- **Intent:** ${p.intent}`,
    `- **Target tool:** ${p.targetTool}${p.targetModel ? ` (${p.targetModel})` : ""}`,
    `- **Status:** ${p.status}${p.favorite ? " · ⭐ favorite" : ""}`,
    p.tags.length ? `- **Tags:** ${p.tags.join(", ")}` : "",
    "",
    "```",
    p.promptText || "(empty)",
    "```",
    p.notes ? `\n**Notes:** ${p.notes}` : "",
  ];
  return lines.filter((l) => l !== "").join("\n");
}

export function promptsToMarkdown(prompts: Prompt[]): string {
  return [
    "# Prompt Pack",
    `_Exported ${new Date().toLocaleDateString()} · ${prompts.length} prompts_`,
    "",
    prompts.map(promptToMarkdown).join("\n\n---\n\n"),
  ].join("\n");
}

export function workflowToMarkdown(
  w: Workflow,
  steps: WorkflowStep[],
): string {
  const stepLines = steps
    .sort((a, b) => a.order - b.order)
    .map((s, i) => {
      const parts = [`### Step ${i + 1}: ${s.title}`];
      if (s.instruction) parts.push("", s.instruction);
      if (s.expectedOutput) parts.push("", `**Expected output:** ${s.expectedOutput}`);
      if (s.checklist.length)
        parts.push("", ...s.checklist.map((c) => `- [ ] ${c}`));
      return parts.join("\n");
    })
    .join("\n\n");

  return [
    `## ${w.title}`,
    "",
    w.description ?? "",
    "",
    `- **Type:** ${w.workflowType}`,
    `- **Status:** ${w.status}`,
    w.toolsUsed.length ? `- **Tools:** ${w.toolsUsed.join(", ")}` : "",
    w.whenToUse ? `\n**When to use:** ${w.whenToUse}` : "",
    w.whenNotToUse ? `**When not to use:** ${w.whenNotToUse}` : "",
    w.outcome ? `**Outcome:** ${w.outcome}` : "",
    "",
    "### Steps",
    "",
    stepLines || "_No steps yet._",
  ]
    .filter((l) => l !== "")
    .join("\n");
}

export function workflowsToMarkdown(
  workflows: { workflow: Workflow; steps: WorkflowStep[] }[],
): string {
  return [
    "# Workflow Pack",
    `_Exported ${new Date().toLocaleDateString()} · ${workflows.length} workflows_`,
    "",
    workflows
      .map(({ workflow, steps }) => workflowToMarkdown(workflow, steps))
      .join("\n\n---\n\n"),
  ].join("\n");
}

export function collectionToMarkdown(
  collection: Collection,
  sections: { heading: string; markdown: string }[],
): string {
  return [
    `# ${collection.name}`,
    collection.description ?? "",
    "",
    sections.map((s) => `## ${s.heading}\n\n${s.markdown}`).join("\n\n"),
  ]
    .filter(Boolean)
    .join("\n");
}

/* ----------------------------------- CSV ---------------------------------- */

function csvCell(value: unknown): string {
  if (value == null) return "";
  const str = Array.isArray(value) ? value.join("; ") : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const header = columns.map(csvCell).join(",");
  const body = rows
    .map((row) => columns.map((col) => csvCell(row[col])).join(","))
    .join("\n");
  return `${header}\n${body}`;
}

export function notesToCsv(notes: Note[]): string {
  return toCsv(
    notes.map((n) => ({
      title: n.title,
      type: n.noteType,
      status: n.status,
      priority: n.priority,
      pinned: n.pinned,
      dueDate: n.dueDate ? new Date(n.dueDate).toISOString() : "",
      tags: n.tags,
      createdAt: new Date(n.createdAt).toISOString(),
    })),
    ["title", "type", "status", "priority", "pinned", "dueDate", "tags", "createdAt"],
  );
}

import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*  Enum tuples (kept in sync with db/schema.ts)                                */
/* -------------------------------------------------------------------------- */

export const projectTypes = [
  "personal",
  "commercial",
  "internal-tool",
  "devtool",
  "content",
  "learning",
  "experiment",
  "other",
] as const;
export const projectStatuses = ["active", "paused", "archived"] as const;

export const promptCategories = [
  "coding-agent",
  "project-bootstrap",
  "ui-design",
  "frontend",
  "backend",
  "database",
  "api-review",
  "testing",
  "refactor",
  "seo",
  "marketing",
  "social-post",
  "blog-writing",
  "product-research",
  "image-generation",
  "video-generation",
  "system-design",
  "learning",
  "debugging",
  "code-review",
  "other",
] as const;
export const promptIntents = [
  "generate-code",
  "review-code",
  "plan-project",
  "design-ui",
  "write-content",
  "research",
  "summarize",
  "debug",
  "generate-media",
  "teach",
  "brainstorm",
  "other",
] as const;
export const targetTools = [
  "Codex",
  "Claude Code",
  "Cursor",
  "ChatGPT",
  "Gemini",
  "image-model",
  "video-model",
  "other",
] as const;
export const promptStatuses = [
  "draft",
  "tested",
  "reliable",
  "needs-improvement",
  "archived",
] as const;
export const runResults = [
  "excellent",
  "good",
  "usable-with-edits",
  "poor",
  "failed",
] as const;
export const workflowTypes = [
  "coding",
  "design",
  "product-planning",
  "marketing",
  "seo",
  "research",
  "launch",
  "content",
  "debugging",
  "learning",
  "other",
] as const;
export const workflowStatuses = [
  "draft",
  "active",
  "reliable",
  "needs-improvement",
  "archived",
] as const;
export const noteTypes = [
  "quick-note",
  "task",
  "idea",
  "product-idea",
  "content-idea",
  "prompt-idea",
  "workflow-idea",
  "technical-note",
  "reminder",
  "learning-note",
  "other",
] as const;
export const noteStatuses = ["inbox", "active", "done", "converted", "archived"] as const;
export const priorities = ["low", "medium", "high"] as const;
export const templateTypes = [
  "prompt",
  "workflow",
  "note",
  "task",
  "project-bootstrap",
  "coding-agent",
  "media-generation",
  "content",
  "other",
] as const;
export const collectionTypes = [
  "prompt-pack",
  "workflow-pack",
  "project-pack",
  "content-pack",
  "media-pack",
  "learning-pack",
  "other",
] as const;
export const collectionItemTypes = ["prompt", "workflow", "template", "note"] as const;

/* -------------------------------------------------------------------------- */
/*  Shared fields                                                               */
/* -------------------------------------------------------------------------- */

const score = z.number().int().min(1).max(10).nullable().optional();
const tags = z.array(z.string().min(1)).default([]);
const optionalText = z.string().trim().max(20000).optional().nullable();
const id = z.string().uuid();

/* -------------------------------------------------------------------------- */
/*  Project                                                                     */
/* -------------------------------------------------------------------------- */

export const projectSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  description: optionalText,
  domain: z.string().trim().max(200).optional().nullable(),
  type: z.enum(projectTypes).default("personal"),
  status: z.enum(projectStatuses).default("active"),
  color: z.string().trim().max(20).default("#8b5cf6"),
});
export type ProjectInput = z.infer<typeof projectSchema>;

/* -------------------------------------------------------------------------- */
/*  Prompt                                                                      */
/* -------------------------------------------------------------------------- */

export const promptSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: optionalText,
  promptText: z.string().max(50000).default(""),
  category: z.enum(promptCategories).default("other"),
  intent: z.enum(promptIntents).default("other"),
  targetTool: z.enum(targetTools).default("other"),
  targetModel: z.string().trim().max(120).optional().nullable(),
  relatedProjectId: z.string().uuid().nullable().optional(),
  status: z.enum(promptStatuses).default("draft"),
  reusable: z.boolean().default(true),
  favorite: z.boolean().default(false),
  qualityScore: score,
  clarityScore: score,
  resultScore: score,
  costEfficiencyScore: score,
  tags,
  notes: optionalText,
});
export type PromptInput = z.infer<typeof promptSchema>;

export const promptVersionSchema = z.object({
  promptId: id,
  title: z.string().trim().min(1).max(200),
  promptText: z.string().max(50000).default(""),
  changeSummary: optionalText,
  reasonForChange: optionalText,
  resultNotes: optionalText,
  qualityScore: score,
});
export type PromptVersionInput = z.infer<typeof promptVersionSchema>;

export const promptRunSchema = z.object({
  promptId: id,
  promptVersionId: z.string().uuid().nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(1, "Title is required").max(200),
  date: z.coerce.date().default(() => new Date()),
  toolUsed: z.enum(targetTools).default("other"),
  modelUsed: z.string().trim().max(120).optional().nullable(),
  taskDescription: optionalText,
  inputContext: optionalText,
  outputSummary: optionalText,
  resultStatus: z.enum(runResults).default("good"),
  timeSpentMinutes: z.number().int().min(0).max(100000).nullable().optional(),
  estimatedTimeSavedMinutes: z.number().int().min(0).max(100000).nullable().optional(),
  problems: tags,
  lessonsLearned: optionalText,
  followUpNeeded: z.boolean().default(false),
  followUpNote: optionalText,
});
export type PromptRunInput = z.infer<typeof promptRunSchema>;

/* -------------------------------------------------------------------------- */
/*  Workflow                                                                    */
/* -------------------------------------------------------------------------- */

export const workflowStepSchema = z.object({
  id: z.string().uuid().optional(),
  order: z.number().int().min(0).default(0),
  title: z.string().trim().min(1, "Step title is required").max(200),
  description: optionalText,
  linkedPromptId: z.string().uuid().nullable().optional(),
  instruction: optionalText,
  expectedOutput: optionalText,
  checklist: tags,
});
export type WorkflowStepInput = z.infer<typeof workflowStepSchema>;

export const workflowSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: optionalText,
  workflowType: z.enum(workflowTypes).default("other"),
  relatedProjectId: z.string().uuid().nullable().optional(),
  status: z.enum(workflowStatuses).default("draft"),
  outcome: optionalText,
  whenToUse: optionalText,
  whenNotToUse: optionalText,
  toolsUsed: tags,
  favorite: z.boolean().default(false),
  tags,
  notes: optionalText,
  steps: z.array(workflowStepSchema).default([]),
});
export type WorkflowInput = z.infer<typeof workflowSchema>;

/* -------------------------------------------------------------------------- */
/*  Note / Task                                                                 */
/* -------------------------------------------------------------------------- */

export const noteSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(300),
  body: optionalText,
  noteType: z.enum(noteTypes).default("quick-note"),
  status: z.enum(noteStatuses).default("inbox"),
  priority: z.enum(priorities).default("medium"),
  relatedProjectId: z.string().uuid().nullable().optional(),
  relatedPromptId: z.string().uuid().nullable().optional(),
  relatedWorkflowId: z.string().uuid().nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  pinned: z.boolean().default(false),
  tags,
});
export type NoteInput = z.infer<typeof noteSchema>;

/* -------------------------------------------------------------------------- */
/*  Template                                                                    */
/* -------------------------------------------------------------------------- */

export const templateVariableSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional(),
  example: z.string().trim().optional(),
});

export const templateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  templateType: z.enum(templateTypes).default("prompt"),
  description: optionalText,
  content: z.string().max(50000).default(""),
  variables: z.array(templateVariableSchema).default([]),
  usageNotes: optionalText,
});
export type TemplateInput = z.infer<typeof templateSchema>;

/* -------------------------------------------------------------------------- */
/*  Collection                                                                  */
/* -------------------------------------------------------------------------- */

export const collectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  description: optionalText,
  icon: z.string().trim().max(40).optional().nullable(),
  color: z.string().trim().max(20).default("#8b5cf6"),
  collectionType: z.enum(collectionTypes).default("other"),
});
export type CollectionInput = z.infer<typeof collectionSchema>;

export const collectionItemSchema = z.object({
  collectionId: id,
  itemType: z.enum(collectionItemTypes),
  itemId: id,
});
export type CollectionItemInput = z.infer<typeof collectionItemSchema>;

/* -------------------------------------------------------------------------- */
/*  Tag                                                                         */
/* -------------------------------------------------------------------------- */

export const tagSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  color: z.string().trim().max(20).default("#8b5cf6"),
});
export type TagInput = z.infer<typeof tagSchema>;

/* -------------------------------------------------------------------------- */
/*  Quick capture (the global fast-capture box)                                 */
/* -------------------------------------------------------------------------- */

export const quickCaptureSchema = z.object({
  title: z.string().trim().min(1, "Type something to capture"),
  body: optionalText,
  noteType: z.enum(noteTypes).default("quick-note"),
  priority: z.enum(priorities).default("medium"),
  relatedProjectId: z.string().uuid().nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  pinned: z.boolean().default(false),
  tags,
});
export type QuickCaptureInput = z.infer<typeof quickCaptureSchema>;

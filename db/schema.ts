import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/* -------------------------------------------------------------------------- */
/*  Enums                                                                      */
/* -------------------------------------------------------------------------- */

export const projectTypeEnum = pgEnum("project_type", [
  "personal",
  "commercial",
  "internal-tool",
  "devtool",
  "content",
  "learning",
  "experiment",
  "other",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "active",
  "paused",
  "archived",
]);

export const promptCategoryEnum = pgEnum("prompt_category", [
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
]);

export const promptIntentEnum = pgEnum("prompt_intent", [
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
]);

export const targetToolEnum = pgEnum("target_tool", [
  "Codex",
  "Claude Code",
  "Cursor",
  "ChatGPT",
  "Gemini",
  "image-model",
  "video-model",
  "other",
]);

export const promptStatusEnum = pgEnum("prompt_status", [
  "draft",
  "tested",
  "reliable",
  "needs-improvement",
  "archived",
]);

export const runResultStatusEnum = pgEnum("run_result_status", [
  "excellent",
  "good",
  "usable-with-edits",
  "poor",
  "failed",
]);

export const workflowTypeEnum = pgEnum("workflow_type", [
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
]);

export const workflowStatusEnum = pgEnum("workflow_status", [
  "draft",
  "active",
  "reliable",
  "needs-improvement",
  "archived",
]);

export const noteTypeEnum = pgEnum("note_type", [
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
]);

export const noteStatusEnum = pgEnum("note_status", [
  "inbox",
  "active",
  "done",
  "converted",
  "archived",
]);

export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);

export const templateTypeEnum = pgEnum("template_type", [
  "prompt",
  "workflow",
  "note",
  "task",
  "project-bootstrap",
  "coding-agent",
  "media-generation",
  "content",
  "other",
]);

export const collectionTypeEnum = pgEnum("collection_type", [
  "prompt-pack",
  "workflow-pack",
  "project-pack",
  "content-pack",
  "media-pack",
  "learning-pack",
  "other",
]);

export const collectionItemTypeEnum = pgEnum("collection_item_type", [
  "prompt",
  "workflow",
  "template",
  "note",
]);

/* -------------------------------------------------------------------------- */
/*  Shared column helpers                                                      */
/* -------------------------------------------------------------------------- */

const createdAt = timestamp("created_at", { withTimezone: true })
  .defaultNow()
  .notNull();

const updatedAt = timestamp("updated_at", { withTimezone: true })
  .defaultNow()
  .notNull()
  .$onUpdate(() => new Date());

const tagsColumn = () =>
  text("tags")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`);

const stringArray = (name: string) =>
  text(name)
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`);

/* -------------------------------------------------------------------------- */
/*  Projects                                                                   */
/* -------------------------------------------------------------------------- */

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    domain: text("domain"),
    type: projectTypeEnum("type").notNull().default("personal"),
    status: projectStatusEnum("status").notNull().default("active"),
    color: text("color").notNull().default("#8b5cf6"),
    createdAt,
    updatedAt,
  },
  (t) => [uniqueIndex("projects_slug_idx").on(t.slug)],
);

/* -------------------------------------------------------------------------- */
/*  Prompts                                                                    */
/* -------------------------------------------------------------------------- */

export const prompts = pgTable(
  "prompts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    promptText: text("prompt_text").notNull().default(""),
    category: promptCategoryEnum("category").notNull().default("other"),
    intent: promptIntentEnum("intent").notNull().default("other"),
    targetTool: targetToolEnum("target_tool").notNull().default("other"),
    targetModel: text("target_model"),
    relatedProjectId: uuid("related_project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    status: promptStatusEnum("status").notNull().default("draft"),
    reusable: boolean("reusable").notNull().default(true),
    favorite: boolean("favorite").notNull().default(false),
    qualityScore: integer("quality_score"),
    clarityScore: integer("clarity_score"),
    resultScore: integer("result_score"),
    costEfficiencyScore: integer("cost_efficiency_score"),
    tags: tagsColumn(),
    notes: text("notes"),
    // Logical pointer to the version currently considered "current".
    currentVersionId: uuid("current_version_id"),
    createdAt,
    updatedAt,
  },
  (t) => [
    uniqueIndex("prompts_slug_idx").on(t.slug),
    index("prompts_category_idx").on(t.category),
    index("prompts_status_idx").on(t.status),
    index("prompts_project_idx").on(t.relatedProjectId),
  ],
);

export const promptVersions = pgTable(
  "prompt_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    promptId: uuid("prompt_id")
      .notNull()
      .references(() => prompts.id, { onDelete: "cascade" }),
    versionNumber: integer("version_number").notNull(),
    title: text("title").notNull(),
    promptText: text("prompt_text").notNull().default(""),
    changeSummary: text("change_summary"),
    reasonForChange: text("reason_for_change"),
    resultNotes: text("result_notes"),
    qualityScore: integer("quality_score"),
    createdAt,
  },
  (t) => [index("prompt_versions_prompt_idx").on(t.promptId)],
);

export const promptRuns = pgTable(
  "prompt_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    promptId: uuid("prompt_id")
      .notNull()
      .references(() => prompts.id, { onDelete: "cascade" }),
    promptVersionId: uuid("prompt_version_id").references(
      () => promptVersions.id,
      { onDelete: "set null" },
    ),
    projectId: uuid("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),
    toolUsed: targetToolEnum("tool_used").notNull().default("other"),
    modelUsed: text("model_used"),
    taskDescription: text("task_description"),
    inputContext: text("input_context"),
    outputSummary: text("output_summary"),
    resultStatus: runResultStatusEnum("result_status").notNull().default("good"),
    timeSpentMinutes: integer("time_spent_minutes"),
    estimatedTimeSavedMinutes: integer("estimated_time_saved_minutes"),
    problems: stringArray("problems"),
    lessonsLearned: text("lessons_learned"),
    followUpNeeded: boolean("follow_up_needed").notNull().default(false),
    followUpNote: text("follow_up_note"),
    createdAt,
    updatedAt,
  },
  (t) => [
    index("prompt_runs_prompt_idx").on(t.promptId),
    index("prompt_runs_project_idx").on(t.projectId),
    index("prompt_runs_result_idx").on(t.resultStatus),
  ],
);

/* -------------------------------------------------------------------------- */
/*  Workflows                                                                  */
/* -------------------------------------------------------------------------- */

export const workflows = pgTable(
  "workflows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    workflowType: workflowTypeEnum("workflow_type").notNull().default("other"),
    relatedProjectId: uuid("related_project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    status: workflowStatusEnum("status").notNull().default("draft"),
    outcome: text("outcome"),
    whenToUse: text("when_to_use"),
    whenNotToUse: text("when_not_to_use"),
    toolsUsed: stringArray("tools_used"),
    favorite: boolean("favorite").notNull().default(false),
    tags: tagsColumn(),
    notes: text("notes"),
    createdAt,
    updatedAt,
  },
  (t) => [
    uniqueIndex("workflows_slug_idx").on(t.slug),
    index("workflows_type_idx").on(t.workflowType),
    index("workflows_project_idx").on(t.relatedProjectId),
  ],
);

export const workflowSteps = pgTable(
  "workflow_steps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workflowId: uuid("workflow_id")
      .notNull()
      .references(() => workflows.id, { onDelete: "cascade" }),
    order: integer("order").notNull().default(0),
    title: text("title").notNull(),
    description: text("description"),
    linkedPromptId: uuid("linked_prompt_id").references(() => prompts.id, {
      onDelete: "set null",
    }),
    instruction: text("instruction"),
    expectedOutput: text("expected_output"),
    checklist: stringArray("checklist"),
    createdAt,
    updatedAt,
  },
  (t) => [index("workflow_steps_workflow_idx").on(t.workflowId)],
);

/* -------------------------------------------------------------------------- */
/*  Notes                                                                      */
/* -------------------------------------------------------------------------- */

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    body: text("body"),
    noteType: noteTypeEnum("note_type").notNull().default("quick-note"),
    status: noteStatusEnum("status").notNull().default("inbox"),
    priority: priorityEnum("priority").notNull().default("medium"),
    relatedProjectId: uuid("related_project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    relatedPromptId: uuid("related_prompt_id").references(() => prompts.id, {
      onDelete: "set null",
    }),
    relatedWorkflowId: uuid("related_workflow_id").references(
      () => workflows.id,
      { onDelete: "set null" },
    ),
    dueDate: timestamp("due_date", { withTimezone: true }),
    pinned: boolean("pinned").notNull().default(false),
    tags: tagsColumn(),
    createdAt,
    updatedAt,
  },
  (t) => [
    index("notes_type_idx").on(t.noteType),
    index("notes_status_idx").on(t.status),
    index("notes_project_idx").on(t.relatedProjectId),
  ],
);

/* -------------------------------------------------------------------------- */
/*  Templates                                                                  */
/* -------------------------------------------------------------------------- */

export type TemplateVariable = {
  name: string;
  description?: string;
  example?: string;
};

export const templates = pgTable("templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  templateType: templateTypeEnum("template_type").notNull().default("prompt"),
  description: text("description"),
  content: text("content").notNull().default(""),
  variables: jsonb("variables")
    .$type<TemplateVariable[]>()
    .notNull()
    .default([]),
  usageNotes: text("usage_notes"),
  createdAt,
  updatedAt,
});

/* -------------------------------------------------------------------------- */
/*  Collections                                                                */
/* -------------------------------------------------------------------------- */

export const collections = pgTable("collections", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  color: text("color").notNull().default("#8b5cf6"),
  collectionType: collectionTypeEnum("collection_type")
    .notNull()
    .default("other"),
  createdAt,
  updatedAt,
});

export const collectionItems = pgTable(
  "collection_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    itemType: collectionItemTypeEnum("item_type").notNull(),
    itemId: uuid("item_id").notNull(),
    position: integer("position").notNull().default(0),
    createdAt,
  },
  (t) => [index("collection_items_collection_idx").on(t.collectionId)],
);

/* -------------------------------------------------------------------------- */
/*  Tags                                                                       */
/* -------------------------------------------------------------------------- */

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    color: text("color").notNull().default("#8b5cf6"),
    createdAt,
    updatedAt,
  },
  (t) => [uniqueIndex("tags_name_idx").on(t.name)],
);

/* -------------------------------------------------------------------------- */
/*  Relations (for the relational query API)                                   */
/* -------------------------------------------------------------------------- */

export const projectsRelations = relations(projects, ({ many }) => ({
  prompts: many(prompts),
  workflows: many(workflows),
  notes: many(notes),
  runs: many(promptRuns),
}));

export const promptsRelations = relations(prompts, ({ one, many }) => ({
  project: one(projects, {
    fields: [prompts.relatedProjectId],
    references: [projects.id],
  }),
  versions: many(promptVersions),
  runs: many(promptRuns),
}));

export const promptVersionsRelations = relations(promptVersions, ({ one }) => ({
  prompt: one(prompts, {
    fields: [promptVersions.promptId],
    references: [prompts.id],
  }),
}));

export const promptRunsRelations = relations(promptRuns, ({ one }) => ({
  prompt: one(prompts, {
    fields: [promptRuns.promptId],
    references: [prompts.id],
  }),
  version: one(promptVersions, {
    fields: [promptRuns.promptVersionId],
    references: [promptVersions.id],
  }),
  project: one(projects, {
    fields: [promptRuns.projectId],
    references: [projects.id],
  }),
}));

export const workflowsRelations = relations(workflows, ({ one, many }) => ({
  project: one(projects, {
    fields: [workflows.relatedProjectId],
    references: [projects.id],
  }),
  steps: many(workflowSteps),
}));

export const workflowStepsRelations = relations(workflowSteps, ({ one }) => ({
  workflow: one(workflows, {
    fields: [workflowSteps.workflowId],
    references: [workflows.id],
  }),
  linkedPrompt: one(prompts, {
    fields: [workflowSteps.linkedPromptId],
    references: [prompts.id],
  }),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  project: one(projects, {
    fields: [notes.relatedProjectId],
    references: [projects.id],
  }),
  prompt: one(prompts, {
    fields: [notes.relatedPromptId],
    references: [prompts.id],
  }),
  workflow: one(workflows, {
    fields: [notes.relatedWorkflowId],
    references: [workflows.id],
  }),
}));

export const collectionsRelations = relations(collections, ({ many }) => ({
  items: many(collectionItems),
}));

export const collectionItemsRelations = relations(
  collectionItems,
  ({ one }) => ({
    collection: one(collections, {
      fields: [collectionItems.collectionId],
      references: [collections.id],
    }),
  }),
);

/* -------------------------------------------------------------------------- */
/*  Inferred types                                                             */
/* -------------------------------------------------------------------------- */

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Prompt = typeof prompts.$inferSelect;
export type NewPrompt = typeof prompts.$inferInsert;
export type PromptVersion = typeof promptVersions.$inferSelect;
export type NewPromptVersion = typeof promptVersions.$inferInsert;
export type PromptRun = typeof promptRuns.$inferSelect;
export type NewPromptRun = typeof promptRuns.$inferInsert;
export type Workflow = typeof workflows.$inferSelect;
export type NewWorkflow = typeof workflows.$inferInsert;
export type WorkflowStep = typeof workflowSteps.$inferSelect;
export type NewWorkflowStep = typeof workflowSteps.$inferInsert;
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;
export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;
export type CollectionItem = typeof collectionItems.$inferSelect;
export type NewCollectionItem = typeof collectionItems.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

CREATE TYPE "public"."collection_item_type" AS ENUM('prompt', 'workflow', 'template', 'note');--> statement-breakpoint
CREATE TYPE "public"."collection_type" AS ENUM('prompt-pack', 'workflow-pack', 'project-pack', 'content-pack', 'media-pack', 'learning-pack', 'other');--> statement-breakpoint
CREATE TYPE "public"."note_status" AS ENUM('inbox', 'active', 'done', 'converted', 'archived');--> statement-breakpoint
CREATE TYPE "public"."note_type" AS ENUM('quick-note', 'task', 'idea', 'product-idea', 'content-idea', 'prompt-idea', 'workflow-idea', 'technical-note', 'reminder', 'learning-note', 'other');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('active', 'paused', 'archived');--> statement-breakpoint
CREATE TYPE "public"."project_type" AS ENUM('personal', 'commercial', 'internal-tool', 'devtool', 'content', 'learning', 'experiment', 'other');--> statement-breakpoint
CREATE TYPE "public"."prompt_category" AS ENUM('coding-agent', 'project-bootstrap', 'ui-design', 'frontend', 'backend', 'database', 'api-review', 'testing', 'refactor', 'seo', 'marketing', 'social-post', 'blog-writing', 'product-research', 'image-generation', 'video-generation', 'system-design', 'learning', 'debugging', 'code-review', 'other');--> statement-breakpoint
CREATE TYPE "public"."prompt_intent" AS ENUM('generate-code', 'review-code', 'plan-project', 'design-ui', 'write-content', 'research', 'summarize', 'debug', 'generate-media', 'teach', 'brainstorm', 'other');--> statement-breakpoint
CREATE TYPE "public"."prompt_status" AS ENUM('draft', 'tested', 'reliable', 'needs-improvement', 'archived');--> statement-breakpoint
CREATE TYPE "public"."run_result_status" AS ENUM('excellent', 'good', 'usable-with-edits', 'poor', 'failed');--> statement-breakpoint
CREATE TYPE "public"."target_tool" AS ENUM('Codex', 'Claude Code', 'Cursor', 'ChatGPT', 'Gemini', 'image-model', 'video-model', 'other');--> statement-breakpoint
CREATE TYPE "public"."template_type" AS ENUM('prompt', 'workflow', 'note', 'task', 'project-bootstrap', 'coding-agent', 'media-generation', 'content', 'other');--> statement-breakpoint
CREATE TYPE "public"."workflow_status" AS ENUM('draft', 'active', 'reliable', 'needs-improvement', 'archived');--> statement-breakpoint
CREATE TYPE "public"."workflow_type" AS ENUM('coding', 'design', 'product-planning', 'marketing', 'seo', 'research', 'launch', 'content', 'debugging', 'learning', 'other');--> statement-breakpoint
CREATE TABLE "collection_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection_id" uuid NOT NULL,
	"item_type" "collection_item_type" NOT NULL,
	"item_id" uuid NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"color" text DEFAULT '#8b5cf6' NOT NULL,
	"collection_type" "collection_type" DEFAULT 'other' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"note_type" "note_type" DEFAULT 'quick-note' NOT NULL,
	"status" "note_status" DEFAULT 'inbox' NOT NULL,
	"priority" "priority" DEFAULT 'medium' NOT NULL,
	"related_project_id" uuid,
	"related_prompt_id" uuid,
	"related_workflow_id" uuid,
	"due_date" timestamp with time zone,
	"pinned" boolean DEFAULT false NOT NULL,
	"tags" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"domain" text,
	"type" "project_type" DEFAULT 'personal' NOT NULL,
	"status" "project_status" DEFAULT 'active' NOT NULL,
	"color" text DEFAULT '#8b5cf6' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompt_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prompt_id" uuid NOT NULL,
	"prompt_version_id" uuid,
	"project_id" uuid,
	"title" text NOT NULL,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"tool_used" "target_tool" DEFAULT 'other' NOT NULL,
	"model_used" text,
	"task_description" text,
	"input_context" text,
	"output_summary" text,
	"result_status" "run_result_status" DEFAULT 'good' NOT NULL,
	"time_spent_minutes" integer,
	"estimated_time_saved_minutes" integer,
	"problems" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"lessons_learned" text,
	"follow_up_needed" boolean DEFAULT false NOT NULL,
	"follow_up_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompt_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prompt_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"title" text NOT NULL,
	"prompt_text" text DEFAULT '' NOT NULL,
	"change_summary" text,
	"reason_for_change" text,
	"result_notes" text,
	"quality_score" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"prompt_text" text DEFAULT '' NOT NULL,
	"category" "prompt_category" DEFAULT 'other' NOT NULL,
	"intent" "prompt_intent" DEFAULT 'other' NOT NULL,
	"target_tool" "target_tool" DEFAULT 'other' NOT NULL,
	"target_model" text,
	"related_project_id" uuid,
	"status" "prompt_status" DEFAULT 'draft' NOT NULL,
	"reusable" boolean DEFAULT true NOT NULL,
	"favorite" boolean DEFAULT false NOT NULL,
	"quality_score" integer,
	"clarity_score" integer,
	"result_score" integer,
	"cost_efficiency_score" integer,
	"tags" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"notes" text,
	"current_version_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT '#8b5cf6' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"template_type" "template_type" DEFAULT 'prompt' NOT NULL,
	"description" text,
	"content" text DEFAULT '' NOT NULL,
	"variables" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"usage_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflow_id" uuid NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"linked_prompt_id" uuid,
	"instruction" text,
	"expected_output" text,
	"checklist" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"workflow_type" "workflow_type" DEFAULT 'other' NOT NULL,
	"related_project_id" uuid,
	"status" "workflow_status" DEFAULT 'draft' NOT NULL,
	"outcome" text,
	"when_to_use" text,
	"when_not_to_use" text,
	"tools_used" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"favorite" boolean DEFAULT false NOT NULL,
	"tags" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_related_project_id_projects_id_fk" FOREIGN KEY ("related_project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_related_prompt_id_prompts_id_fk" FOREIGN KEY ("related_prompt_id") REFERENCES "public"."prompts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_related_workflow_id_workflows_id_fk" FOREIGN KEY ("related_workflow_id") REFERENCES "public"."workflows"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_runs" ADD CONSTRAINT "prompt_runs_prompt_id_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_runs" ADD CONSTRAINT "prompt_runs_prompt_version_id_prompt_versions_id_fk" FOREIGN KEY ("prompt_version_id") REFERENCES "public"."prompt_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_runs" ADD CONSTRAINT "prompt_runs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_versions" ADD CONSTRAINT "prompt_versions_prompt_id_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_related_project_id_projects_id_fk" FOREIGN KEY ("related_project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_linked_prompt_id_prompts_id_fk" FOREIGN KEY ("linked_prompt_id") REFERENCES "public"."prompts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_related_project_id_projects_id_fk" FOREIGN KEY ("related_project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "collection_items_collection_idx" ON "collection_items" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "notes_type_idx" ON "notes" USING btree ("note_type");--> statement-breakpoint
CREATE INDEX "notes_status_idx" ON "notes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "notes_project_idx" ON "notes" USING btree ("related_project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "prompt_runs_prompt_idx" ON "prompt_runs" USING btree ("prompt_id");--> statement-breakpoint
CREATE INDEX "prompt_runs_project_idx" ON "prompt_runs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "prompt_runs_result_idx" ON "prompt_runs" USING btree ("result_status");--> statement-breakpoint
CREATE INDEX "prompt_versions_prompt_idx" ON "prompt_versions" USING btree ("prompt_id");--> statement-breakpoint
CREATE UNIQUE INDEX "prompts_slug_idx" ON "prompts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "prompts_category_idx" ON "prompts" USING btree ("category");--> statement-breakpoint
CREATE INDEX "prompts_status_idx" ON "prompts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "prompts_project_idx" ON "prompts" USING btree ("related_project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_name_idx" ON "tags" USING btree ("name");--> statement-breakpoint
CREATE INDEX "workflow_steps_workflow_idx" ON "workflow_steps" USING btree ("workflow_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workflows_slug_idx" ON "workflows" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "workflows_type_idx" ON "workflows" USING btree ("workflow_type");--> statement-breakpoint
CREATE INDEX "workflows_project_idx" ON "workflows" USING btree ("related_project_id");
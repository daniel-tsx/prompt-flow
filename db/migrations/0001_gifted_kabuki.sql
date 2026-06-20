CREATE TYPE "public"."account" AS ENUM('owner', 'demo');--> statement-breakpoint
ALTER TABLE "collection_items" ADD COLUMN "account" "account" DEFAULT 'owner' NOT NULL;--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "account" "account" DEFAULT 'owner' NOT NULL;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "account" "account" DEFAULT 'owner' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "account" "account" DEFAULT 'owner' NOT NULL;--> statement-breakpoint
ALTER TABLE "prompt_runs" ADD COLUMN "account" "account" DEFAULT 'owner' NOT NULL;--> statement-breakpoint
ALTER TABLE "prompt_versions" ADD COLUMN "account" "account" DEFAULT 'owner' NOT NULL;--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "account" "account" DEFAULT 'owner' NOT NULL;--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "account" "account" DEFAULT 'owner' NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "account" "account" DEFAULT 'owner' NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_steps" ADD COLUMN "account" "account" DEFAULT 'owner' NOT NULL;--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "account" "account" DEFAULT 'owner' NOT NULL;
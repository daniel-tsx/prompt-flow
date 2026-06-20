import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@/db/schema";
import { buildSeedData } from "@/lib/seed-data";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error(
      "\n✖ DATABASE_URL is missing. Copy .env.example to .env.local and add your Neon connection string.\n",
    );
    process.exit(1);
  }

  const db = drizzle(neon(url), { schema });
  const data = buildSeedData();

  console.log("→ Clearing existing data…");
  // Delete in reverse dependency order (set-null FKs make order forgiving).
  await db.delete(schema.collectionItems);
  await db.delete(schema.collections);
  await db.delete(schema.templates);
  await db.delete(schema.notes);
  await db.delete(schema.workflowSteps);
  await db.delete(schema.workflows);
  await db.delete(schema.promptRuns);
  await db.delete(schema.promptVersions);
  await db.delete(schema.prompts);
  await db.delete(schema.projects);
  await db.delete(schema.tags);

  console.log("→ Inserting seed data…");
  await db.insert(schema.projects).values(data.projects);
  await db.insert(schema.prompts).values(data.prompts);
  await db.insert(schema.promptVersions).values(data.promptVersions);
  await db.insert(schema.promptRuns).values(data.promptRuns);
  await db.insert(schema.workflows).values(data.workflows);
  await db.insert(schema.workflowSteps).values(data.workflowSteps);
  await db.insert(schema.notes).values(data.notes);
  await db.insert(schema.templates).values(data.templates);
  await db.insert(schema.collections).values(data.collections);
  await db.insert(schema.collectionItems).values(data.collectionItems);

  await db.insert(schema.tags).values([
    { name: "bootstrap", color: "#8b5cf6" },
    { name: "nextjs", color: "#06b6d4" },
    { name: "security", color: "#f43f5e" },
    { name: "seo", color: "#10b981" },
    { name: "marketing", color: "#f97316" },
    { name: "content", color: "#a855f7" },
    { name: "video", color: "#ec4899" },
    { name: "image", color: "#8b5cf6" },
    { name: "backend", color: "#14b8a6" },
    { name: "evaluation", color: "#6366f1" },
    { name: "launch", color: "#f59e0b" },
    { name: "ui", color: "#3b82f6" },
  ]);

  console.log(
    `✔ Seeded ${data.projects.length} projects, ${data.prompts.length} prompts, ` +
      `${data.promptVersions.length} versions, ${data.promptRuns.length} runs, ` +
      `${data.workflows.length} workflows, ${data.workflowSteps.length} steps, ` +
      `${data.notes.length} notes, ${data.templates.length} templates, ` +
      `${data.collections.length} collections.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

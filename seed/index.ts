import { config } from "dotenv";
import { eq } from "drizzle-orm";
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

  // All seeded rows belong to the read-only "demo" account.
  const demo = <T extends Record<string, unknown>>(rows: T[]) =>
    rows.map((r) => ({ ...r, account: "demo" as const }));

  console.log("→ Clearing existing demo data (owner data is left untouched)…");
  // Delete ONLY the demo account, in reverse dependency order.
  await db.delete(schema.collectionItems).where(eq(schema.collectionItems.account, "demo"));
  await db.delete(schema.collections).where(eq(schema.collections.account, "demo"));
  await db.delete(schema.templates).where(eq(schema.templates.account, "demo"));
  await db.delete(schema.notes).where(eq(schema.notes.account, "demo"));
  await db.delete(schema.workflowSteps).where(eq(schema.workflowSteps.account, "demo"));
  await db.delete(schema.workflows).where(eq(schema.workflows.account, "demo"));
  await db.delete(schema.promptRuns).where(eq(schema.promptRuns.account, "demo"));
  await db.delete(schema.promptVersions).where(eq(schema.promptVersions.account, "demo"));
  await db.delete(schema.prompts).where(eq(schema.prompts.account, "demo"));
  await db.delete(schema.projects).where(eq(schema.projects.account, "demo"));
  await db.delete(schema.tags).where(eq(schema.tags.account, "demo"));

  console.log("→ Inserting seed data…");
  await db.insert(schema.projects).values(demo(data.projects));
  await db.insert(schema.prompts).values(demo(data.prompts));
  await db.insert(schema.promptVersions).values(demo(data.promptVersions));
  await db.insert(schema.promptRuns).values(demo(data.promptRuns));
  await db.insert(schema.workflows).values(demo(data.workflows));
  await db.insert(schema.workflowSteps).values(demo(data.workflowSteps));
  await db.insert(schema.notes).values(demo(data.notes));
  await db.insert(schema.templates).values(demo(data.templates));
  await db.insert(schema.collections).values(demo(data.collections));
  await db.insert(schema.collectionItems).values(demo(data.collectionItems));

  await db.insert(schema.tags).values(demo([
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
  ]));

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

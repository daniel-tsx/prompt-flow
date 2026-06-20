import { eq } from "drizzle-orm";
import { db } from "@/db";
import { notes, prompts, tags, workflows } from "@/db/schema";
import { getAccount } from "@/lib/account";

export async function listTags() {
  const account = await getAccount();
  return db.select().from(tags).where(eq(tags.account, account)).orderBy(tags.name);
}

/** Distinct tags actually in use across prompts/workflows/notes, with counts. */
export async function tagUsage(): Promise<{ tag: string; count: number }[]> {
  const account = await getAccount();
  const [promptTags, workflowTags, noteTags] = await Promise.all([
    db.select({ tags: prompts.tags }).from(prompts).where(eq(prompts.account, account)),
    db.select({ tags: workflows.tags }).from(workflows).where(eq(workflows.account, account)),
    db.select({ tags: notes.tags }).from(notes).where(eq(notes.account, account)),
  ]);

  const counts = new Map<string, number>();
  for (const row of [...promptTags, ...workflowTags, ...noteTags]) {
    for (const t of row.tags ?? []) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

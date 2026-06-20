import { db } from "@/db";
import { notes, prompts, tags, workflows } from "@/db/schema";

export async function listTags() {
  return db.select().from(tags).orderBy(tags.name);
}

/** Distinct tags actually in use across prompts/workflows/notes, with counts. */
export async function tagUsage(): Promise<{ tag: string; count: number }[]> {
  const [promptTags, workflowTags, noteTags] = await Promise.all([
    db.select({ tags: prompts.tags }).from(prompts),
    db.select({ tags: workflows.tags }).from(workflows),
    db.select({ tags: notes.tags }).from(notes),
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

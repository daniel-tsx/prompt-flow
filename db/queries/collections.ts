import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  collectionItems,
  collections,
  notes,
  prompts,
  templates,
  workflows,
  type Collection,
} from "@/db/schema";
import { getAccount } from "@/lib/account";

export type CollectionListItem = Collection & { itemCount: number };

export async function listCollections(): Promise<CollectionListItem[]> {
  const account = await getAccount();
  const rows = await db
    .select()
    .from(collections)
    .where(eq(collections.account, account))
    .orderBy(collections.name);
  const allItems = await db
    .select({ collectionId: collectionItems.collectionId })
    .from(collectionItems)
    .where(eq(collectionItems.account, account));

  const countMap = new Map<string, number>();
  for (const it of allItems) {
    countMap.set(it.collectionId, (countMap.get(it.collectionId) ?? 0) + 1);
  }

  return rows.map((c) => ({ ...c, itemCount: countMap.get(c.id) ?? 0 }));
}

export type ResolvedCollectionItem = {
  rowId: string;
  itemType: "prompt" | "workflow" | "template" | "note";
  itemId: string;
  position: number;
  title: string;
  subtitle: string | null;
  slug: string | null;
};

export async function getCollectionById(id: string) {
  const account = await getAccount();
  const collection = await db.query.collections.findFirst({
    where: and(eq(collections.id, id), eq(collections.account, account)),
  });
  if (!collection) return null;

  const items = await db
    .select()
    .from(collectionItems)
    .where(eq(collectionItems.collectionId, id))
    .orderBy(collectionItems.position, desc(collectionItems.createdAt));

  const byType = {
    prompt: items.filter((i) => i.itemType === "prompt").map((i) => i.itemId),
    workflow: items.filter((i) => i.itemType === "workflow").map((i) => i.itemId),
    template: items.filter((i) => i.itemType === "template").map((i) => i.itemId),
    note: items.filter((i) => i.itemType === "note").map((i) => i.itemId),
  };

  const [promptRows, workflowRows, templateRows, noteRows] = await Promise.all([
    byType.prompt.length
      ? db.select().from(prompts).where(inArray(prompts.id, byType.prompt))
      : Promise.resolve([]),
    byType.workflow.length
      ? db.select().from(workflows).where(inArray(workflows.id, byType.workflow))
      : Promise.resolve([]),
    byType.template.length
      ? db.select().from(templates).where(inArray(templates.id, byType.template))
      : Promise.resolve([]),
    byType.note.length
      ? db.select().from(notes).where(inArray(notes.id, byType.note))
      : Promise.resolve([]),
  ]);

  const pMap = new Map(promptRows.map((p) => [p.id, p]));
  const wMap = new Map(workflowRows.map((w) => [w.id, w]));
  const tMap = new Map(templateRows.map((t) => [t.id, t]));
  const nMap = new Map(noteRows.map((n) => [n.id, n]));

  const resolved: ResolvedCollectionItem[] = items.map((it) => {
    const base = { rowId: it.id, itemType: it.itemType, itemId: it.itemId, position: it.position };
    if (it.itemType === "prompt") {
      const p = pMap.get(it.itemId);
      return { ...base, title: p?.title ?? "(deleted prompt)", subtitle: p?.category ?? null, slug: p?.slug ?? null };
    }
    if (it.itemType === "workflow") {
      const w = wMap.get(it.itemId);
      return { ...base, title: w?.title ?? "(deleted workflow)", subtitle: w?.workflowType ?? null, slug: w?.slug ?? null };
    }
    if (it.itemType === "template") {
      const t = tMap.get(it.itemId);
      return { ...base, title: t?.name ?? "(deleted template)", subtitle: t?.templateType ?? null, slug: null };
    }
    const n = nMap.get(it.itemId);
    return { ...base, title: n?.title ?? "(deleted note)", subtitle: n?.noteType ?? null, slug: null };
  });

  return { ...collection, items: resolved };
}

export type CollectionDetail = NonNullable<
  Awaited<ReturnType<typeof getCollectionById>>
>;

export async function listCollectionsForPicker() {
  const account = await getAccount();
  return db
    .select({ id: collections.id, name: collections.name, color: collections.color })
    .from(collections)
    .where(eq(collections.account, account))
    .orderBy(collections.name);
}

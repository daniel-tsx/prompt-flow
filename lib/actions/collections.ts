"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { collectionItems, collections } from "@/db/schema";
import { runAction } from "@/lib/action-result";
import {
  collectionItemSchema,
  collectionSchema,
  type CollectionInput,
  type CollectionItemInput,
} from "@/lib/validations";

function revalidate() {
  revalidatePath("/", "layout");
}

export async function createCollection(input: CollectionInput) {
  return runAction(async () => {
    const data = collectionSchema.parse(input);
    const [row] = await db.insert(collections).values(data).returning({ id: collections.id });
    revalidate();
    return row;
  });
}

export async function updateCollection(id: string, input: CollectionInput) {
  return runAction(async () => {
    const data = collectionSchema.parse(input);
    await db.update(collections).set(data).where(eq(collections.id, id));
    revalidate();
  });
}

export async function deleteCollection(id: string) {
  return runAction(async () => {
    await db.delete(collections).where(eq(collections.id, id));
    revalidate();
  });
}

export async function addCollectionItem(input: CollectionItemInput) {
  return runAction(async () => {
    const data = collectionItemSchema.parse(input);
    const existing = await db
      .select({ id: collectionItems.id })
      .from(collectionItems)
      .where(
        and(
          eq(collectionItems.collectionId, data.collectionId),
          eq(collectionItems.itemType, data.itemType),
          eq(collectionItems.itemId, data.itemId),
        ),
      );
    if (existing.length) return existing[0];
    const [row] = await db.insert(collectionItems).values(data).returning({ id: collectionItems.id });
    revalidate();
    return row;
  });
}

export async function removeCollectionItem(rowId: string) {
  return runAction(async () => {
    await db.delete(collectionItems).where(eq(collectionItems.id, rowId));
    revalidate();
  });
}

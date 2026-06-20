"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { promptRuns } from "@/db/schema";
import { runAction } from "@/lib/action-result";
import { promptRunSchema, type PromptRunInput } from "@/lib/validations";

export async function createRun(input: PromptRunInput) {
  return runAction(async () => {
    const data = promptRunSchema.parse(input);
    const [row] = await db.insert(promptRuns).values(data).returning({ id: promptRuns.id });
    revalidatePath("/", "layout");
    return row;
  });
}

export async function updateRun(id: string, input: PromptRunInput) {
  return runAction(async () => {
    const data = promptRunSchema.parse(input);
    await db.update(promptRuns).set(data).where(eq(promptRuns.id, id));
    revalidatePath("/", "layout");
  });
}

export async function deleteRun(id: string) {
  return runAction(async () => {
    await db.delete(promptRuns).where(eq(promptRuns.id, id));
    revalidatePath("/", "layout");
  });
}

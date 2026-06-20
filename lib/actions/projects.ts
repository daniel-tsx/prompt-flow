"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { ownerAction } from "@/lib/action-result";
import { uniqueSlug } from "@/lib/utils";
import { projectSchema, type ProjectInput } from "@/lib/validations";

export async function createProject(input: ProjectInput) {
  return ownerAction(async () => {
    const data = projectSchema.parse(input);
    const [row] = await db
      .insert(projects)
      .values({ ...data, slug: uniqueSlug(data.name) })
      .returning({ id: projects.id, slug: projects.slug });
    revalidatePath("/", "layout");
    return row;
  });
}

export async function updateProject(id: string, input: ProjectInput) {
  return ownerAction(async () => {
    const data = projectSchema.parse(input);
    const [row] = await db
      .update(projects)
      .set(data)
      .where(eq(projects.id, id))
      .returning({ id: projects.id, slug: projects.slug });
    revalidatePath("/", "layout");
    return row;
  });
}

export async function deleteProject(id: string) {
  return ownerAction(async () => {
    await db.delete(projects).where(eq(projects.id, id));
    revalidatePath("/", "layout");
  });
}

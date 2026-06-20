import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { templates, type Template } from "@/db/schema";
import { getAccount } from "@/lib/account";

export async function listTemplates(filters: { search?: string; templateType?: string } = {}) {
  const account = await getAccount();
  const conditions = [];
  conditions.push(eq(templates.account, account));
  if (filters.templateType)
    conditions.push(eq(templates.templateType, filters.templateType as Template["templateType"]));
  if (filters.search) {
    const q = `%${filters.search}%`;
    conditions.push(
      or(ilike(templates.name, q), ilike(templates.description, q), ilike(templates.content, q)),
    );
  }
  return db
    .select()
    .from(templates)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(templates.updatedAt));
}

export async function getTemplateById(id: string) {
  const account = await getAccount();
  return db.query.templates.findFirst({
    where: and(eq(templates.id, id), eq(templates.account, account)),
  });
}

import { and, asc, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { notes, projects, type Note } from "@/db/schema";

export type NoteFilters = {
  search?: string;
  noteType?: string;
  status?: string;
  priority?: string;
  projectId?: string;
  pinned?: boolean;
  tag?: string;
  view?: "all" | "tasks" | "ideas" | "prompt-ideas" | "workflow-ideas" | "technical" | "pinned" | "done" | "archived";
};

export type NoteListItem = Note & {
  projectName: string | null;
  projectColor: string | null;
};

export async function listNotes(filters: NoteFilters = {}): Promise<NoteListItem[]> {
  const conditions = [];

  switch (filters.view) {
    case "tasks":
      conditions.push(eq(notes.noteType, "task"));
      break;
    case "ideas":
      conditions.push(
        sql`${notes.noteType} IN ('idea','product-idea','content-idea','prompt-idea','workflow-idea')`,
      );
      break;
    case "prompt-ideas":
      conditions.push(eq(notes.noteType, "prompt-idea"));
      break;
    case "workflow-ideas":
      conditions.push(eq(notes.noteType, "workflow-idea"));
      break;
    case "technical":
      conditions.push(eq(notes.noteType, "technical-note"));
      break;
    case "pinned":
      conditions.push(eq(notes.pinned, true));
      break;
    case "done":
      conditions.push(eq(notes.status, "done"));
      break;
    case "archived":
      conditions.push(eq(notes.status, "archived"));
      break;
    default:
      // "all" hides archived by default
      conditions.push(sql`${notes.status} <> 'archived'`);
  }

  if (filters.noteType) conditions.push(eq(notes.noteType, filters.noteType as Note["noteType"]));
  if (filters.status) conditions.push(eq(notes.status, filters.status as Note["status"]));
  if (filters.priority) conditions.push(eq(notes.priority, filters.priority as Note["priority"]));
  if (filters.projectId) conditions.push(eq(notes.relatedProjectId, filters.projectId));
  if (filters.pinned) conditions.push(eq(notes.pinned, true));
  if (filters.tag) conditions.push(sql`${filters.tag} = ANY(${notes.tags})`);
  if (filters.search) {
    const q = `%${filters.search}%`;
    conditions.push(or(ilike(notes.title, q), ilike(notes.body, q)));
  }

  const rows = await db
    .select({
      note: notes,
      projectName: projects.name,
      projectColor: projects.color,
    })
    .from(notes)
    .leftJoin(projects, eq(notes.relatedProjectId, projects.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(notes.pinned), desc(notes.updatedAt));

  return rows.map((r) => ({
    ...r.note,
    projectName: r.projectName,
    projectColor: r.projectColor,
  }));
}

export async function getNoteById(id: string) {
  return db.query.notes.findFirst({
    where: eq(notes.id, id),
    with: { project: true, prompt: true, workflow: true },
  });
}

/** Tasks grouped for the Tasks page. */
export async function listTasks(filters: { priority?: string; projectId?: string } = {}) {
  const conditions = [eq(notes.noteType, "task")];
  if (filters.priority) conditions.push(eq(notes.priority, filters.priority as Note["priority"]));
  if (filters.projectId) conditions.push(eq(notes.relatedProjectId, filters.projectId));

  const rows = await db
    .select({
      note: notes,
      projectName: projects.name,
      projectColor: projects.color,
    })
    .from(notes)
    .leftJoin(projects, eq(notes.relatedProjectId, projects.id))
    .where(and(...conditions))
    .orderBy(asc(notes.dueDate), desc(notes.priority));

  return rows.map((r) => ({
    ...r.note,
    projectName: r.projectName,
    projectColor: r.projectColor,
  }));
}

export async function recentNotes(limit = 6) {
  return db
    .select()
    .from(notes)
    .where(sql`${notes.status} <> 'archived'`)
    .orderBy(desc(notes.createdAt))
    .limit(limit);
}

/** Aggregate metrics used by the dashboard + inbox-pressure calc. */
export async function inboxMetrics() {
  const [inbox] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(notes)
    .where(eq(notes.status, "inbox"));

  const [overdue] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(notes)
    .where(
      and(
        eq(notes.noteType, "task"),
        sql`${notes.status} NOT IN ('done','archived')`,
        sql`${notes.dueDate} < now()`,
      ),
    );

  const [high] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(notes)
    .where(
      and(eq(notes.priority, "high"), sql`${notes.status} NOT IN ('done','archived')`),
    );

  const [unconverted] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(notes)
    .where(
      and(
        sql`${notes.noteType} IN ('prompt-idea','workflow-idea')`,
        sql`${notes.status} NOT IN ('converted','done','archived')`,
      ),
    );

  return {
    inboxCount: inbox?.c ?? 0,
    overdueCount: overdue?.c ?? 0,
    highPriorityCount: high?.c ?? 0,
    unconvertedIdeaCount: unconverted?.c ?? 0,
  };
}

/** Tasks due today or earlier and still open. */
export async function tasksDueSoon(limit = 8) {
  return db
    .select()
    .from(notes)
    .where(
      and(
        eq(notes.noteType, "task"),
        sql`${notes.status} NOT IN ('done','archived')`,
        sql`${notes.dueDate} IS NOT NULL`,
      ),
    )
    .orderBy(asc(notes.dueDate))
    .limit(limit);
}

export async function pinnedNotes() {
  return db
    .select()
    .from(notes)
    .where(and(eq(notes.pinned, true), sql`${notes.status} <> 'archived'`))
    .orderBy(desc(notes.updatedAt));
}

export { isNull };

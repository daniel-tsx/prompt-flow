import { and, asc, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { notes, projects, type Note } from "@/db/schema";
import { getAccount } from "@/lib/account";

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
  const account = await getAccount();
  const conditions = [];
  conditions.push(eq(notes.account, account));

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

/** Per-view note counts for the inbox tabs (mirrors listNotes view filters). */
export async function inboxViewCounts(): Promise<Record<NoteFilters["view"] & string, number>> {
  const account = await getAccount();
  const rows = await db
    .select({ noteType: notes.noteType, status: notes.status, pinned: notes.pinned })
    .from(notes)
    .where(eq(notes.account, account));

  const ideaTypes = new Set(["idea", "product-idea", "content-idea", "prompt-idea", "workflow-idea"]);
  const c = {
    all: 0,
    tasks: 0,
    ideas: 0,
    "prompt-ideas": 0,
    "workflow-ideas": 0,
    technical: 0,
    pinned: 0,
    done: 0,
    archived: 0,
  };

  for (const r of rows) {
    if (r.status !== "archived") c.all += 1;
    if (r.noteType === "task") c.tasks += 1;
    if (ideaTypes.has(r.noteType)) c.ideas += 1;
    if (r.noteType === "prompt-idea") c["prompt-ideas"] += 1;
    if (r.noteType === "workflow-idea") c["workflow-ideas"] += 1;
    if (r.noteType === "technical-note") c.technical += 1;
    if (r.pinned) c.pinned += 1;
    if (r.status === "done") c.done += 1;
    if (r.status === "archived") c.archived += 1;
  }

  return c;
}

export async function getNoteById(id: string) {
  const account = await getAccount();
  return db.query.notes.findFirst({
    where: and(eq(notes.id, id), eq(notes.account, account)),
    with: { project: true, prompt: true, workflow: true },
  });
}

/** Tasks grouped for the Tasks page. */
export async function listTasks(filters: { priority?: string; projectId?: string } = {}) {
  const account = await getAccount();
  const conditions = [eq(notes.account, account), eq(notes.noteType, "task")];
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
  const account = await getAccount();
  return db
    .select()
    .from(notes)
    .where(and(eq(notes.account, account), sql`${notes.status} <> 'archived'`))
    .orderBy(desc(notes.createdAt))
    .limit(limit);
}

/** Aggregate metrics used by the dashboard + inbox-pressure calc. */
export async function inboxMetrics() {
  const account = await getAccount();
  const scope = eq(notes.account, account);

  const [inbox] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(notes)
    .where(and(scope, eq(notes.status, "inbox")));

  const [overdue] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(notes)
    .where(
      and(
        scope,
        eq(notes.noteType, "task"),
        sql`${notes.status} NOT IN ('done','archived')`,
        sql`${notes.dueDate} < now()`,
      ),
    );

  const [high] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(notes)
    .where(
      and(scope, eq(notes.priority, "high"), sql`${notes.status} NOT IN ('done','archived')`),
    );

  const [unconverted] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(notes)
    .where(
      and(
        scope,
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
  const account = await getAccount();
  return db
    .select()
    .from(notes)
    .where(
      and(
        eq(notes.account, account),
        eq(notes.noteType, "task"),
        sql`${notes.status} NOT IN ('done','archived')`,
        sql`${notes.dueDate} IS NOT NULL`,
      ),
    )
    .orderBy(asc(notes.dueDate))
    .limit(limit);
}

export async function pinnedNotes() {
  const account = await getAccount();
  return db
    .select()
    .from(notes)
    .where(and(eq(notes.account, account), eq(notes.pinned, true), sql`${notes.status} <> 'archived'`))
    .orderBy(desc(notes.updatedAt));
}

export { isNull };

import { isPast, isToday } from "date-fns";
import { CalendarClock, ListChecks } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NoteCard } from "@/components/notes/note-card";
import { CaptureButton } from "@/components/notes/capture-button";
import { listTasks } from "@/db/queries/notes";
import { listProjectsForPicker } from "@/db/queries/projects";
import type { NoteListItem } from "@/db/queries/notes";

export const metadata = { title: "Tasks" };

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function TasksPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const [tasks, projects] = await Promise.all([
    listTasks({ priority: sp.priority, projectId: sp.project }),
    listProjectsForPicker(),
  ]);

  const open = tasks.filter((t) => t.status !== "done" && t.status !== "archived");
  const done = tasks.filter((t) => t.status === "done");

  const overdue = open.filter((t) => t.dueDate && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate)));
  const today = open.filter((t) => t.dueDate && isToday(new Date(t.dueDate)));
  const upcoming = open.filter((t) => t.dueDate && !isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate)));
  const noDue = open.filter((t) => !t.dueDate);

  const sections: { title: string; items: NoteListItem[]; accent: string }[] = [
    { title: "Overdue", items: overdue, accent: "text-rose-300" },
    { title: "Today", items: today, accent: "text-amber-300" },
    { title: "Upcoming", items: upcoming, accent: "text-blue-300" },
    { title: "No due date", items: noDue, accent: "text-muted-foreground" },
    { title: "Done", items: done, accent: "text-emerald-300" },
  ];

  return (
    <PageContainer>
      <PageHeader
        icon={ListChecks}
        title="Tasks"
        description={`${open.length} open · ${done.length} done`}
        actions={<CaptureButton type="task" label="Add task" />}
      />

      {tasks.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No tasks yet" description="Add a task with ⌘⇧T.">
          <CaptureButton type="task" label="Add task" />
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-6">
          {sections
            .filter((s) => s.items.length > 0)
            .map((section) => (
              <section key={section.title}>
                <h2 className={`mb-2.5 flex items-center gap-2 text-sm font-semibold ${section.accent}`}>
                  {section.title}
                  <span className="rounded-full bg-muted px-1.5 text-xs text-muted-foreground">
                    {section.items.length}
                  </span>
                </h2>
                <div className="grid gap-2.5 lg:grid-cols-2">
                  {section.items.map((t) => (
                    <NoteCard key={t.id} note={t} projects={projects} />
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </PageContainer>
  );
}

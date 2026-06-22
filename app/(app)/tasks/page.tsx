import { isPast, isToday } from "date-fns";
import {
  AlertTriangle,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  ListChecks,
  type LucideIcon,
} from "lucide-react";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NoteCard } from "@/components/notes/note-card";
import { CaptureButton } from "@/components/notes/capture-button";
import { listTasks } from "@/db/queries/notes";
import { listProjectsForPicker } from "@/db/queries/projects";
import type { NoteListItem } from "@/db/queries/notes";
import { accentBadge, accentText, type Accent } from "@/lib/constants";
import { cn } from "@/lib/utils";

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

  const sections: {
    title: string;
    items: NoteListItem[];
    accent: Accent;
    icon: LucideIcon;
  }[] = [
    { title: "Overdue", items: overdue, accent: "rose", icon: AlertTriangle },
    { title: "Today", items: today, accent: "amber", icon: CalendarClock },
    { title: "Upcoming", items: upcoming, accent: "blue", icon: CalendarDays },
    { title: "No due date", items: noDue, accent: "slate", icon: CircleDashed },
    { title: "Done", items: done, accent: "emerald", icon: CheckCircle2 },
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
                <h2 className={cn("mb-2.5 flex items-center gap-2 text-sm font-semibold", accentText[section.accent])}>
                  <section.icon className="size-4" />
                  {section.title}
                  <span className={cn("rounded-full border px-1.5 text-xs tabular-nums", accentBadge[section.accent])}>
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

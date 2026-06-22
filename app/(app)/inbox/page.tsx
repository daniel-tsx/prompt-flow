import { Inbox } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NoteCard } from "@/components/notes/note-card";
import { InboxViews } from "@/components/notes/inbox-views";
import { CaptureButton } from "@/components/notes/capture-button";
import { inboxViewCounts, listNotes, type NoteFilters } from "@/db/queries/notes";
import { listProjectsForPicker } from "@/db/queries/projects";

export const metadata = { title: "Inbox" };

type SearchParams = Promise<Record<string, string | undefined>>;

const VALID_VIEWS = [
  "all",
  "tasks",
  "ideas",
  "prompt-ideas",
  "workflow-ideas",
  "technical",
  "pinned",
  "done",
  "archived",
] as const;

export default async function InboxPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const view = (VALID_VIEWS.includes(sp.view as never) ? sp.view : "all") as NoteFilters["view"];

  const [notes, projects, viewCounts] = await Promise.all([
    listNotes({ view, search: sp.search }),
    listProjectsForPicker(),
    inboxViewCounts(),
  ]);

  return (
    <PageContainer>
      <PageHeader
        icon={Inbox}
        title="Inbox"
        description="Capture ideas, tasks, and notes before they disappear."
        actions={<CaptureButton />}
      />

      <InboxViews counts={viewCounts} />

      {notes.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Nothing here"
          description="Capture a thought with ⌘⇧N, or use the Capture button."
        >
          <CaptureButton label="Capture something" />
        </EmptyState>
      ) : (
        <div className="grid gap-2.5 lg:grid-cols-2">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} projects={projects} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

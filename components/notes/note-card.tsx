"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArrowRightLeft,
  Check,
  FileStack,
  MoreHorizontal,
  Pencil,
  Pin,
  Sparkles,
  Trash2,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { OptionBadge } from "@/components/shared/option-badge";
import { NoteEditDialog } from "@/components/notes/note-edit-dialog";
import {
  convertNoteToPrompt,
  convertNoteToTemplate,
  convertNoteToWorkflow,
  deleteNote,
  setNoteStatus,
  toggleNotePin,
} from "@/lib/actions/notes";
import { noteStatusMap, noteTypeMap, priorityMap } from "@/lib/constants";
import { cn, dueLabel, plainExcerpt } from "@/lib/utils";
import type { NoteListItem } from "@/db/queries/notes";
import type { PickerProject } from "@/types";

const DUE_TONE: Record<string, string> = {
  overdue: "border-rose-500/25 bg-rose-500/10 text-rose-300",
  today: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  soon: "border-blue-500/25 bg-blue-500/10 text-blue-300",
  later: "border-slate-500/25 bg-slate-500/10 text-slate-300",
  none: "",
};

export function NoteCard({
  note,
  projects,
}: {
  note: NoteListItem;
  projects: PickerProject[];
}) {
  const router = useRouter();
  const [pinned, setPinned] = useState(note.pinned);
  const [, startTransition] = useTransition();
  const isDone = note.status === "done";
  const due = dueLabel(note.dueDate);

  function convert(
    fn: (id: string) => Promise<{ ok: boolean; data?: { slug?: string }; error?: string }>,
    base: string,
  ) {
    startTransition(async () => {
      const res = await fn(note.id);
      if (res.ok) {
        toast.success("Converted");
        if (res.data?.slug) router.push(`${base}/${res.data.slug}`);
      } else {
        toast.error(res.error ?? "Failed");
      }
    });
  }

  return (
    <Card className={cn("gap-0 p-3.5 transition-opacity", isDone && "opacity-60")}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          aria-label={isDone ? "Mark active" : "Mark done"}
          onClick={() =>
            startTransition(async () => {
              await setNoteStatus(note.id, isDone ? "active" : "done");
            })
          }
          className={cn(
            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
            isDone
              ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
              : "border-border hover:border-primary/50",
          )}
        >
          {isDone && <Check className="size-3" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className={cn("font-medium leading-snug", isDone && "line-through")}>
              {note.title}
            </h3>
            <div className="flex shrink-0 items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={pinned ? "Unpin" : "Pin"}
                onClick={() => {
                  const next = !pinned;
                  setPinned(next);
                  startTransition(async () => {
                    await toggleNotePin(note.id, next);
                  });
                }}
              >
                <Pin className={cn("size-3.5", pinned ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
              </Button>
              <NoteMenu
                note={note}
                projects={projects}
                onConvertPrompt={() => convert(convertNoteToPrompt, "/prompts")}
                onConvertWorkflow={() => convert(convertNoteToWorkflow, "/workflows")}
                onConvertTemplate={() =>
                  startTransition(async () => {
                    const res = await convertNoteToTemplate(note.id);
                    toast[res.ok ? "success" : "error"](res.ok ? "Saved as template" : res.error);
                    if (res.ok) router.push("/templates");
                  })
                }
              />
            </div>
          </div>

          {note.body && (
            <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
              {plainExcerpt(note.body, 220)}
            </p>
          )}

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <OptionBadge option={noteTypeMap[note.noteType]} />
            {note.noteType === "task" && note.priority !== "medium" && (
              <OptionBadge option={priorityMap[note.priority]} withIcon={false} />
            )}
            <OptionBadge option={noteStatusMap[note.status]} withIcon={false} />
            {note.dueDate && (
              <Badge variant="outline" className={cn("font-normal", DUE_TONE[due.tone])}>
                {due.label}
              </Badge>
            )}
            {note.projectName && (
              <Badge variant="outline" className="gap-1.5 font-normal">
                <span className="size-2 rounded-full" style={{ backgroundColor: note.projectColor ?? "#8b5cf6" }} />
                {note.projectName}
              </Badge>
            )}
            {note.tags.map((t) => (
              <Badge key={t} variant="secondary" className="font-normal">#{t}</Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function NoteMenu({
  note,
  projects,
  onConvertPrompt,
  onConvertWorkflow,
  onConvertTemplate,
}: {
  note: NoteListItem;
  projects: PickerProject[];
  onConvertPrompt: () => void;
  onConvertWorkflow: () => void;
  onConvertTemplate: () => void;
}) {
  const [, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Note actions" />}>
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuGroup>
            <NoteEditDialog
              note={note}
              projects={projects}
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Pencil /> Edit
                </DropdownMenuItem>
              }
            />
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Convert to</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={onConvertPrompt}>
              <Sparkles /> Prompt
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onConvertWorkflow}>
              <Workflow /> Workflow
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onConvertTemplate}>
              <FileStack /> Template
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() =>
                startTransition(async () => {
                  const res = await setNoteStatus(note.id, note.status === "archived" ? "inbox" : "archived");
                  toast[res.ok ? "success" : "error"](
                    res.ok ? (note.status === "archived" ? "Restored" : "Archived") : res.error,
                  );
                })
              }
            >
              {note.status === "archived" ? <ArrowRightLeft /> : <Archive />}
              {note.status === "archived" ? "Restore" : "Archive"}
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this note?</AlertDialogTitle>
            <AlertDialogDescription>This permanently deletes the note.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                startTransition(async () => {
                  const res = await deleteNote(note.id);
                  toast[res.ok ? "success" : "error"](res.ok ? "Note deleted" : res.error);
                  setConfirmOpen(false);
                });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

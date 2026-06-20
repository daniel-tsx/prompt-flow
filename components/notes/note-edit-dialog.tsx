"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { OptionSelect } from "@/components/forms/option-select";
import { TagsInput } from "@/components/forms/tags-input";
import { NOTE_STATUSES, NOTE_TYPES, PRIORITIES } from "@/lib/constants";
import { updateNote } from "@/lib/actions/notes";
import type { Note } from "@/db/schema";
import type { PickerProject } from "@/types";

type NoteForm = {
  title: string;
  body: string;
  noteType: string;
  status: string;
  priority: string;
  relatedProjectId: string;
  dueDate: string;
  pinned: boolean;
  tags: string[];
};

export function NoteEditDialog({
  note,
  projects,
  trigger,
}: {
  note: Note;
  projects: PickerProject[];
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, control, formState } = useForm<NoteForm>({
    defaultValues: {
      title: note.title,
      body: note.body ?? "",
      noteType: note.noteType,
      status: note.status,
      priority: note.priority,
      relatedProjectId: note.relatedProjectId ?? "",
      dueDate: note.dueDate ? new Date(note.dueDate).toISOString().slice(0, 10) : "",
      pinned: note.pinned,
      tags: note.tags,
    },
  });

  async function onSubmit(v: NoteForm) {
    const res = await updateNote(note.id, {
      title: v.title,
      body: v.body || null,
      noteType: v.noteType as never,
      status: v.status as never,
      priority: v.priority as never,
      relatedProjectId: v.relatedProjectId || null,
      dueDate: v.dueDate ? new Date(v.dueDate) : null,
      pinned: v.pinned,
      tags: v.tags,
    });
    if (res.ok) {
      toast.success("Note updated");
      setOpen(false);
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit note</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <Input {...register("title", { required: true })} placeholder="Title" />
            </Field>
            <Field>
              <Textarea {...register("body")} placeholder="Details (markdown)" className="min-h-24 font-mono text-sm" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel className="text-xs text-muted-foreground">Type</FieldLabel>
                <Controller control={control} name="noteType" render={({ field }) => (
                  <OptionSelect value={field.value} onChange={field.onChange} options={NOTE_TYPES} />
                )} />
              </Field>
              <Field>
                <FieldLabel className="text-xs text-muted-foreground">Status</FieldLabel>
                <Controller control={control} name="status" render={({ field }) => (
                  <OptionSelect value={field.value} onChange={field.onChange} options={NOTE_STATUSES} />
                )} />
              </Field>
              <Field>
                <FieldLabel className="text-xs text-muted-foreground">Priority</FieldLabel>
                <Controller control={control} name="priority" render={({ field }) => (
                  <OptionSelect value={field.value} onChange={field.onChange} options={PRIORITIES} />
                )} />
              </Field>
              <Field>
                <FieldLabel className="text-xs text-muted-foreground">Due date</FieldLabel>
                <Input type="date" {...register("dueDate")} />
              </Field>
            </div>
            <Field>
              <FieldLabel className="text-xs text-muted-foreground">Project</FieldLabel>
              <Controller control={control} name="relatedProjectId" render={({ field }) => (
                <OptionSelect value={field.value} onChange={field.onChange} placeholder="No project"
                  options={projects.map((p) => ({ value: p.id, label: p.name, accent: "violet" as const }))} />
              )} />
            </Field>
            <Field>
              <FieldLabel className="text-xs text-muted-foreground">Tags</FieldLabel>
              <Controller control={control} name="tags" render={({ field }) => (
                <TagsInput value={field.value} onChange={field.onChange} />
              )} />
            </Field>
            <label className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pinned</span>
              <Controller control={control} name="pinned" render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )} />
            </label>
          </FieldGroup>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={formState.isSubmitting}>Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

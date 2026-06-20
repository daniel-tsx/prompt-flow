"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pin, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { OptionSelect } from "@/components/forms/option-select";
import { TagsInput } from "@/components/forms/tags-input";
import { NOTE_TYPES, PRIORITIES } from "@/lib/constants";
import { quickCapture } from "@/lib/actions/notes";
import type { PickerProject } from "@/types";

const captureForm = z.object({
  title: z.string().trim().min(1, "Type something to capture"),
  body: z.string().optional(),
  noteType: z.enum(NOTE_TYPES.map((t) => t.value) as [string, ...string[]]),
  priority: z.enum(["low", "medium", "high"]),
  relatedProjectId: z.string().optional(),
  dueDate: z.string().optional(),
  pinned: z.boolean(),
  tags: z.array(z.string()),
});
type CaptureForm = z.infer<typeof captureForm>;

export function QuickCaptureDialog({
  open,
  onOpenChange,
  defaultType = "quick-note",
  projects,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: string;
  projects: PickerProject[];
}) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setFocus,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<CaptureForm>({
    resolver: zodResolver(captureForm),
    defaultValues: {
      title: "",
      body: "",
      noteType: defaultType,
      priority: "medium",
      relatedProjectId: undefined,
      dueDate: "",
      pinned: false,
      tags: [],
    },
  });

  const noteType = watch("noteType");

  useEffect(() => {
    if (open) {
      reset({
        title: "",
        body: "",
        noteType: defaultType,
        priority: "medium",
        relatedProjectId: undefined,
        dueDate: "",
        pinned: false,
        tags: [],
      });
      setTimeout(() => setFocus("title"), 50);
    }
  }, [open, defaultType, reset, setFocus]);

  async function onSubmit(values: CaptureForm) {
    const res = await quickCapture({
      title: values.title,
      body: values.body || null,
      noteType: values.noteType as never,
      priority: values.priority,
      relatedProjectId: values.relatedProjectId || null,
      dueDate: values.dueDate ? new Date(values.dueDate) : null,
      pinned: values.pinned,
      tags: values.tags,
    });
    if (res.ok) {
      toast.success("Captured to inbox");
      onOpenChange(false);
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            Quick capture
          </DialogTitle>
          <DialogDescription>
            Drop a note, task, or idea into your inbox before it disappears.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              handleSubmit(onSubmit)();
            }
          }}
        >
          <FieldGroup>
            <Field data-invalid={!!errors.title}>
              <Input
                {...register("title")}
                placeholder="What's on your mind?"
                aria-invalid={!!errors.title}
                className="text-base"
              />
            </Field>

            <Field>
              <Textarea
                {...register("body")}
                placeholder="Optional details (markdown supported)…"
                className="min-h-24 font-mono text-sm"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel className="text-xs text-muted-foreground">Type</FieldLabel>
                <Controller
                  control={control}
                  name="noteType"
                  render={({ field }) => (
                    <OptionSelect value={field.value} onChange={field.onChange} options={NOTE_TYPES} />
                  )}
                />
              </Field>
              <Field>
                <FieldLabel className="text-xs text-muted-foreground">Priority</FieldLabel>
                <Controller
                  control={control}
                  name="priority"
                  render={({ field }) => (
                    <OptionSelect value={field.value} onChange={field.onChange} options={PRIORITIES} />
                  )}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel className="text-xs text-muted-foreground">Project</FieldLabel>
                <Controller
                  control={control}
                  name="relatedProjectId"
                  render={({ field }) => (
                    <OptionSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="No project"
                      options={projects.map((p) => ({
                        value: p.id,
                        label: p.name,
                        accent: "violet" as const,
                      }))}
                    />
                  )}
                />
              </Field>
              {noteType === "task" && (
                <Field>
                  <FieldLabel className="text-xs text-muted-foreground">Due date</FieldLabel>
                  <Input type="date" {...register("dueDate")} />
                </Field>
              )}
            </div>

            <Field>
              <FieldLabel className="text-xs text-muted-foreground">Tags</FieldLabel>
              <Controller
                control={control}
                name="tags"
                render={({ field }) => (
                  <TagsInput value={field.value} onChange={field.onChange} />
                )}
              />
            </Field>

            <div className="flex items-center justify-between border-t pt-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <Controller
                  control={control}
                  name="pinned"
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                <Pin className="size-3.5" />
                Pin to top
              </label>
              <div className="flex items-center gap-2">
                <span className="hidden text-xs text-muted-foreground sm:inline">⌘↵ to save</span>
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  Capture
                </Button>
              </div>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}

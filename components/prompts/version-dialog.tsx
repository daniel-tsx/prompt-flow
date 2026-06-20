"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { GitBranch } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { MarkdownEditor } from "@/components/editor/markdown-editor";
import { createPromptVersion } from "@/lib/actions/prompts";

type VersionForm = {
  title: string;
  promptText: string;
  changeSummary: string;
  reasonForChange: string;
  resultNotes: string;
  qualityScore: string;
  markCurrent: boolean;
};

export function VersionDialog({
  promptId,
  currentTitle,
  currentText,
  trigger,
}: {
  promptId: string;
  currentTitle: string;
  currentText: string;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, control, reset, formState } = useForm<VersionForm>({
    defaultValues: {
      title: currentTitle,
      promptText: currentText,
      changeSummary: "",
      reasonForChange: "",
      resultNotes: "",
      qualityScore: "",
      markCurrent: true,
    },
  });

  async function onSubmit(v: VersionForm) {
    const res = await createPromptVersion(
      {
        promptId,
        title: v.title,
        promptText: v.promptText,
        changeSummary: v.changeSummary || null,
        reasonForChange: v.reasonForChange || null,
        resultNotes: v.resultNotes || null,
        qualityScore: v.qualityScore ? Number(v.qualityScore) : null,
      },
      v.markCurrent,
    );
    if (res.ok) {
      toast.success("New version saved");
      setOpen(false);
      reset();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="size-4 text-primary" /> New version
          </DialogTitle>
          <DialogDescription>
            Iterate on the prompt and record why it changed.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FieldGroup>
            <Field>
              <FieldLabel>Title</FieldLabel>
              <Input {...register("title", { required: true })} />
            </Field>
            <Field>
              <FieldLabel>Prompt</FieldLabel>
              <Controller control={control} name="promptText" render={({ field }) => (
                <MarkdownEditor value={field.value} onChange={field.onChange} minHeight="min-h-[220px]" />
              )} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel>Change summary</FieldLabel>
                <Input {...register("changeSummary")} placeholder="What changed?" />
              </Field>
              <Field>
                <FieldLabel>Quality (1–10)</FieldLabel>
                <Input type="number" min={1} max={10} {...register("qualityScore")} placeholder="—" />
              </Field>
            </div>
            <Field>
              <FieldLabel>Reason for change</FieldLabel>
              <Input {...register("reasonForChange")} placeholder="Why did you change it?" />
            </Field>
            <Field>
              <FieldLabel>Result notes</FieldLabel>
              <Textarea {...register("resultNotes")} placeholder="How did this version perform?" className="min-h-16 text-sm" />
            </Field>
            <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
              <span className="text-sm text-muted-foreground">Mark as current version</span>
              <Controller control={control} name="markCurrent" render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )} />
            </div>
          </FieldGroup>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={formState.isSubmitting}>
              Save version
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

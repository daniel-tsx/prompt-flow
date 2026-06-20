"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { OptionSelect } from "@/components/forms/option-select";
import { TagsInput } from "@/components/forms/tags-input";
import { RUN_RESULTS, TARGET_TOOLS } from "@/lib/constants";
import { createRun } from "@/lib/actions/runs";
import type { PickerProject } from "@/types";

type RunFormValues = {
  title: string;
  promptId: string;
  promptVersionId: string;
  projectId: string;
  toolUsed: string;
  modelUsed: string;
  date: string;
  resultStatus: string;
  taskDescription: string;
  inputContext: string;
  outputSummary: string;
  timeSpentMinutes: string;
  estimatedTimeSavedMinutes: string;
  problems: string[];
  lessonsLearned: string;
  followUpNeeded: boolean;
  followUpNote: string;
};

export function RunForm({
  defaultPromptId,
  lockPrompt = false,
  prompts,
  projects,
  versions = [],
  defaultTool = "other",
  onDone,
}: {
  defaultPromptId?: string;
  lockPrompt?: boolean;
  prompts: { id: string; title: string }[];
  projects: PickerProject[];
  versions?: { id: string; versionNumber: number; title: string }[];
  defaultTool?: string;
  onDone?: () => void;
}) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  const { register, handleSubmit, control, watch, formState } = useForm<RunFormValues>({
    defaultValues: {
      title: "",
      promptId: defaultPromptId ?? "",
      promptVersionId: "",
      projectId: "",
      toolUsed: defaultTool,
      modelUsed: "",
      date: today,
      resultStatus: "good",
      taskDescription: "",
      inputContext: "",
      outputSummary: "",
      timeSpentMinutes: "",
      estimatedTimeSavedMinutes: "",
      problems: [],
      lessonsLearned: "",
      followUpNeeded: false,
      followUpNote: "",
    },
  });

  const followUp = watch("followUpNeeded");

  async function onSubmit(v: RunFormValues) {
    if (!v.promptId) {
      toast.error("Choose a prompt for this run");
      return;
    }
    const num = (s: string) => (s ? Number(s) : null);
    const res = await createRun({
      promptId: v.promptId,
      promptVersionId: v.promptVersionId || null,
      projectId: v.projectId || null,
      title: v.title,
      date: v.date ? new Date(v.date) : new Date(),
      toolUsed: v.toolUsed as never,
      modelUsed: v.modelUsed || null,
      taskDescription: v.taskDescription || null,
      inputContext: v.inputContext || null,
      outputSummary: v.outputSummary || null,
      resultStatus: v.resultStatus as never,
      timeSpentMinutes: num(v.timeSpentMinutes),
      estimatedTimeSavedMinutes: num(v.estimatedTimeSavedMinutes),
      problems: v.problems,
      lessonsLearned: v.lessonsLearned || null,
      followUpNeeded: v.followUpNeeded,
      followUpNote: v.followUpNote || null,
    });
    if (res.ok) {
      toast.success("Run logged");
      onDone ? onDone() : router.push("/runs");
    } else {
      toast.error(res.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FieldGroup>
        <Field>
          <FieldLabel>Run title</FieldLabel>
          <Input
            {...register("title", { required: true })}
            placeholder="e.g. Bootstrap SmartTrips backend"
            aria-invalid={!!formState.errors.title}
          />
        </Field>

        {!lockPrompt && (
          <Field>
            <FieldLabel>Prompt</FieldLabel>
            <Controller control={control} name="promptId" render={({ field }) => (
              <OptionSelect
                value={field.value}
                onChange={field.onChange}
                placeholder="Select prompt"
                options={prompts.map((p) => ({ value: p.id, label: p.title, accent: "violet" as const }))}
              />
            )} />
          </Field>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel>Tool</FieldLabel>
            <Controller control={control} name="toolUsed" render={({ field }) => (
              <OptionSelect value={field.value} onChange={field.onChange} options={TARGET_TOOLS} />
            )} />
          </Field>
          <Field>
            <FieldLabel>Model</FieldLabel>
            <Input {...register("modelUsed")} placeholder="e.g. gpt-5-codex" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel>Result</FieldLabel>
            <Controller control={control} name="resultStatus" render={({ field }) => (
              <OptionSelect value={field.value} onChange={field.onChange} options={RUN_RESULTS} />
            )} />
          </Field>
          <Field>
            <FieldLabel>Date</FieldLabel>
            <Input type="date" {...register("date")} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel>Project</FieldLabel>
            <Controller control={control} name="projectId" render={({ field }) => (
              <OptionSelect
                value={field.value}
                onChange={field.onChange}
                placeholder="No project"
                options={projects.map((p) => ({ value: p.id, label: p.name, accent: "violet" as const }))}
              />
            )} />
          </Field>
          {versions.length > 0 && (
            <Field>
              <FieldLabel>Version</FieldLabel>
              <Controller control={control} name="promptVersionId" render={({ field }) => (
                <OptionSelect
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Latest"
                  options={versions.map((v) => ({ value: v.id, label: `v${v.versionNumber}`, accent: "slate" as const }))}
                />
              )} />
            </Field>
          )}
        </div>

        <Field>
          <FieldLabel>Task description</FieldLabel>
          <Textarea {...register("taskDescription")} placeholder="What did you use it for?" className="min-h-16 text-sm" />
        </Field>
        <Field>
          <FieldLabel>Output summary</FieldLabel>
          <Textarea {...register("outputSummary")} placeholder="What came back? How good was it?" className="min-h-16 text-sm" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel>Time spent (min)</FieldLabel>
            <Input type="number" min={0} {...register("timeSpentMinutes")} placeholder="0" />
          </Field>
          <Field>
            <FieldLabel>Time saved (min)</FieldLabel>
            <Input type="number" min={0} {...register("estimatedTimeSavedMinutes")} placeholder="0" />
          </Field>
        </div>

        <Field>
          <FieldLabel>Problems</FieldLabel>
          <Controller control={control} name="problems" render={({ field }) => (
            <TagsInput value={field.value} onChange={field.onChange} placeholder="Add a problem and press Enter" />
          )} />
        </Field>
        <Field>
          <FieldLabel>Lessons learned</FieldLabel>
          <Textarea {...register("lessonsLearned")} placeholder="What would you do differently?" className="min-h-16 text-sm" />
        </Field>

        <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
          <span className="text-sm text-muted-foreground">Needs follow-up</span>
          <Controller control={control} name="followUpNeeded" render={({ field }) => (
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          )} />
        </div>
        {followUp && (
          <Field>
            <FieldLabel>Follow-up note</FieldLabel>
            <Input {...register("followUpNote")} placeholder="What to revisit?" />
          </Field>
        )}
      </FieldGroup>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={formState.isSubmitting}>
          Log run
        </Button>
      </div>
    </form>
  );
}

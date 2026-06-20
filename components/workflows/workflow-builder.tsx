"use client";

import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  GripVertical,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { OptionSelect } from "@/components/forms/option-select";
import { TagsInput } from "@/components/forms/tags-input";
import { WORKFLOW_STATUSES, WORKFLOW_TYPES } from "@/lib/constants";
import { createWorkflow, updateWorkflow } from "@/lib/actions/workflows";
import type { LinkablePrompt, PickerProject } from "@/types";

type StepValue = {
  title: string;
  description: string;
  linkedPromptId: string;
  instruction: string;
  expectedOutput: string;
  checklist: string[];
};

type WFForm = {
  title: string;
  description: string;
  workflowType: string;
  relatedProjectId: string;
  status: string;
  outcome: string;
  whenToUse: string;
  whenNotToUse: string;
  toolsUsed: string[];
  favorite: boolean;
  tags: string[];
  notes: string;
  steps: StepValue[];
};

export type WorkflowBuilderData = {
  id: string;
  title: string;
  description: string | null;
  workflowType: string;
  relatedProjectId: string | null;
  status: string;
  outcome: string | null;
  whenToUse: string | null;
  whenNotToUse: string | null;
  toolsUsed: string[];
  favorite: boolean;
  tags: string[];
  notes: string | null;
  steps: {
    title: string;
    description: string | null;
    linkedPromptId: string | null;
    instruction: string | null;
    expectedOutput: string | null;
    checklist: string[];
  }[];
};

const emptyStep: StepValue = {
  title: "",
  description: "",
  linkedPromptId: "",
  instruction: "",
  expectedOutput: "",
  checklist: [],
};

export function WorkflowBuilder({
  workflow,
  projects,
  prompts,
}: {
  workflow?: WorkflowBuilderData;
  projects: PickerProject[];
  prompts: LinkablePrompt[];
}) {
  const router = useRouter();
  const editing = !!workflow;

  const { register, handleSubmit, control, formState } = useForm<WFForm>({
    defaultValues: {
      title: workflow?.title ?? "",
      description: workflow?.description ?? "",
      workflowType: workflow?.workflowType ?? "other",
      relatedProjectId: workflow?.relatedProjectId ?? "",
      status: workflow?.status ?? "draft",
      outcome: workflow?.outcome ?? "",
      whenToUse: workflow?.whenToUse ?? "",
      whenNotToUse: workflow?.whenNotToUse ?? "",
      toolsUsed: workflow?.toolsUsed ?? [],
      favorite: workflow?.favorite ?? false,
      tags: workflow?.tags ?? [],
      notes: workflow?.notes ?? "",
      steps:
        workflow?.steps.map((s) => ({
          title: s.title,
          description: s.description ?? "",
          linkedPromptId: s.linkedPromptId ?? "",
          instruction: s.instruction ?? "",
          expectedOutput: s.expectedOutput ?? "",
          checklist: s.checklist,
        })) ?? [{ ...emptyStep, title: "Step 1" }],
    },
  });

  const { fields, append, remove, move } = useFieldArray({ control, name: "steps" });

  const promptOptions = prompts.map((p) => ({
    value: p.id,
    label: p.title,
    accent: "violet" as const,
  }));

  async function onSubmit(v: WFForm) {
    const input = {
      title: v.title,
      description: v.description || null,
      workflowType: v.workflowType as never,
      relatedProjectId: v.relatedProjectId || null,
      status: v.status as never,
      outcome: v.outcome || null,
      whenToUse: v.whenToUse || null,
      whenNotToUse: v.whenNotToUse || null,
      toolsUsed: v.toolsUsed,
      favorite: v.favorite,
      tags: v.tags,
      notes: v.notes || null,
      steps: v.steps.map((s, i) => ({
        order: i,
        title: s.title,
        description: s.description || null,
        linkedPromptId: s.linkedPromptId || null,
        instruction: s.instruction || null,
        expectedOutput: s.expectedOutput || null,
        checklist: s.checklist,
      })),
    };
    const res = editing
      ? await updateWorkflow(workflow!.id, input)
      : await createWorkflow(input);
    if (res.ok) {
      toast.success(editing ? "Workflow saved" : "Workflow created");
      router.push(`/workflows/${res.data!.slug}`);
    } else {
      toast.error(res.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="sticky top-14 z-10 -mx-4 mb-4 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <Button type="button" variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="size-4" /> Back
        </Button>
        <Button type="submit" disabled={formState.isSubmitting}>
          <Save className="size-4" /> {editing ? "Save workflow" : "Create workflow"}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <FieldGroup>
            <Field>
              <Input
                {...register("title", { required: true })}
                placeholder="Workflow title"
                aria-invalid={!!formState.errors.title}
                className="h-11 text-lg font-medium"
              />
            </Field>
            <Field>
              <Textarea {...register("description")} placeholder="What is this workflow for?" className="min-h-16 text-sm" />
            </Field>
          </FieldGroup>

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Steps</h2>
            <Badge variant="secondary">{fields.length} steps</Badge>
          </div>

          {fields.map((field, index) => (
            <Card key={field.id} className="gap-0 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <GripVertical className="size-4" />
                  Step {index + 1}
                </div>
                <div className="flex items-center gap-0.5">
                  <Button type="button" variant="ghost" size="icon-sm" disabled={index === 0} onClick={() => move(index, index - 1)} aria-label="Move up">
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon-sm" disabled={index === fields.length - 1} onClick={() => move(index, index + 1)} aria-label="Move down">
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon-sm" className="text-muted-foreground" disabled={fields.length === 1} onClick={() => remove(index)} aria-label="Remove step">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              <FieldGroup>
                <Field>
                  <Input {...register(`steps.${index}.title` as const, { required: true })} placeholder="Step title" />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field>
                    <FieldLabel className="text-xs text-muted-foreground">Linked prompt</FieldLabel>
                    <Controller control={control} name={`steps.${index}.linkedPromptId` as const} render={({ field: f }) => (
                      <OptionSelect value={f.value} onChange={f.onChange} options={promptOptions} placeholder="None" />
                    )} />
                  </Field>
                  <Field>
                    <FieldLabel className="text-xs text-muted-foreground">Expected output</FieldLabel>
                    <Input {...register(`steps.${index}.expectedOutput` as const)} placeholder="What this step produces" />
                  </Field>
                </div>
                <Field>
                  <FieldLabel className="text-xs text-muted-foreground">Instruction</FieldLabel>
                  <Textarea {...register(`steps.${index}.instruction` as const)} placeholder="What to do in this step (markdown)" className="min-h-16 font-mono text-sm" />
                </Field>
                <Field>
                  <FieldLabel className="text-xs text-muted-foreground">Checklist</FieldLabel>
                  <Controller control={control} name={`steps.${index}.checklist` as const} render={({ field: f }) => (
                    <TagsInput value={f.value} onChange={f.onChange} placeholder="Add a checklist item and press Enter" />
                  )} />
                </Field>
              </FieldGroup>
            </Card>
          ))}

          <Button type="button" variant="outline" onClick={() => append({ ...emptyStep, title: `Step ${fields.length + 1}` })}>
            <Plus className="size-4" /> Add step
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Settings</CardTitle></CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>Type</FieldLabel>
                  <Controller control={control} name="workflowType" render={({ field }) => (
                    <OptionSelect value={field.value} onChange={field.onChange} options={WORKFLOW_TYPES} />
                  )} />
                </Field>
                <Field>
                  <FieldLabel>Status</FieldLabel>
                  <Controller control={control} name="status" render={({ field }) => (
                    <OptionSelect value={field.value} onChange={field.onChange} options={WORKFLOW_STATUSES} />
                  )} />
                </Field>
                <Field>
                  <FieldLabel>Project</FieldLabel>
                  <Controller control={control} name="relatedProjectId" render={({ field }) => (
                    <OptionSelect value={field.value} onChange={field.onChange} placeholder="No project"
                      options={projects.map((p) => ({ value: p.id, label: p.name, accent: "violet" as const }))} />
                  )} />
                </Field>
                <Field>
                  <FieldLabel>Tools used</FieldLabel>
                  <Controller control={control} name="toolsUsed" render={({ field }) => (
                    <TagsInput value={field.value} onChange={field.onChange} placeholder="Add a tool" />
                  )} />
                </Field>
                <Field>
                  <FieldLabel>Tags</FieldLabel>
                  <Controller control={control} name="tags" render={({ field }) => (
                    <TagsInput value={field.value} onChange={field.onChange} />
                  )} />
                </Field>
                <label className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Favorite</span>
                  <Controller control={control} name="favorite" render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )} />
                </label>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Guidance</CardTitle></CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>Outcome</FieldLabel>
                  <Textarea {...register("outcome")} placeholder="What you end up with" className="min-h-14 text-sm" />
                </Field>
                <Field>
                  <FieldLabel>When to use</FieldLabel>
                  <Textarea {...register("whenToUse")} placeholder="The right situation" className="min-h-14 text-sm" />
                </Field>
                <Field>
                  <FieldLabel>When not to use</FieldLabel>
                  <Textarea {...register("whenNotToUse")} placeholder="When to skip it" className="min-h-14 text-sm" />
                </Field>
                <Field>
                  <FieldLabel>Notes</FieldLabel>
                  <Textarea {...register("notes")} placeholder="Anything else" className="min-h-14 text-sm" />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}

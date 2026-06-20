"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { ArrowLeft, Save, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OptionSelect } from "@/components/forms/option-select";
import { TagsInput } from "@/components/forms/tags-input";
import { MarkdownEditor } from "@/components/editor/markdown-editor";
import {
  PROMPT_CATEGORIES,
  PROMPT_INTENTS,
  PROMPT_STATUSES,
  TARGET_TOOLS,
} from "@/lib/constants";
import { createPrompt, updatePrompt } from "@/lib/actions/prompts";
import type { Prompt } from "@/db/schema";
import type { PickerProject } from "@/types";

type FormValues = {
  title: string;
  description: string;
  promptText: string;
  notes: string;
  category: string;
  intent: string;
  targetTool: string;
  targetModel: string;
  relatedProjectId: string;
  status: string;
  reusable: boolean;
  favorite: boolean;
  qualityScore: string;
  clarityScore: string;
  resultScore: string;
  costEfficiencyScore: string;
  tags: string[];
};

const SCORE_OPTIONS = ["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

function ScoreSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value || "none"} onValueChange={(v) => onChange(v === "none" ? "" : (v ?? ""))}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="—" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="none">—</SelectItem>
          {SCORE_OPTIONS.filter(Boolean).map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export function PromptEditor({
  prompt,
  projects,
}: {
  prompt?: Prompt;
  projects: PickerProject[];
}) {
  const router = useRouter();
  const editing = !!prompt;

  const { register, handleSubmit, control, watch, formState } =
    useForm<FormValues>({
      defaultValues: {
        title: prompt?.title ?? "",
        description: prompt?.description ?? "",
        promptText: prompt?.promptText ?? "",
        notes: prompt?.notes ?? "",
        category: prompt?.category ?? "other",
        intent: prompt?.intent ?? "other",
        targetTool: prompt?.targetTool ?? "other",
        targetModel: prompt?.targetModel ?? "",
        relatedProjectId: prompt?.relatedProjectId ?? "",
        status: prompt?.status ?? "draft",
        reusable: prompt?.reusable ?? true,
        favorite: prompt?.favorite ?? false,
        qualityScore: prompt?.qualityScore?.toString() ?? "",
        clarityScore: prompt?.clarityScore?.toString() ?? "",
        resultScore: prompt?.resultScore?.toString() ?? "",
        costEfficiencyScore: prompt?.costEfficiencyScore?.toString() ?? "",
        tags: prompt?.tags ?? [],
      },
    });

  const favorite = watch("favorite");

  async function onSubmit(values: FormValues) {
    const num = (s: string) => (s ? Number(s) : null);
    const input = {
      title: values.title,
      description: values.description || null,
      promptText: values.promptText,
      notes: values.notes || null,
      category: values.category as Prompt["category"],
      intent: values.intent as Prompt["intent"],
      targetTool: values.targetTool as Prompt["targetTool"],
      targetModel: values.targetModel || null,
      relatedProjectId: values.relatedProjectId || null,
      status: values.status as Prompt["status"],
      reusable: values.reusable,
      favorite: values.favorite,
      qualityScore: num(values.qualityScore),
      clarityScore: num(values.clarityScore),
      resultScore: num(values.resultScore),
      costEfficiencyScore: num(values.costEfficiencyScore),
      tags: values.tags,
    };

    const res = editing
      ? await updatePrompt(prompt!.id, input)
      : await createPrompt(input);

    if (res.ok) {
      toast.success(editing ? "Prompt saved" : "Prompt created");
      router.push(`/prompts/${res.data!.slug}`);
    } else {
      toast.error(res.error);
    }
  }

  const projectOptions = [
    ...projects.map((p) => ({ value: p.id, label: p.name, accent: "violet" as const })),
  ];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
          e.preventDefault();
          handleSubmit(onSubmit)();
        }
      }}
    >
      <div className="sticky top-14 z-10 -mx-4 mb-4 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <Button type="button" variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="size-4" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-muted-foreground sm:inline">⌘↵ to save</span>
          <Button type="submit" disabled={formState.isSubmitting}>
            <Save className="size-4" /> {editing ? "Save changes" : "Create prompt"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <FieldGroup>
            <Field>
              <Input
                {...register("title", { required: true })}
                placeholder="Prompt title"
                aria-invalid={!!formState.errors.title}
                className="h-11 text-lg font-medium"
              />
            </Field>
            <Field>
              <Input {...register("description")} placeholder="Short description (what does this prompt do?)" />
            </Field>
          </FieldGroup>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                control={control}
                name="promptText"
                render={({ field }) => (
                  <MarkdownEditor value={field.value} onChange={field.onChange} />
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                {...register("notes")}
                placeholder="What worked, what failed, when to use this…"
                className="min-h-24 text-sm"
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Classification</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>Category</FieldLabel>
                  <Controller control={control} name="category" render={({ field }) => (
                    <OptionSelect value={field.value} onChange={field.onChange} options={PROMPT_CATEGORIES} />
                  )} />
                </Field>
                <Field>
                  <FieldLabel>Intent</FieldLabel>
                  <Controller control={control} name="intent" render={({ field }) => (
                    <OptionSelect value={field.value} onChange={field.onChange} options={PROMPT_INTENTS} />
                  )} />
                </Field>
                <Field>
                  <FieldLabel>Target tool</FieldLabel>
                  <Controller control={control} name="targetTool" render={({ field }) => (
                    <OptionSelect value={field.value} onChange={field.onChange} options={TARGET_TOOLS} />
                  )} />
                </Field>
                <Field>
                  <FieldLabel>Target model</FieldLabel>
                  <Input {...register("targetModel")} placeholder="e.g. claude-opus-4-8" />
                </Field>
                <Field>
                  <FieldLabel>Project</FieldLabel>
                  <Controller control={control} name="relatedProjectId" render={({ field }) => (
                    <OptionSelect value={field.value} onChange={field.onChange} options={projectOptions} placeholder="No project" />
                  )} />
                </Field>
                <Field>
                  <FieldLabel>Status</FieldLabel>
                  <Controller control={control} name="status" render={({ field }) => (
                    <OptionSelect value={field.value} onChange={field.onChange} options={PROMPT_STATUSES} />
                  )} />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Scores (1–10)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {([
                  ["qualityScore", "Quality"],
                  ["clarityScore", "Clarity"],
                  ["resultScore", "Result"],
                  ["costEfficiencyScore", "Cost eff."],
                ] as const).map(([name, label]) => (
                  <Field key={name}>
                    <FieldLabel className="text-xs text-muted-foreground">{label}</FieldLabel>
                    <Controller control={control} name={name} render={({ field }) => (
                      <ScoreSelect value={field.value} onChange={field.onChange} />
                    )} />
                  </Field>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-4 pt-4">
              <Field>
                <FieldLabel>Tags</FieldLabel>
                <Controller control={control} name="tags" render={({ field }) => (
                  <TagsInput value={field.value} onChange={field.onChange} />
                )} />
              </Field>
              <label className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Reusable</span>
                <Controller control={control} name="reusable" render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )} />
              </label>
              <label className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Star className={favorite ? "size-3.5 fill-amber-400 text-amber-400" : "size-3.5"} />
                  Favorite
                </span>
                <Controller control={control} name="favorite" render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )} />
              </label>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}

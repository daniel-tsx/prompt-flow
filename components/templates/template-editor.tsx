"use client";

import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { ArrowLeft, Plus, Save, Trash2, Variable } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { OptionSelect } from "@/components/forms/option-select";
import { MarkdownEditor } from "@/components/editor/markdown-editor";
import { TEMPLATE_TYPES } from "@/lib/constants";
import { createTemplate, updateTemplate } from "@/lib/actions/templates";
import type { Template } from "@/db/schema";

type TForm = {
  name: string;
  templateType: string;
  description: string;
  content: string;
  usageNotes: string;
  variables: { name: string; description: string; example: string }[];
};

export function TemplateEditor({ template }: { template?: Template }) {
  const router = useRouter();
  const editing = !!template;

  const { register, handleSubmit, control, formState } = useForm<TForm>({
    defaultValues: {
      name: template?.name ?? "",
      templateType: template?.templateType ?? "prompt",
      description: template?.description ?? "",
      content: template?.content ?? "",
      usageNotes: template?.usageNotes ?? "",
      variables:
        template?.variables.map((v) => ({
          name: v.name,
          description: v.description ?? "",
          example: v.example ?? "",
        })) ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "variables" });

  async function onSubmit(v: TForm) {
    const input = {
      name: v.name,
      templateType: v.templateType as never,
      description: v.description || null,
      content: v.content,
      usageNotes: v.usageNotes || null,
      variables: v.variables
        .filter((x) => x.name.trim())
        .map((x) => ({
          name: x.name.trim(),
          description: x.description || undefined,
          example: x.example || undefined,
        })),
    };
    const res = editing
      ? await updateTemplate(template!.id, input)
      : await createTemplate(input);
    if (res.ok) {
      toast.success(editing ? "Template saved" : "Template created");
      router.push("/templates");
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
          <Save className="size-4" /> {editing ? "Save template" : "Create template"}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <FieldGroup>
            <Field>
              <Input {...register("name", { required: true })} placeholder="Template name" className="h-11 text-lg font-medium" aria-invalid={!!formState.errors.name} />
            </Field>
            <Field>
              <Input {...register("description")} placeholder="What is this template for?" />
            </Field>
          </FieldGroup>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Content</CardTitle></CardHeader>
            <CardContent>
              <Controller control={control} name="content" render={({ field }) => (
                <MarkdownEditor value={field.value} onChange={field.onChange} placeholder="Use {{variables}} as placeholders…" showHelpers={false} />
              )} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Settings</CardTitle></CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>Type</FieldLabel>
                  <Controller control={control} name="templateType" render={({ field }) => (
                    <OptionSelect value={field.value} onChange={field.onChange} options={TEMPLATE_TYPES} />
                  )} />
                </Field>
                <Field>
                  <FieldLabel>Usage notes</FieldLabel>
                  <Textarea {...register("usageNotes")} placeholder="Tips for using this template" className="min-h-16 text-sm" />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Variable className="size-4" /> Variables
              </CardTitle>
              <Button type="button" variant="ghost" size="xs" onClick={() => append({ name: "", description: "", example: "" })}>
                <Plus className="size-3.5" /> Add
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {fields.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Document the <code className="rounded bg-muted px-1">{`{{placeholders}}`}</code> used in your content.
                </p>
              )}
              {fields.map((f, i) => (
                <div key={f.id} className="flex flex-col gap-1.5 rounded-md border bg-muted/20 p-2.5">
                  <div className="flex items-center gap-2">
                    <Input {...register(`variables.${i}.name` as const)} placeholder="variable_name" className="font-mono text-xs" />
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(i)} aria-label="Remove">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                  <Input {...register(`variables.${i}.description` as const)} placeholder="Description" className="text-xs" />
                  <Input {...register(`variables.${i}.example` as const)} placeholder="Example value" className="text-xs" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}

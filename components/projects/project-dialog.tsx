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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { OptionSelect } from "@/components/forms/option-select";
import { COLOR_SWATCHES, PROJECT_STATUSES, PROJECT_TYPES } from "@/lib/constants";
import { createProject, updateProject } from "@/lib/actions/projects";
import { cn } from "@/lib/utils";
import type { Project } from "@/db/schema";

type PForm = {
  name: string;
  description: string;
  domain: string;
  type: string;
  status: string;
  color: string;
};

export function ProjectDialog({
  project,
  trigger,
}: {
  project?: Project;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const editing = !!project;
  const { register, handleSubmit, control, formState } = useForm<PForm>({
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? "",
      domain: project?.domain ?? "",
      type: project?.type ?? "personal",
      status: project?.status ?? "active",
      color: project?.color ?? COLOR_SWATCHES[0],
    },
  });

  async function onSubmit(v: PForm) {
    const input = {
      name: v.name,
      description: v.description || null,
      domain: v.domain || null,
      type: v.type as never,
      status: v.status as never,
      color: v.color,
    };
    const res = editing ? await updateProject(project!.id, input) : await createProject(input);
    if (res.ok) {
      toast.success(editing ? "Project saved" : "Project created");
      setOpen(false);
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit project" : "New project"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input {...register("name", { required: true })} placeholder="Project name" aria-invalid={!!formState.errors.name} />
            </Field>
            <Field>
              <FieldLabel>Description</FieldLabel>
              <Textarea {...register("description")} placeholder="What is this project?" className="min-h-16 text-sm" />
            </Field>
            <Field>
              <FieldLabel>Domain</FieldLabel>
              <Input {...register("domain")} placeholder="example.com (optional)" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel>Type</FieldLabel>
                <Controller control={control} name="type" render={({ field }) => (
                  <OptionSelect value={field.value} onChange={field.onChange} options={PROJECT_TYPES} />
                )} />
              </Field>
              <Field>
                <FieldLabel>Status</FieldLabel>
                <Controller control={control} name="status" render={({ field }) => (
                  <OptionSelect value={field.value} onChange={field.onChange} options={PROJECT_STATUSES} />
                )} />
              </Field>
            </div>
            <Field>
              <FieldLabel>Color</FieldLabel>
              <Controller control={control} name="color" render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {COLOR_SWATCHES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => field.onChange(c)}
                      className={cn(
                        "size-7 rounded-full ring-offset-2 ring-offset-background transition-all",
                        field.value === c && "ring-2 ring-foreground",
                      )}
                      style={{ backgroundColor: c }}
                      aria-label={`Color ${c}`}
                    />
                  ))}
                </div>
              )} />
            </Field>
          </FieldGroup>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={formState.isSubmitting}>{editing ? "Save" : "Create"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

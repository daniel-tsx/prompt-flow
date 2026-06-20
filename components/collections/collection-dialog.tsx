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
import { COLLECTION_TYPES, COLOR_SWATCHES } from "@/lib/constants";
import { createCollection, updateCollection } from "@/lib/actions/collections";
import { cn } from "@/lib/utils";
import type { Collection } from "@/db/schema";

type CForm = { name: string; description: string; collectionType: string; color: string };

export function CollectionDialog({
  collection,
  trigger,
}: {
  collection?: Collection;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const editing = !!collection;
  const { register, handleSubmit, control, formState } = useForm<CForm>({
    defaultValues: {
      name: collection?.name ?? "",
      description: collection?.description ?? "",
      collectionType: collection?.collectionType ?? "other",
      color: collection?.color ?? COLOR_SWATCHES[0],
    },
  });

  async function onSubmit(v: CForm) {
    const input = {
      name: v.name,
      description: v.description || null,
      collectionType: v.collectionType as never,
      color: v.color,
      icon: null,
    };
    const res = editing ? await updateCollection(collection!.id, input) : await createCollection(input);
    if (res.ok) {
      toast.success(editing ? "Collection saved" : "Collection created");
      setOpen(false);
    } else toast.error(res.error);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit collection" : "New collection"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input {...register("name", { required: true })} placeholder="Collection name" aria-invalid={!!formState.errors.name} />
            </Field>
            <Field>
              <FieldLabel>Description</FieldLabel>
              <Textarea {...register("description")} placeholder="What's in this pack?" className="min-h-16 text-sm" />
            </Field>
            <Field>
              <FieldLabel>Type</FieldLabel>
              <Controller control={control} name="collectionType" render={({ field }) => (
                <OptionSelect value={field.value} onChange={field.onChange} options={COLLECTION_TYPES} />
              )} />
            </Field>
            <Field>
              <FieldLabel>Color</FieldLabel>
              <Controller control={control} name="color" render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {COLOR_SWATCHES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => field.onChange(c)}
                      className={cn("size-7 rounded-full ring-offset-2 ring-offset-background", field.value === c && "ring-2 ring-foreground")}
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

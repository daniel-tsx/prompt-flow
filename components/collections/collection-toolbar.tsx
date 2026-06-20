"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { OptionSelect } from "@/components/forms/option-select";
import { CollectionDialog } from "@/components/collections/collection-dialog";
import { COLLECTION_ITEM_TYPES } from "@/lib/constants";
import {
  addCollectionItem,
  deleteCollection,
  exportCollectionMarkdown,
} from "@/lib/actions/collections";
import { downloadFile } from "@/lib/clipboard";
import { slugify } from "@/lib/utils";
import type { Collection } from "@/db/schema";

export type ItemPick = { id: string; title: string };

export function CollectionToolbar({
  collection,
  prompts,
  workflows,
  templates,
  notes,
}: {
  collection: Collection;
  prompts: ItemPick[];
  workflows: ItemPick[];
  templates: ItemPick[];
  notes: ItemPick[];
}) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [type, setType] = useState("prompt");
  const [itemId, setItemId] = useState("");
  const [pending, startTransition] = useTransition();

  const lists: Record<string, ItemPick[]> = { prompt: prompts, workflow: workflows, template: templates, note: notes };
  const itemOptions = (lists[type] ?? []).map((i) => ({ value: i.id, label: i.title, accent: "violet" as const }));

  function addItem() {
    if (!itemId) {
      toast.error("Pick an item");
      return;
    }
    startTransition(async () => {
      const res = await addCollectionItem({ collectionId: collection.id, itemType: type as never, itemId });
      if (res.ok) {
        toast.success("Added to collection");
        setItemId("");
        setAddOpen(false);
      } else toast.error(res.error);
    });
  }

  function exportMarkdown() {
    startTransition(async () => {
      const res = await exportCollectionMarkdown(collection.id);
      if (res.ok) {
        downloadFile(`${slugify(res.data.name)}-pack.md`, res.data.markdown, "text/markdown");
        toast.success("Exported markdown pack");
      } else toast.error(res.error);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" onClick={() => setAddOpen(true)}>
        <Plus className="size-4" /> Add item
      </Button>
      <Button variant="outline" size="sm" onClick={exportMarkdown} disabled={pending}>
        <Download className="size-4" /> Export pack
      </Button>
      <CollectionDialog
        collection={collection}
        trigger={<Button variant="outline" size="icon-sm" aria-label="Edit collection"><Pencil className="size-4" /></Button>}
      />
      <Button variant="ghost" size="icon-sm" className="text-muted-foreground" onClick={() => setDeleteOpen(true)} aria-label="Delete collection">
        <Trash2 className="size-4" />
      </Button>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add to collection</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>Type</FieldLabel>
              <OptionSelect value={type} onChange={(v) => { setType(v); setItemId(""); }} options={COLLECTION_ITEM_TYPES} />
            </Field>
            <Field>
              <FieldLabel>Item</FieldLabel>
              <OptionSelect value={itemId} onChange={setItemId} options={itemOptions} placeholder="Select an item" />
            </Field>
          </FieldGroup>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={addItem} disabled={pending}>Add</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this collection?</AlertDialogTitle>
            <AlertDialogDescription>The items themselves are not deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                startTransition(async () => {
                  const res = await deleteCollection(collection.id);
                  if (res.ok) {
                    toast.success("Collection deleted");
                    router.push("/collections");
                  } else toast.error(res.error);
                });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

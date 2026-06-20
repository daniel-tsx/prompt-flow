"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, CopyPlus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  deleteWorkflow,
  duplicateWorkflow,
  setWorkflowStatus,
} from "@/lib/actions/workflows";

export function WorkflowActions({
  id,
  slug,
  redirectOnDelete,
}: {
  id: string;
  slug: string;
  redirectOnDelete?: string;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Workflow actions" />}>
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push(`/workflows/${slug}/edit`)}>
              <Pencil /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                startTransition(async () => {
                  const res = await duplicateWorkflow(id);
                  if (res.ok) {
                    toast.success("Workflow duplicated");
                    router.push(`/workflows/${res.data.slug}`);
                  } else toast.error(res.error);
                })
              }
            >
              <CopyPlus /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                startTransition(async () => {
                  const res = await setWorkflowStatus(id, "archived");
                  toast[res.ok ? "success" : "error"](res.ok ? "Archived" : res.error);
                })
              }
            >
              <Archive /> Archive
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this workflow?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the workflow and all its steps. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                startTransition(async () => {
                  const res = await deleteWorkflow(id);
                  if (res.ok) {
                    toast.success("Workflow deleted");
                    setConfirmOpen(false);
                    if (redirectOnDelete) router.push(redirectOnDelete);
                  } else toast.error(res.error);
                });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  Copy,
  CopyPlus,
  FileStack,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
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
import { copyToClipboard } from "@/lib/clipboard";
import {
  archivePrompt,
  convertPromptToTemplate,
  deletePrompt,
  duplicatePrompt,
} from "@/lib/actions/prompts";

export function PromptActions({
  id,
  slug,
  promptText,
  redirectOnDelete,
}: {
  id: string;
  slug: string;
  promptText: string;
  redirectOnDelete?: string;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  async function copy() {
    const ok = await copyToClipboard(promptText);
    toast[ok ? "success" : "error"](ok ? "Prompt copied" : "Couldn't copy");
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Prompt actions" />
          }
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={copy}>
              <Copy /> Copy prompt
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/prompts/${slug}/edit`)}>
              <Pencil /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                startTransition(async () => {
                  const res = await duplicatePrompt(id);
                  if (res.ok) {
                    toast.success("Prompt duplicated");
                    router.push(`/prompts/${res.data.slug}`);
                  } else toast.error(res.error);
                })
              }
            >
              <CopyPlus /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                startTransition(async () => {
                  const res = await convertPromptToTemplate(id);
                  toast[res.ok ? "success" : "error"](
                    res.ok ? "Saved as template" : res.error,
                  );
                })
              }
            >
              <FileStack /> Save as template
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() =>
                startTransition(async () => {
                  const res = await archivePrompt(id);
                  toast[res.ok ? "success" : "error"](
                    res.ok ? "Prompt archived" : res.error,
                  );
                })
              }
            >
              <Archive /> Archive
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this prompt?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the prompt and all its versions and runs. This
              can&apos;t be undone.
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
                  const res = await deletePrompt(id);
                  if (res.ok) {
                    toast.success("Prompt deleted");
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

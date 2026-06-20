"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createNote } from "@/lib/actions/notes";

export function LinkedNoteComposer({
  relatedPromptId,
  relatedWorkflowId,
  relatedProjectId,
}: {
  relatedPromptId?: string;
  relatedWorkflowId?: string;
  relatedProjectId?: string;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!title.trim()) {
      toast.error("Add a title");
      return;
    }
    startTransition(async () => {
      const res = await createNote({
        title: title.trim(),
        body: body || null,
        noteType: "technical-note",
        status: "active",
        priority: "medium",
        relatedPromptId: relatedPromptId ?? null,
        relatedWorkflowId: relatedWorkflowId ?? null,
        relatedProjectId: relatedProjectId ?? null,
        pinned: false,
        tags: [],
      });
      if (res.ok) {
        toast.success("Note added");
        setTitle("");
        setBody("");
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-3">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a note…"
      />
      {title && (
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Details (optional, markdown)"
          className="min-h-16 text-sm"
        />
      )}
      <div className="flex justify-end">
        <Button size="sm" onClick={submit} disabled={pending}>
          <Plus className="size-3.5" /> Add note
        </Button>
      </div>
    </div>
  );
}

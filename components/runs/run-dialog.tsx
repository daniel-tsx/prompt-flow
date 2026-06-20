"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RunForm } from "@/components/runs/run-form";
import type { PickerProject } from "@/types";

export function RunDialog({
  trigger,
  defaultPromptId,
  lockPrompt,
  prompts,
  projects,
  versions,
  defaultTool,
}: {
  trigger: React.ReactElement;
  defaultPromptId?: string;
  lockPrompt?: boolean;
  prompts: { id: string; title: string }[];
  projects: PickerProject[];
  versions?: { id: string; versionNumber: number; title: string }[];
  defaultTool?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[86vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Record a prompt run</DialogTitle>
          <DialogDescription>
            Log how a real task went so reliability scores stay honest.
          </DialogDescription>
        </DialogHeader>
        <RunForm
          defaultPromptId={defaultPromptId}
          lockPrompt={lockPrompt}
          prompts={prompts}
          projects={projects}
          versions={versions}
          defaultTool={defaultTool}
          onDone={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

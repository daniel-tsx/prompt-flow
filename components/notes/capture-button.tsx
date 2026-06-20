"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCommands } from "@/components/layout/command-provider";

export function CaptureButton({
  type = "quick-note",
  label = "Capture",
}: {
  type?: string;
  label?: string;
}) {
  const { openQuickCapture } = useCommands();
  return (
    <Button onClick={() => openQuickCapture(type)}>
      <Plus className="size-4" /> {label}
    </Button>
  );
}

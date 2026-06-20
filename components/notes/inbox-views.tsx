"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const VIEWS = [
  { key: "all", label: "All" },
  { key: "tasks", label: "Tasks" },
  { key: "ideas", label: "Ideas" },
  { key: "prompt-ideas", label: "Prompt ideas" },
  { key: "workflow-ideas", label: "Workflow ideas" },
  { key: "technical", label: "Technical" },
  { key: "pinned", label: "Pinned" },
  { key: "done", label: "Done" },
  { key: "archived", label: "Archived" },
];

export function InboxViews() {
  const params = useSearchParams();
  const active = params.get("view") ?? "all";

  return (
    <div className="mb-4 flex flex-wrap gap-1.5 overflow-x-auto">
      {VIEWS.map((v) => (
        <Link
          key={v.key}
          href={v.key === "all" ? "/inbox" : `/inbox?view=${v.key}`}
          className={cn(
            "rounded-full border px-3 py-1 text-sm transition-colors",
            active === v.key
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:bg-muted/50",
          )}
        >
          {v.label}
        </Link>
      ))}
    </div>
  );
}

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

export function InboxViews({ counts }: { counts?: Record<string, number> }) {
  const params = useSearchParams();
  const active = params.get("view") ?? "all";

  return (
    <div className="mb-4 flex flex-wrap gap-1.5 overflow-x-auto">
      {VIEWS.map((v) => {
        const isActive = active === v.key;
        const count = counts?.[v.key];
        return (
          <Link
            key={v.key}
            href={v.key === "all" ? "/inbox" : `/inbox?view=${v.key}`}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
              isActive
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted/50",
            )}
          >
            {v.label}
            {count != null && count > 0 && (
              <span
                className={cn(
                  "min-w-4 rounded-full px-1 text-center text-[0.65rem] font-medium tabular-nums",
                  isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
                )}
              >
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

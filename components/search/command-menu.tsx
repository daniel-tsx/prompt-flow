"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  Boxes,
  Copy,
  FileStack,
  FolderKanban,
  Inbox,
  ListChecks,
  Plus,
  Settings,
  Sparkles,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { ALL_NAV_ITEMS } from "@/components/layout/nav-config";
import { searchEverything } from "@/lib/actions/search";
import type { SearchResult } from "@/db/queries/search";
import { copyToClipboard } from "@/lib/clipboard";
import type { RecentPrompt } from "@/types";

export function CommandMenu({
  open,
  onOpenChange,
  onCapture,
  recentPrompts,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (type?: string) => void;
  recentPrompts: RecentPrompt[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [, startTransition] = useTransition();
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    debounce.current = setTimeout(() => {
      startTransition(async () => {
        setResults(await searchEverything(query));
      });
    }, 180);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [query]);

  function run(action: () => void) {
    onOpenChange(false);
    action();
  }

  const go = (href: string) => run(() => router.push(href));

  const q = query.trim().toLowerCase();
  const matches = (label: string) => !q || label.toLowerCase().includes(q);
  const navMatches = ALL_NAV_ITEMS.filter((n) => matches(n.label));

  async function copyRecent(p: RecentPrompt) {
    const ok = await copyToClipboard(p.promptText);
    onOpenChange(false);
    toast[ok ? "success" : "error"](
      ok ? `Copied "${p.title}"` : "Couldn't copy to clipboard",
    );
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} className="sm:max-w-2xl">
      <Command shouldFilter={false}>
        <CommandList className="max-h-[60vh]">
          <CommandEmpty>No results for “{query}”.</CommandEmpty>

          {q.length < 2 && (
            <CommandGroup heading="Create">
              <CommandItem value="new-prompt" onSelect={() => go("/prompts/new")}>
                <Sparkles /> New prompt
                <CommandShortcut>⌘⇧P</CommandShortcut>
              </CommandItem>
              <CommandItem value="new-note" onSelect={() => run(() => onCapture("quick-note"))}>
                <Plus /> New note
                <CommandShortcut>⌘⇧N</CommandShortcut>
              </CommandItem>
              <CommandItem value="new-task" onSelect={() => run(() => onCapture("task"))}>
                <ListChecks /> New task
                <CommandShortcut>⌘⇧T</CommandShortcut>
              </CommandItem>
              <CommandItem value="new-workflow" onSelect={() => go("/workflows/new")}>
                <Workflow /> New workflow
              </CommandItem>
              <CommandItem value="new-template" onSelect={() => go("/templates/new")}>
                <FileStack /> New template
              </CommandItem>
              <CommandItem value="new-run" onSelect={() => go("/runs/new")}>
                <Activity /> Log a prompt run
              </CommandItem>
            </CommandGroup>
          )}

          {navMatches.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Go to">
                {navMatches.map((n) => (
                  <CommandItem key={n.href} value={`go-${n.href}`} onSelect={() => go(n.href)}>
                    <n.icon /> {n.label}
                  </CommandItem>
                ))}
                <CommandItem value="go-inbox" onSelect={() => go("/inbox")}>
                  <Inbox /> Open inbox
                </CommandItem>
                <CommandItem value="go-fav" onSelect={() => go("/prompts?favorite=1")}>
                  <Sparkles /> Favorite prompts
                </CommandItem>
                <CommandItem value="go-today" onSelect={() => go("/tasks")}>
                  <ListChecks /> Tasks due today
                </CommandItem>
                <CommandItem value="go-settings" onSelect={() => go("/settings")}>
                  <Settings /> Settings &amp; data
                </CommandItem>
                <CommandItem value="go-collections" onSelect={() => go("/collections")}>
                  <Boxes /> Collections
                </CommandItem>
                <CommandItem value="go-projects" onSelect={() => go("/projects")}>
                  <FolderKanban /> Projects
                </CommandItem>
                <CommandItem value="go-reports" onSelect={() => go("/reports")}>
                  <BarChart3 /> Reports
                </CommandItem>
              </CommandGroup>
            </>
          )}

          {results.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Search results">
                {results.map((r) => (
                  <CommandItem key={`${r.type}-${r.id}`} value={`res-${r.id}`} onSelect={() => go(r.href)}>
                    <span className="truncate">{r.title}</span>
                    <CommandShortcut className="capitalize">
                      {r.type.replace("-", " ")}
                    </CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {q.length < 2 && recentPrompts.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Copy recent prompt">
                {recentPrompts.map((p) => (
                  <CommandItem key={p.id} value={`copy-${p.id}`} onSelect={() => copyRecent(p)}>
                    <Copy /> <span className="truncate">{p.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

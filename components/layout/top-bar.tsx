"use client";

import { Plus, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCommands } from "@/components/layout/command-provider";

export function TopBar({ title }: { title?: string }) {
  const { openCommandMenu, openQuickCapture } = useCommands();

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger className="text-muted-foreground" />
      <Separator orientation="vertical" className="mr-1 h-5" />
      {title && (
        <h1 className="hidden text-sm font-medium text-muted-foreground sm:block">{title}</h1>
      )}

      <button
        onClick={openCommandMenu}
        className="ml-auto flex h-9 w-full max-w-xs items-center gap-2 rounded-lg border bg-input/30 px-3 text-sm text-muted-foreground transition-colors hover:bg-input/50"
      >
        <Search className="size-4" />
        <span>Search everything…</span>
        <kbd className="ml-auto rounded border bg-muted px-1.5 text-[0.65rem] font-medium">⌘K</kbd>
      </button>

      <Button onClick={() => openQuickCapture()} size="sm" className="gap-1.5">
        <Plus className="size-4" />
        <span className="hidden sm:inline">Capture</span>
      </Button>
      <ThemeToggle />
    </header>
  );
}

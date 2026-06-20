"use client";

import Link from "next/link";
import { Eye, Lock, Plus, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCommands } from "@/components/layout/command-provider";
import { lockAccount } from "@/lib/actions/auth";

export function TopBar({
  title,
  account,
}: {
  title?: string;
  account: "owner" | "demo";
}) {
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

      {account === "demo" ? (
        <Button render={<Link href="/unlock" />} variant="outline" size="sm" className="gap-1.5">
          <Eye className="size-3.5 text-amber-400" />
          <span className="hidden sm:inline">Demo · read-only</span>
          <span className="sm:hidden">Demo</span>
        </Button>
      ) : (
        <>
          <Button onClick={() => openQuickCapture()} size="sm" className="gap-1.5">
            <Plus className="size-4" />
            <span className="hidden sm:inline">Capture</span>
          </Button>
          <form action={lockAccount}>
            <Button type="submit" variant="ghost" size="icon" aria-label="Lock library">
              <Lock className="size-4" />
            </Button>
          </form>
        </>
      )}
      <ThemeToggle />
    </header>
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, Search, Star, Table2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { OptionSelect } from "@/components/forms/option-select";
import {
  PROMPT_CATEGORIES,
  PROMPT_INTENTS,
  PROMPT_STATUSES,
  TARGET_TOOLS,
} from "@/lib/constants";
import type { PickerProject } from "@/types";
import { useState } from "react";

export function PromptFilters({
  projects,
  view,
}: {
  projects: PickerProject[];
  view: "cards" | "table";
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("search") ?? "");

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/prompts?${next.toString()}`);
  }

  const favorite = params.get("favorite") === "1";
  const hasFilters = ["search", "category", "intent", "targetTool", "status", "project", "favorite"].some(
    (k) => params.get(k),
  );

  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <form
          className="relative min-w-56 flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            setParam("search", search || null);
          }}
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, text, notes…"
            className="pl-9"
          />
        </form>

        <Toggle
          pressed={favorite}
          onPressedChange={(p) => setParam("favorite", p ? "1" : null)}
          variant="outline"
          aria-label="Favorites only"
        >
          <Star className={favorite ? "size-4 fill-amber-400 text-amber-400" : "size-4"} />
        </Toggle>

        <div className="ml-auto flex items-center gap-1 rounded-lg border p-0.5">
          <Button
            variant={view === "cards" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setParam("view", "cards")}
            aria-label="Card view"
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            variant={view === "table" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setParam("view", "table")}
            aria-label="Table view"
          >
            <Table2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="w-40">
          <OptionSelect
            value={params.get("category") ?? undefined}
            onChange={(v) => setParam("category", v || null)}
            options={PROMPT_CATEGORIES}
            placeholder="Category"
          />
        </div>
        <div className="w-40">
          <OptionSelect
            value={params.get("intent") ?? undefined}
            onChange={(v) => setParam("intent", v || null)}
            options={PROMPT_INTENTS}
            placeholder="Intent"
          />
        </div>
        <div className="w-40">
          <OptionSelect
            value={params.get("targetTool") ?? undefined}
            onChange={(v) => setParam("targetTool", v || null)}
            options={TARGET_TOOLS}
            placeholder="Tool"
          />
        </div>
        <div className="w-40">
          <OptionSelect
            value={params.get("status") ?? undefined}
            onChange={(v) => setParam("status", v || null)}
            options={PROMPT_STATUSES}
            placeholder="Status"
          />
        </div>
        <div className="w-44">
          <OptionSelect
            value={params.get("project") ?? undefined}
            onChange={(v) => setParam("project", v || null)}
            options={projects.map((p) => ({ value: p.id, label: p.name, accent: "violet" as const }))}
            placeholder="Project"
          />
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={() => router.push("/prompts")}>
            <X className="size-3.5" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}

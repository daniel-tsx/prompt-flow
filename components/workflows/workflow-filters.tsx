"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Star, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { OptionSelect } from "@/components/forms/option-select";
import { WORKFLOW_STATUSES, WORKFLOW_TYPES } from "@/lib/constants";
import type { PickerProject } from "@/types";

export function WorkflowFilters({ projects }: { projects: PickerProject[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("search") ?? "");

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/workflows?${next.toString()}`);
  }

  const favorite = params.get("favorite") === "1";
  const hasFilters = ["search", "type", "status", "project", "favorite"].some((k) => params.get(k));

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <form
        className="relative min-w-56 flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          setParam("search", search || null);
        }}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search workflows…" className="pl-9" />
      </form>
      <Toggle pressed={favorite} onPressedChange={(p) => setParam("favorite", p ? "1" : null)} variant="outline" aria-label="Favorites only">
        <Star className={favorite ? "size-4 fill-amber-400 text-amber-400" : "size-4"} />
      </Toggle>
      <div className="w-44">
        <OptionSelect value={params.get("type") ?? undefined} onChange={(v) => setParam("type", v || null)} options={WORKFLOW_TYPES} placeholder="Type" />
      </div>
      <div className="w-40">
        <OptionSelect value={params.get("status") ?? undefined} onChange={(v) => setParam("status", v || null)} options={WORKFLOW_STATUSES} placeholder="Status" />
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
        <Button variant="ghost" size="sm" onClick={() => router.push("/workflows")}>
          <X className="size-3.5" /> Clear
        </Button>
      )}
    </div>
  );
}

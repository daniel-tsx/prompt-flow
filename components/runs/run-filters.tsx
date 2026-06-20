"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OptionSelect } from "@/components/forms/option-select";
import { RUN_RESULTS, TARGET_TOOLS } from "@/lib/constants";
import type { PickerProject } from "@/types";

export function RunFilters({ projects }: { projects: PickerProject[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("search") ?? "");

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/runs?${next.toString()}`);
  }

  const hasFilters = ["search", "tool", "result", "project"].some((k) => params.get(k));

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
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search runs…" className="pl-9" />
      </form>
      <div className="w-40">
        <OptionSelect value={params.get("tool") ?? undefined} onChange={(v) => setParam("tool", v || null)} options={TARGET_TOOLS} placeholder="Tool" />
      </div>
      <div className="w-44">
        <OptionSelect value={params.get("result") ?? undefined} onChange={(v) => setParam("result", v || null)} options={RUN_RESULTS} placeholder="Result" />
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
        <Button variant="ghost" size="sm" onClick={() => router.push("/runs")}>
          <X className="size-3.5" /> Clear
        </Button>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OptionSelect } from "@/components/forms/option-select";
import { TEMPLATE_TYPES } from "@/lib/constants";

export function TemplateFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("search") ?? "");

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/templates?${next.toString()}`);
  }

  const hasFilters = params.get("search") || params.get("type");

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
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search templates…" className="pl-9" />
      </form>
      <div className="w-48">
        <OptionSelect value={params.get("type") ?? undefined} onChange={(v) => setParam("type", v || null)} options={TEMPLATE_TYPES} placeholder="Type" />
      </div>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => router.push("/templates")}>
          <X className="size-3.5" /> Clear
        </Button>
      )}
    </div>
  );
}

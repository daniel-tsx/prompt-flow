"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { Rows2, Rows4 } from "lucide-react";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { SortHeader, type SortState } from "@/components/shared/sort-header";
import { OptionSelect } from "@/components/forms/option-select";
import { OptionBadge } from "@/components/shared/option-badge";
import { ScoreInline } from "@/components/shared/score-badge";
import { CopyButton } from "@/components/shared/copy-button";
import { FavoriteToggle } from "@/components/prompts/favorite-toggle";
import { PromptActions } from "@/components/prompts/prompt-actions";
import {
  PROMPT_CATEGORIES,
  PROMPT_STATUSES,
  promptCategoryMap,
  promptStatusMap,
  targetToolMap,
  type Option,
} from "@/lib/constants";
import { cn, relativeTime } from "@/lib/utils";
import type { PromptListItem } from "@/db/queries/prompts";

type SortKey = "title" | "status" | "reliability" | "runs" | "updated";
type GroupKey = "none" | "status" | "category" | "project";

const GROUP_OPTIONS: Option[] = [
  { value: "none", label: "No grouping", accent: "slate" },
  { value: "status", label: "Group by status", accent: "violet" },
  { value: "category", label: "Group by category", accent: "blue" },
  { value: "project", label: "Group by project", accent: "teal" },
];

const STATUS_ORDER = new Map(PROMPT_STATUSES.map((o, i) => [o.value, i]));
const CATEGORY_ORDER = new Map(PROMPT_CATEGORIES.map((o, i) => [o.value, i]));

function compare(a: PromptListItem, b: PromptListItem, key: SortKey): number {
  switch (key) {
    case "title":
      return a.title.localeCompare(b.title);
    case "status":
      return (STATUS_ORDER.get(a.status) ?? 99) - (STATUS_ORDER.get(b.status) ?? 99);
    case "reliability":
      return (a.reliability ?? -1) - (b.reliability ?? -1);
    case "runs":
      return a.runCount - b.runCount;
    case "updated":
      return a.updatedAt.getTime() - b.updatedAt.getTime();
  }
}

/** Bucket prompts into ordered groups for the chosen grouping. */
function groupRows(rows: PromptListItem[], groupBy: GroupKey) {
  const buckets = new Map<string, { option: Option; rows: PromptListItem[] }>();
  for (const p of rows) {
    let key: string;
    let option: Option;
    if (groupBy === "status") {
      key = p.status;
      option = promptStatusMap[p.status] ?? { value: key, label: key, accent: "slate" };
    } else if (groupBy === "category") {
      key = p.category;
      option = promptCategoryMap[p.category] ?? { value: key, label: key, accent: "slate" };
    } else {
      key = p.projectName ?? "—";
      option = { value: key, label: p.projectName ?? "No project", accent: "slate" };
    }
    const bucket = buckets.get(key) ?? { option, rows: [] };
    bucket.rows.push(p);
    buckets.set(key, bucket);
  }

  const order = (k: string) =>
    groupBy === "status"
      ? (STATUS_ORDER.get(k) ?? 99)
      : groupBy === "category"
        ? (CATEGORY_ORDER.get(k) ?? 99)
        : 0;

  return [...buckets.entries()].sort(([ka, va], [kb, vb]) =>
    groupBy === "project" ? va.option.label.localeCompare(vb.option.label) : order(ka) - order(kb),
  );
}

export function PromptTable({ prompts }: { prompts: PromptListItem[] }) {
  const [sort, setSort] = useState<SortState<SortKey>>({ key: "updated", dir: "desc" });
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [groupBy, setGroupBy] = useState<GroupKey>("none");

  const sorted = useMemo(() => {
    const s = [...prompts].sort((a, b) => compare(a, b, sort.key));
    return sort.dir === "desc" ? s.reverse() : s;
  }, [prompts, sort]);

  const groups = useMemo(
    () => (groupBy === "none" ? null : groupRows(sorted, groupBy)),
    [sorted, groupBy],
  );

  const cellPad = density === "compact" ? "py-1" : "py-2";

  function toggleSort(key: SortKey) {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "title" ? "asc" : "desc" },
    );
  }

  function renderRow(p: PromptListItem) {
    return (
      <TableRow key={p.id} className="group">
        <TableCell className={cellPad}>
          <FavoriteToggle id={p.id} favorite={p.favorite} />
        </TableCell>
        <TableCell className={cn("max-w-xs", cellPad)}>
          <Link href={`/prompts/${p.slug}`} className="font-medium hover:text-primary">
            <span className="block truncate">{p.title}</span>
          </Link>
          {p.projectName && groupBy !== "project" && (
            <span className="text-xs text-muted-foreground">{p.projectName}</span>
          )}
        </TableCell>
        <TableCell className={cn("hidden md:table-cell", cellPad)}>
          <OptionBadge option={promptCategoryMap[p.category]} />
        </TableCell>
        <TableCell className={cn("hidden lg:table-cell", cellPad)}>
          <OptionBadge option={targetToolMap[p.targetTool]} />
        </TableCell>
        <TableCell className={cellPad}>
          <OptionBadge option={promptStatusMap[p.status]} withIcon={false} />
        </TableCell>
        <TableCell className={cn("text-right", cellPad)}>
          <ScoreInline score={p.reliability} />
        </TableCell>
        <TableCell className={cn("hidden text-right tabular-nums text-muted-foreground sm:table-cell", cellPad)}>
          {p.runCount}
        </TableCell>
        <TableCell className={cn("hidden text-right text-xs text-muted-foreground lg:table-cell", cellPad)}>
          {relativeTime(p.updatedAt)}
        </TableCell>
        <TableCell className={cellPad}>
          <div className="flex items-center justify-end gap-0.5">
            <CopyButton text={p.promptText} variant="ghost" size="sm" iconOnly />
            <PromptActions id={p.id} slug={p.slug} promptText={p.promptText} />
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {prompts.length} {prompts.length === 1 ? "prompt" : "prompts"}
        </span>
        <div className="flex items-center gap-2">
          <div className="w-44">
            <OptionSelect
              value={groupBy}
              onChange={(v) => setGroupBy((v || "none") as GroupKey)}
              options={GROUP_OPTIONS}
              className="h-8"
            />
          </div>
          <div className="flex items-center rounded-lg border p-0.5">
            <Button
              variant={density === "comfortable" ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => setDensity("comfortable")}
              aria-label="Comfortable rows"
              aria-pressed={density === "comfortable"}
            >
              <Rows2 className="size-4" />
            </Button>
            <Button
              variant={density === "compact" ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => setDensity("compact")}
              aria-label="Compact rows"
              aria-pressed={density === "compact"}
            >
              <Rows4 className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-h-[72vh] overflow-auto rounded-lg border bg-card/30">
        <table className="w-full caption-bottom text-sm">
          <TableHeader className="sticky top-0 z-10 bg-card [&_tr]:border-b">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-8" />
              <SortHeader label="Title" sortKey="title" sort={sort} onSort={toggleSort} />
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden lg:table-cell">Tool</TableHead>
              <SortHeader label="Status" sortKey="status" sort={sort} onSort={toggleSort} />
              <SortHeader label="Rely" sortKey="reliability" sort={sort} onSort={toggleSort} className="text-right" align="right" />
              <SortHeader label="Runs" sortKey="runs" sort={sort} onSort={toggleSort} className="hidden text-right sm:table-cell" align="right" />
              <SortHeader label="Updated" sortKey="updated" sort={sort} onSort={toggleSort} className="hidden text-right lg:table-cell" align="right" />
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups
              ? groups.map(([key, g]) => (
                  <Fragment key={key}>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableCell colSpan={9} className="py-1.5">
                        <div className="flex items-center gap-2">
                          <OptionBadge option={g.option} />
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {g.rows.length}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                    {g.rows.map(renderRow)}
                  </Fragment>
                ))
              : sorted.map(renderRow)}
          </TableBody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SortHeader, type SortState } from "@/components/shared/sort-header";
import { OptionBadge } from "@/components/shared/option-badge";
import {
  accentHex,
  accentText,
  promptCategoryMap,
  targetToolMap,
} from "@/lib/constants";
import { scoreTier, TIER_ACCENT } from "@/lib/scoring";
import { cn } from "@/lib/utils";

type Row = { category: string; tool: string; score: number; runs: number };
type SortKey = "category" | "tool" | "score" | "runs";

export function ToolPerformanceTable({ data }: { data: Row[] }) {
  const [sort, setSort] = useState<SortState<SortKey>>({
    key: "score",
    dir: "desc",
  });

  const sorted = useMemo(() => {
    const catLabel = (c: string) => promptCategoryMap[c]?.label ?? c;
    const toolLabel = (t: string) => targetToolMap[t]?.label ?? t;
    const rows = [...data].sort((a, b) => {
      switch (sort.key) {
        case "category":
          return catLabel(a.category).localeCompare(catLabel(b.category));
        case "tool":
          return toolLabel(a.tool).localeCompare(toolLabel(b.tool));
        case "score":
          return a.score - b.score;
        case "runs":
          return a.runs - b.runs;
      }
    });
    return sort.dir === "desc" ? rows.reverse() : rows;
  }, [data, sort]);

  function toggleSort(key: SortKey) {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "category" || key === "tool" ? "asc" : "desc" },
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <SortHeader label="Category" sortKey="category" sort={sort} onSort={toggleSort} />
          <SortHeader label="Best tool" sortKey="tool" sort={sort} onSort={toggleSort} />
          <SortHeader label="Score" sortKey="score" sort={sort} onSort={toggleSort} className="text-right" align="right" />
          <SortHeader label="Runs" sortKey="runs" sort={sort} onSort={toggleSort} className="text-right" align="right" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((t) => {
          const accent = TIER_ACCENT[scoreTier(t.score)];
          return (
            <TableRow key={`${t.category}-${t.tool}`}>
              <TableCell>
                <OptionBadge option={promptCategoryMap[t.category]} />
              </TableCell>
              <TableCell>
                <OptionBadge option={targetToolMap[t.tool]} />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-muted sm:block">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${t.score}%`, backgroundColor: accentHex[accent] }}
                    />
                  </span>
                  <span className={cn("w-7 text-right font-semibold tabular-nums", accentText[accent])}>
                    {t.score}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                {t.runs}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

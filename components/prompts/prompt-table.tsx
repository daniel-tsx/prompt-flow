import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OptionBadge } from "@/components/shared/option-badge";
import { ScoreInline } from "@/components/shared/score-badge";
import { CopyButton } from "@/components/shared/copy-button";
import { FavoriteToggle } from "@/components/prompts/favorite-toggle";
import { PromptActions } from "@/components/prompts/prompt-actions";
import {
  promptCategoryMap,
  promptStatusMap,
  targetToolMap,
} from "@/lib/constants";
import { relativeTime } from "@/lib/utils";
import type { PromptListItem } from "@/db/queries/prompts";

export function PromptTable({ prompts }: { prompts: PromptListItem[] }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-8"></TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="hidden md:table-cell">Category</TableHead>
            <TableHead className="hidden lg:table-cell">Tool</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Rely</TableHead>
            <TableHead className="hidden text-right sm:table-cell">Runs</TableHead>
            <TableHead className="hidden text-right lg:table-cell">Updated</TableHead>
            <TableHead className="w-20"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prompts.map((p) => (
            <TableRow key={p.id} className="group">
              <TableCell>
                <FavoriteToggle id={p.id} favorite={p.favorite} />
              </TableCell>
              <TableCell className="max-w-xs">
                <Link href={`/prompts/${p.slug}`} className="font-medium hover:text-primary">
                  <span className="block truncate">{p.title}</span>
                </Link>
                {p.projectName && (
                  <span className="text-xs text-muted-foreground">{p.projectName}</span>
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <OptionBadge option={promptCategoryMap[p.category]} />
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <OptionBadge option={targetToolMap[p.targetTool]} />
              </TableCell>
              <TableCell>
                <OptionBadge option={promptStatusMap[p.status]} withIcon={false} />
              </TableCell>
              <TableCell className="text-right">
                <ScoreInline score={p.reliability} />
              </TableCell>
              <TableCell className="hidden text-right tabular-nums text-muted-foreground sm:table-cell">
                {p.runCount}
              </TableCell>
              <TableCell className="hidden text-right text-xs text-muted-foreground lg:table-cell">
                {relativeTime(p.updatedAt)}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-0.5">
                  <CopyButton text={p.promptText} variant="ghost" size="sm" iconOnly />
                  <PromptActions id={p.id} slug={p.slug} promptText={p.promptText} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

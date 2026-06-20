import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import type { PromptListItem } from "@/db/queries/prompts";
import { plainExcerpt } from "@/lib/utils";

export function PromptCard({ prompt }: { prompt: PromptListItem }) {
  return (
    <Card className="group relative gap-0 overflow-hidden p-4 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/prompts/${prompt.slug}`} className="min-w-0 flex-1">
          <h3 className="truncate font-medium leading-snug transition-colors group-hover:text-primary">
            {prompt.title}
          </h3>
          {prompt.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {prompt.description}
            </p>
          )}
        </Link>
        <div className="flex shrink-0 items-center gap-0.5">
          <FavoriteToggle id={prompt.id} favorite={prompt.favorite} />
          <PromptActions id={prompt.id} slug={prompt.slug} promptText={prompt.promptText} />
        </div>
      </div>

      {prompt.promptText && (
        <Link href={`/prompts/${prompt.slug}`}>
          <p className="mt-3 line-clamp-2 rounded-md border bg-muted/40 p-2.5 font-mono text-xs leading-relaxed text-muted-foreground">
            {plainExcerpt(prompt.promptText, 180)}
          </p>
        </Link>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <OptionBadge option={promptCategoryMap[prompt.category]} />
        <OptionBadge option={targetToolMap[prompt.targetTool]} />
        <OptionBadge option={promptStatusMap[prompt.status]} withIcon={false} />
        {prompt.reusable && (
          <Badge variant="secondary" className="font-normal">
            Reusable
          </Badge>
        )}
        {prompt.healthFlags.length > 0 && prompt.status !== "reliable" && (
          <Badge
            variant="outline"
            className="gap-1 border-amber-500/25 bg-amber-500/10 font-normal text-amber-300"
          >
            <AlertTriangle className="size-3" /> {prompt.healthFlags.length}
          </Badge>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            Reliability <ScoreInline score={prompt.reliability} />
          </span>
          <span>{prompt.runCount} runs</span>
          {prompt.projectName && (
            <span className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: prompt.projectColor ?? "#8b5cf6" }}
              />
              {prompt.projectName}
            </span>
          )}
        </div>
        <CopyButton text={prompt.promptText} variant="ghost" size="sm" iconOnly />
      </div>
    </Card>
  );
}

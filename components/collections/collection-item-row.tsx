"use client";

import Link from "next/link";
import { useTransition } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OptionBadge } from "@/components/shared/option-badge";
import { collectionItemTypeMap } from "@/lib/constants";
import { removeCollectionItem } from "@/lib/actions/collections";
import type { ResolvedCollectionItem } from "@/db/queries/collections";

function hrefFor(item: ResolvedCollectionItem): string | null {
  if (item.itemType === "prompt" && item.slug) return `/prompts/${item.slug}`;
  if (item.itemType === "workflow" && item.slug) return `/workflows/${item.slug}`;
  if (item.itemType === "template") return `/templates/${item.itemId}/edit`;
  if (item.itemType === "note") return `/inbox?focus=${item.itemId}`;
  return null;
}

export function CollectionItemRow({ item }: { item: ResolvedCollectionItem }) {
  const [, startTransition] = useTransition();
  const href = hrefFor(item);

  const inner = (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <OptionBadge option={collectionItemTypeMap[item.itemType]} />
      <span className="min-w-0 truncate font-medium">{item.title}</span>
      {item.subtitle && <span className="hidden text-xs text-muted-foreground sm:inline">{item.subtitle}</span>}
    </div>
  );

  return (
    <Card className="flex-row items-center justify-between gap-2 p-3">
      {href ? (
        <Link href={href} className="flex min-w-0 flex-1 items-center hover:text-primary">
          {inner}
        </Link>
      ) : (
        inner
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground"
        aria-label="Remove from collection"
        onClick={() =>
          startTransition(async () => {
            const res = await removeCollectionItem(item.rowId);
            toast[res.ok ? "success" : "error"](res.ok ? "Removed" : res.error);
          })
        }
      >
        <X className="size-4" />
      </Button>
    </Card>
  );
}

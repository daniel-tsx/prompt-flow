import Link from "next/link";
import { Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { OptionBadge } from "@/components/shared/option-badge";
import { collectionTypeMap } from "@/lib/constants";
import { pluralize } from "@/lib/utils";
import type { CollectionListItem } from "@/db/queries/collections";

export function CollectionCard({ collection }: { collection: CollectionListItem }) {
  return (
    <Link href={`/collections/${collection.id}`}>
      <Card className="group gap-0 p-4 transition-colors hover:border-primary/40">
        <div className="flex items-center gap-2.5">
          <span
            className="flex size-9 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${collection.color}22`, color: collection.color }}
          >
            <Layers className="size-4.5" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-medium transition-colors group-hover:text-primary">{collection.name}</h3>
            <p className="text-xs text-muted-foreground">
              {collection.itemCount} {pluralize(collection.itemCount, "item")}
            </p>
          </div>
        </div>
        {collection.description && (
          <p className="mt-2.5 line-clamp-2 text-sm text-muted-foreground">{collection.description}</p>
        )}
        <div className="mt-3">
          <OptionBadge option={collectionTypeMap[collection.collectionType]} />
        </div>
      </Card>
    </Link>
  );
}

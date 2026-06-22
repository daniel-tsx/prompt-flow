import { Boxes, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatStrip } from "@/components/shared/stat-strip";
import { CollectionCard } from "@/components/collections/collection-card";
import { CollectionDialog } from "@/components/collections/collection-dialog";
import { listCollections } from "@/db/queries/collections";

export const metadata = { title: "Collections" };

export default async function CollectionsPage() {
  const collections = await listCollections();
  const totalItems = collections.reduce((s, c) => s + c.itemCount, 0);
  const largest = collections.reduce((m, c) => Math.max(m, c.itemCount), 0);
  const typeCount = new Set(collections.map((c) => c.collectionType)).size;

  return (
    <PageContainer>
      <PageHeader
        icon={Boxes}
        title="Collections"
        description={`${collections.length} curated packs of prompts, workflows & notes.`}
        actions={
          <CollectionDialog
            trigger={
              <Button>
                <Plus className="size-4" /> New collection
              </Button>
            }
          />
        }
      />

      {collections.length === 0 ? (
        <EmptyState icon={Boxes} title="No collections yet" description="Group related prompts and workflows into a pack.">
          <CollectionDialog
            trigger={
              <Button>
                <Plus className="size-4" /> New collection
              </Button>
            }
          />
        </EmptyState>
      ) : (
        <>
          <StatStrip
            className="mb-4"
            items={[
              { label: "Collections", value: collections.length },
              { label: "Total items", value: totalItems },
              { label: "Largest pack", value: largest },
              { label: "Types", value: typeCount },
            ]}
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((c) => (
              <CollectionCard key={c.id} collection={c} />
            ))}
          </div>
        </>
      )}
    </PageContainer>
  );
}

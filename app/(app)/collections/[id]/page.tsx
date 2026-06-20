import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/shared/page-header";
import { OptionBadge } from "@/components/shared/option-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { CollectionToolbar } from "@/components/collections/collection-toolbar";
import { CollectionItemRow } from "@/components/collections/collection-item-row";
import { getCollectionById } from "@/db/queries/collections";
import { listPromptsForPicker } from "@/db/queries/prompts";
import { listWorkflowsForPicker } from "@/db/queries/workflows";
import { listTemplates } from "@/db/queries/templates";
import { listNotes } from "@/db/queries/notes";
import { collectionTypeMap } from "@/lib/constants";

export const metadata = { title: "Collection" };

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = await getCollectionById(id);
  if (!collection) notFound();

  const [prompts, workflows, templates, notes] = await Promise.all([
    listPromptsForPicker(),
    listWorkflowsForPicker(),
    listTemplates(),
    listNotes({}),
  ]);

  return (
    <PageContainer>
      <Button render={<Link href="/collections" />} variant="ghost" size="sm" className="mb-3">
        <ArrowLeft className="size-4" /> Collections
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <span
              className="flex size-9 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${collection.color}22`, color: collection.color }}
            >
              <Boxes className="size-5" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight">{collection.name}</h1>
          </div>
          {collection.description && (
            <p className="mt-1 text-sm text-muted-foreground">{collection.description}</p>
          )}
          <div className="mt-3">
            <OptionBadge option={collectionTypeMap[collection.collectionType]} />
          </div>
        </div>
        <CollectionToolbar
          collection={{
            id: collection.id,
            account: collection.account,
            name: collection.name,
            description: collection.description,
            icon: collection.icon,
            color: collection.color,
            collectionType: collection.collectionType,
            createdAt: collection.createdAt,
            updatedAt: collection.updatedAt,
          }}
          prompts={prompts.map((p) => ({ id: p.id, title: p.title }))}
          workflows={workflows.map((w) => ({ id: w.id, title: w.title }))}
          templates={templates.map((t) => ({ id: t.id, title: t.name }))}
          notes={notes.map((n) => ({ id: n.id, title: n.title }))}
        />
      </div>

      <div className="mt-5 flex flex-col gap-2">
        {collection.items.length === 0 ? (
          <EmptyState icon={Boxes} title="Empty collection" description="Add prompts, workflows, templates, or notes with “Add item”." />
        ) : (
          collection.items.map((item) => <CollectionItemRow key={item.rowId} item={item} />)
        )}
      </div>
    </PageContainer>
  );
}

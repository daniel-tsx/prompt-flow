import Link from "next/link";
import { FileStack, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TemplateCard } from "@/components/templates/template-card";
import { TemplateFilters } from "@/components/templates/template-filters";
import { listTemplates } from "@/db/queries/templates";

export const metadata = { title: "Templates" };

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function TemplatesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const templates = await listTemplates({ search: sp.search, templateType: sp.type });

  return (
    <PageContainer>
      <PageHeader
        icon={FileStack}
        title="Templates"
        description={`${templates.length} reusable prompt, workflow & note templates.`}
        actions={
          <Button render={<Link href="/templates/new" />}>
            <Plus className="size-4" /> New template
          </Button>
        }
      />

      <TemplateFilters />

      {templates.length === 0 ? (
        <EmptyState icon={FileStack} title="No templates" description="Create a reusable template with variables.">
          <Button render={<Link href="/templates/new" />}>
            <Plus className="size-4" /> New template
          </Button>
        </EmptyState>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PromptCard } from "@/components/prompts/prompt-card";
import { PromptTable } from "@/components/prompts/prompt-table";
import { PromptFilters } from "@/components/prompts/prompt-filters";
import { listPrompts, type PromptFilters as Filters } from "@/db/queries/prompts";
import { listProjectsForPicker } from "@/db/queries/projects";

export const metadata = { title: "Prompt Library" };

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function PromptsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const view = sp.view === "table" ? "table" : "cards";

  const filters: Filters = {
    search: sp.search,
    category: sp.category,
    intent: sp.intent,
    targetTool: sp.targetTool,
    status: sp.status,
    projectId: sp.project,
    favorite: sp.favorite === "1",
  };

  const [prompts, projects] = await Promise.all([
    listPrompts(filters),
    listProjectsForPicker(),
  ]);

  return (
    <PageContainer>
      <PageHeader
        icon={Sparkles}
        title="Prompt Library"
        description={`${prompts.length} prompts in your command library.`}
        actions={
          <Button render={<Link href="/prompts/new" />}>
            <Plus className="size-4" /> New prompt
          </Button>
        }
      />

      <PromptFilters projects={projects} view={view} />

      {prompts.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No prompts match"
          description="Try clearing filters, or create your first prompt."
        >
          <Button render={<Link href="/prompts/new" />}>
            <Plus className="size-4" /> New prompt
          </Button>
        </EmptyState>
      ) : view === "table" ? (
        <PromptTable prompts={prompts} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {prompts.map((p) => (
            <PromptCard key={p.id} prompt={p} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

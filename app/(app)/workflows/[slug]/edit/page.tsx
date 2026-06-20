import { notFound } from "next/navigation";
import { PageContainer } from "@/components/shared/page-header";
import { WorkflowBuilder } from "@/components/workflows/workflow-builder";
import { getWorkflowForEdit } from "@/db/queries/workflows";
import { listProjectsForPicker } from "@/db/queries/projects";
import { listLinkablePrompts } from "@/db/queries/workflows";

export const metadata = { title: "Edit Workflow" };

export default async function EditWorkflowPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [full, projects, prompts] = await Promise.all([
    getWorkflowForEdit(slug),
    listProjectsForPicker(),
    listLinkablePrompts(),
  ]);
  if (!full) notFound();

  return (
    <PageContainer>
      <WorkflowBuilder
        workflow={{
          id: full.id,
          title: full.title,
          description: full.description,
          workflowType: full.workflowType,
          relatedProjectId: full.relatedProjectId,
          status: full.status,
          outcome: full.outcome,
          whenToUse: full.whenToUse,
          whenNotToUse: full.whenNotToUse,
          toolsUsed: full.toolsUsed,
          favorite: full.favorite,
          tags: full.tags,
          notes: full.notes,
          steps: full.steps.map((s) => ({
            title: s.title,
            description: s.description,
            linkedPromptId: s.linkedPromptId,
            instruction: s.instruction,
            expectedOutput: s.expectedOutput,
            checklist: s.checklist,
          })),
        }}
        projects={projects}
        prompts={prompts}
      />
    </PageContainer>
  );
}

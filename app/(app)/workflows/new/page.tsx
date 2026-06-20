import { PageContainer } from "@/components/shared/page-header";
import { WorkflowBuilder } from "@/components/workflows/workflow-builder";
import { listProjectsForPicker } from "@/db/queries/projects";
import { listLinkablePrompts } from "@/db/queries/workflows";

export const metadata = { title: "New Workflow" };

export default async function NewWorkflowPage() {
  const [projects, prompts] = await Promise.all([
    listProjectsForPicker(),
    listLinkablePrompts(),
  ]);
  return (
    <PageContainer>
      <WorkflowBuilder projects={projects} prompts={prompts} />
    </PageContainer>
  );
}

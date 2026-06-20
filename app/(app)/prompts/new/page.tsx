import { PageContainer } from "@/components/shared/page-header";
import { PromptEditor } from "@/components/prompts/prompt-editor";
import { listProjectsForPicker } from "@/db/queries/projects";

export const metadata = { title: "New Prompt" };

export default async function NewPromptPage() {
  const projects = await listProjectsForPicker();
  return (
    <PageContainer>
      <PromptEditor projects={projects} />
    </PageContainer>
  );
}

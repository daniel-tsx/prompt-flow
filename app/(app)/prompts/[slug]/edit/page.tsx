import { notFound } from "next/navigation";
import { PageContainer } from "@/components/shared/page-header";
import { PromptEditor } from "@/components/prompts/prompt-editor";
import { getPromptForEdit } from "@/db/queries/prompts";
import { listProjectsForPicker } from "@/db/queries/projects";

export const metadata = { title: "Edit Prompt" };

export default async function EditPromptPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [prompt, projects] = await Promise.all([
    getPromptForEdit(slug),
    listProjectsForPicker(),
  ]);
  if (!prompt) notFound();

  return (
    <PageContainer>
      <PromptEditor prompt={prompt} projects={projects} />
    </PageContainer>
  );
}

import { notFound } from "next/navigation";
import { PageContainer } from "@/components/shared/page-header";
import { TemplateEditor } from "@/components/templates/template-editor";
import { getTemplateById } from "@/db/queries/templates";

export const metadata = { title: "Edit Template" };

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = await getTemplateById(id);
  if (!template) notFound();

  return (
    <PageContainer>
      <TemplateEditor template={template} />
    </PageContainer>
  );
}

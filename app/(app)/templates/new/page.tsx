import { PageContainer } from "@/components/shared/page-header";
import { TemplateEditor } from "@/components/templates/template-editor";

export const metadata = { title: "New Template" };

export default function NewTemplatePage() {
  return (
    <PageContainer>
      <TemplateEditor />
    </PageContainer>
  );
}

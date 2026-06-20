import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { RunForm } from "@/components/runs/run-form";
import { listPromptsForPicker } from "@/db/queries/prompts";
import { listProjectsForPicker } from "@/db/queries/projects";

export const metadata = { title: "Log Run" };

export default async function NewRunPage() {
  const [prompts, projects] = await Promise.all([
    listPromptsForPicker(),
    listProjectsForPicker(),
  ]);

  return (
    <PageContainer className="max-w-2xl">
      <Button render={<Link href="/runs" />} variant="ghost" size="sm" className="mb-3">
        <ArrowLeft className="size-4" /> Runs
      </Button>
      <PageHeader title="Log a prompt run" description="Record how a real task went." />
      <Card>
        <CardContent className="pt-6">
          <RunForm
            prompts={prompts.map((p) => ({ id: p.id, title: p.title }))}
            projects={projects}
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

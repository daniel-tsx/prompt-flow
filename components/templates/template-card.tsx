"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Pencil,
  Sparkles,
  Trash2,
  Variable,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OptionBadge } from "@/components/shared/option-badge";
import { CopyButton } from "@/components/shared/copy-button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { templateTypeMap } from "@/lib/constants";
import {
  createPromptFromTemplate,
  createWorkflowFromTemplate,
  deleteTemplate,
} from "@/lib/actions/templates";
import type { Template } from "@/db/schema";

export function TemplateCard({ template }: { template: Template }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  return (
    <Card className="gap-0 p-4">
      <CardHeader className="flex-row items-start justify-between gap-2 p-0">
        <div className="min-w-0">
          <h3 className="font-medium leading-snug">{template.name}</h3>
          {template.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{template.description}</p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Template actions" />}>
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push(`/templates/${template.id}/edit`)}>
                <Pencil /> Edit
              </DropdownMenuItem>
              <ConfirmDialog
                title="Delete template?"
                confirmLabel="Delete"
                onConfirm={async () => {
                  const res = await deleteTemplate(template.id);
                  toast[res.ok ? "success" : "error"](res.ok ? "Template deleted" : res.error);
                }}
                trigger={
                  <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                    <Trash2 /> Delete
                  </DropdownMenuItem>
                }
              />
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="mt-3 flex flex-col gap-3 p-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <OptionBadge option={templateTypeMap[template.templateType]} />
          {template.variables.length > 0 && (
            <Badge variant="secondary" className="gap-1 font-normal">
              <Variable className="size-3" /> {template.variables.length} vars
            </Badge>
          )}
        </div>

        <pre className="max-h-28 overflow-auto rounded-md border bg-muted/40 p-2.5 font-mono text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground">
          {template.content || "(empty)"}
        </pre>

        {template.variables.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {template.variables.map((v) => (
              <code key={v.name} className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[0.7rem] text-primary">
                {`{{${v.name}}}`}
              </code>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 border-t pt-3">
          <CopyButton text={template.content} label="Copy" size="sm" variant="outline" />
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              startTransition(async () => {
                const res = await createPromptFromTemplate(template.id);
                if (res.ok) {
                  toast.success("Prompt created");
                  router.push(`/prompts/${res.data.slug}`);
                } else toast.error(res.error);
              })
            }
          >
            <Sparkles className="size-3.5" /> New prompt
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              startTransition(async () => {
                const res = await createWorkflowFromTemplate(template.id);
                if (res.ok) {
                  toast.success("Workflow created");
                  router.push(`/workflows/${res.data.slug}`);
                } else toast.error(res.error);
              })
            }
          >
            <Workflow className="size-3.5" /> New workflow
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

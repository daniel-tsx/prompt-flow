"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Database,
  Download,
  FileJson,
  FileText,
  Sparkles,
  Upload,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { downloadFile } from "@/lib/clipboard";
import {
  exportAllData,
  exportNotesCsv,
  exportPromptsMarkdown,
  exportWorkflowsMarkdown,
  importBackup,
} from "@/lib/actions/data";

export function DataManager() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [pendingImport, setPendingImport] = useState<string | null>(null);

  const stamp = () => new Date().toISOString().slice(0, 10);

  function runExport(
    fn: () => Promise<{ ok: boolean; data?: string; error?: string }>,
    filename: string,
    mime: string,
  ) {
    startTransition(async () => {
      const res = await fn();
      if (res.ok && res.data != null) {
        downloadFile(filename, res.data, mime);
        toast.success("Exported");
      } else {
        toast.error(res.error ?? "Export failed");
      }
    });
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPendingImport(reader.result as string);
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Download className="size-4 text-primary" /> Export
          </CardTitle>
          <CardDescription>Download your library in portable formats.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={pending} onClick={() => runExport(exportAllData, `promptflow-backup-${stamp()}.json`, "application/json")}>
            <FileJson className="size-4" /> Full backup (JSON)
          </Button>
          <Button variant="outline" disabled={pending} onClick={() => runExport(exportPromptsMarkdown, `prompts-${stamp()}.md`, "text/markdown")}>
            <Sparkles className="size-4" /> Prompts (Markdown)
          </Button>
          <Button variant="outline" disabled={pending} onClick={() => runExport(exportWorkflowsMarkdown, `workflows-${stamp()}.md`, "text/markdown")}>
            <Workflow className="size-4" /> Workflows (Markdown)
          </Button>
          <Button variant="outline" disabled={pending} onClick={() => runExport(exportNotesCsv, `notes-${stamp()}.csv`, "text/csv")}>
            <FileText className="size-4" /> Notes &amp; tasks (CSV)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Upload className="size-4 text-primary" /> Import
          </CardTitle>
          <CardDescription>
            Restore from a JSON backup. This <strong>replaces</strong> all current data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onFile} />
          <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={pending}>
            <Database className="size-4" /> Choose backup file…
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={!!pendingImport} onOpenChange={(o) => !o && setPendingImport(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace all data?</AlertDialogTitle>
            <AlertDialogDescription>
              Importing this backup will permanently delete your current library and replace it with
              the file&apos;s contents. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                const json = pendingImport!;
                startTransition(async () => {
                  const res = await importBackup(json);
                  if (res.ok) {
                    toast.success(`Imported ${res.data.prompts} prompts, ${res.data.workflows} workflows, ${res.data.notes} notes`);
                    setPendingImport(null);
                    router.refresh();
                  } else {
                    toast.error(res.error);
                  }
                });
              }}
            >
              Replace &amp; import
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

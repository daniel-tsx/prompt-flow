"use client";

import { AlertTriangle, Database, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const dbMissing = error.message.includes("DATABASE_URL");

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {dbMissing ? (
              <Database className="size-5 text-primary" />
            ) : (
              <AlertTriangle className="size-5 text-amber-400" />
            )}
            {dbMissing ? "Connect a database" : "Something went wrong"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {dbMissing ? (
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <p>PromptFlow needs a PostgreSQL connection to run.</p>
              <ol className="ml-4 list-decimal space-y-1">
                <li>Copy <code className="rounded bg-muted px-1">.env.example</code> to <code className="rounded bg-muted px-1">.env.local</code></li>
                <li>Add your Neon <code className="rounded bg-muted px-1">DATABASE_URL</code></li>
                <li>Run <code className="rounded bg-muted px-1">pnpm db:push &amp;&amp; pnpm db:seed</code></li>
              </ol>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {error.message || "An unexpected error occurred."}
            </p>
          )}
          <Button onClick={reset} variant="outline" className="self-start">
            <RefreshCw className="size-4" /> Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

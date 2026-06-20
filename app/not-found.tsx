import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-mono text-sm text-primary">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        That route doesn&apos;t exist in your library. It may have been moved or never created.
      </p>
      <Button render={<Link href="/dashboard" />}>Back to dashboard</Button>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UnlockForm } from "@/components/auth/unlock-form";
import { BrandLogo } from "@/components/brand-logo";

export const metadata = { title: "Unlock" };
export const dynamic = "force-dynamic";

export default function UnlockPage() {
  return (
    <div className="cockpit-bg flex min-h-screen items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <BrandLogo className="size-14" />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">PromptFlow Library</h1>
            <p className="text-sm text-muted-foreground">Your personal AI command library.</p>
          </div>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-base">Welcome back</CardTitle>
            <CardDescription>Enter your passcode, or take a look around the demo.</CardDescription>
          </CardHeader>
          <CardContent>
            <UnlockForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

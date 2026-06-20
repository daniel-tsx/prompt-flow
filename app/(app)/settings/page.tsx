import { Palette, Settings, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { ThemeSetting } from "@/components/settings/theme-setting";
import { DataManager } from "@/components/settings/data-manager";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <PageContainer className="max-w-3xl">
      <PageHeader icon={Settings} title="Settings & Data" description="Appearance, backups, and what's coming next." />

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className="size-4 text-primary" /> Appearance
            </CardTitle>
            <CardDescription>PromptFlow defaults to a dark cockpit theme.</CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeSetting />
          </CardContent>
        </Card>

        <DataManager />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-primary" /> Roadmap
            </CardTitle>
            <CardDescription>This personal build is architected to grow.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-normal">Planned</Badge>
              BetterAuth — the data layer is structured to add per-user auth without a rewrite.
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-normal">Planned</Badge>
              AI assist — improve prompts, suggest versions, and auto-score runs.
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

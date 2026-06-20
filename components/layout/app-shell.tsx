import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { CommandProvider } from "@/components/layout/command-provider";
import { listProjectsForPicker } from "@/db/queries/projects";
import { listPromptsForPicker } from "@/db/queries/prompts";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const [projects, prompts] = await Promise.all([
    listProjectsForPicker(),
    listPromptsForPicker(),
  ]);

  const recentPrompts = prompts.slice(0, 6).map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category,
    promptText: p.promptText,
  }));

  return (
    <CommandProvider projects={projects} recentPrompts={recentPrompts}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-w-0">
          <TopBar />
          <main className="cockpit-bg flex-1">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </CommandProvider>
  );
}

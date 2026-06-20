import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { CommandProvider } from "@/components/layout/command-provider";
import { listProjectsForPicker } from "@/db/queries/projects";
import { listPromptsForPicker } from "@/db/queries/prompts";

export async function AppShell({
  children,
  account,
}: {
  children: React.ReactNode;
  account: "owner" | "demo";
}) {
  // Keep the shell rendering even if the DB isn't reachable yet, so the page's
  // error boundary can show a friendly "connect a database" screen in context.
  const [projects, prompts] = await Promise.all([
    listProjectsForPicker().catch(() => []),
    listPromptsForPicker().catch(() => []),
  ]);

  const recentPrompts = prompts.slice(0, 6).map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category,
    promptText: p.promptText,
  }));

  return (
    <CommandProvider projects={projects} recentPrompts={recentPrompts} account={account}>
      <SidebarProvider>
        <AppSidebar account={account} />
        <SidebarInset className="min-w-0">
          <TopBar account={account} />
          <main className="cockpit-bg flex-1">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </CommandProvider>
  );
}

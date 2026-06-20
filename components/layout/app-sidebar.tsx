"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Command, Plus, Settings, Zap } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { NAV_GROUPS } from "@/components/layout/nav-config";
import { useCommands } from "@/components/layout/command-provider";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();
  const { openQuickCapture, openCommandMenu } = useCommands();

  const isActive = (href: string, match?: (p: string) => boolean) =>
    match ? match(pathname) : pathname === href;

  return (
    <Sidebar>
      <SidebarHeader className="gap-3">
        <Link href="/dashboard" className="flex items-center gap-2.5 px-2 pt-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/25">
            <Zap className="size-4.5" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">PromptFlow</span>
            <span className="text-[0.7rem] text-muted-foreground">Command Library</span>
          </div>
        </Link>

        <div className="flex flex-col gap-1.5 px-1">
          <Button onClick={() => openQuickCapture()} className="w-full justify-start gap-2" size="sm">
            <Plus className="size-4" />
            Quick capture
          </Button>
          <Button
            onClick={openCommandMenu}
            variant="outline"
            size="sm"
            className="w-full justify-between gap-2 text-muted-foreground"
          >
            <span className="flex items-center gap-2">
              <Command className="size-3.5" />
              Search
            </span>
            <kbd className="rounded border bg-muted px-1.5 text-[0.65rem] font-medium">⌘K</kbd>
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="scrollbar-thin">
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = isActive(item.href, item.match);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton isActive={active} render={<Link href={item.href} />}>
                        <item.icon className={cn(active && "text-primary")} />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname === "/settings"}
              render={<Link href="/settings" />}
            >
              <Settings />
              <span>Settings &amp; Data</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

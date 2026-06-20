import {
  Activity,
  BarChart3,
  Boxes,
  FileStack,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  ListChecks,
  Sparkles,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Match nested routes (e.g. /prompts/[slug]) as active. */
  match?: (pathname: string) => boolean;
};

export type NavGroup = { label: string; items: NavItem[] };

const startsWith = (prefix: string) => (p: string) =>
  p === prefix || p.startsWith(`${prefix}/`);

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Library",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Prompts", href: "/prompts", icon: Sparkles, match: startsWith("/prompts") },
      { label: "Workflows", href: "/workflows", icon: Workflow, match: startsWith("/workflows") },
      { label: "Templates", href: "/templates", icon: FileStack, match: startsWith("/templates") },
      { label: "Collections", href: "/collections", icon: Boxes, match: startsWith("/collections") },
    ],
  },
  {
    label: "Capture",
    items: [
      { label: "Inbox", href: "/inbox", icon: Inbox },
      { label: "Tasks", href: "/tasks", icon: ListChecks },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Runs", href: "/runs", icon: Activity },
      { label: "Reports", href: "/reports", icon: BarChart3 },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Projects", href: "/projects", icon: FolderKanban, match: startsWith("/projects") },
    ],
  },
];

export const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

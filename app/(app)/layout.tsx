import { AppShell } from "@/components/layout/app-shell";

// Personal data app — always render fresh, never statically prerender.
export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

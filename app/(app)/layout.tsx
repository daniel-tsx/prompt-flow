import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getAccountState } from "@/lib/account";

// Personal data app — always render fresh, never statically prerender.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const account = await getAccountState();
  if (!account) redirect("/unlock");

  return <AppShell account={account}>{children}</AppShell>;
}

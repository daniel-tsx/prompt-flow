import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { createHash } from "node:crypto";

/** The two fixed accounts. `owner` is private (passcode); `demo` is the seeded showcase. */
export type AccountState = "owner" | "demo";

export const ACCOUNT_COOKIE = "pf_session";
export const DEMO_VALUE = "demo";

/** Unforgeable cookie value for the owner — derived from the secret passcode. */
export function ownerToken(): string | null {
  const passcode = process.env.OWNER_PASSCODE;
  if (!passcode) return null;
  return createHash("sha256").update(`promptflow:${passcode}`).digest("hex");
}

export function verifyPasscode(input: string): boolean {
  const passcode = process.env.OWNER_PASSCODE;
  return !!passcode && input.trim() === passcode;
}

/** Read the chosen account from the session cookie (null = not chosen yet). */
export const getAccountState = cache(async (): Promise<AccountState | null> => {
  const store = await cookies();
  const value = store.get(ACCOUNT_COOKIE)?.value;
  if (!value) return null;
  const token = ownerToken();
  if (token && value === token) return "owner";
  if (value === DEMO_VALUE) return "demo";
  return null;
});

/** The active account for data scoping — defaults to the read-only demo. */
export async function getAccount(): Promise<AccountState> {
  return (await getAccountState()) ?? "demo";
}

export async function isOwner(): Promise<boolean> {
  return (await getAccountState()) === "owner";
}

/** Guard for mutations — the demo account is read-only. */
export async function assertOwner(): Promise<void> {
  if (!(await isOwner())) {
    throw new Error("This is the read-only demo. Enter your passcode to make changes.");
  }
}

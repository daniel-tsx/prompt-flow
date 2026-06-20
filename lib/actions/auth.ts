"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ACCOUNT_COOKIE,
  DEMO_VALUE,
  ownerToken,
  verifyPasscode,
} from "@/lib/account";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 180, // ~6 months
};

export type UnlockState = { error?: string };

export async function unlock(
  _prev: UnlockState,
  formData: FormData,
): Promise<UnlockState> {
  const passcode = String(formData.get("passcode") ?? "");
  if (!process.env.OWNER_PASSCODE) {
    return { error: "Owner passcode isn't configured. Set OWNER_PASSCODE in .env.local." };
  }
  if (!verifyPasscode(passcode)) {
    return { error: "Incorrect passcode." };
  }
  const token = ownerToken();
  if (!token) return { error: "Owner passcode isn't configured." };
  (await cookies()).set(ACCOUNT_COOKIE, token, COOKIE_OPTS);
  redirect("/dashboard");
}

export async function enterDemo() {
  (await cookies()).set(ACCOUNT_COOKIE, DEMO_VALUE, COOKIE_OPTS);
  redirect("/dashboard");
}

export async function lockAccount() {
  (await cookies()).delete(ACCOUNT_COOKIE);
  redirect("/unlock");
}

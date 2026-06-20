import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  format,
  formatDistanceToNow,
  isPast,
  isToday,
  isTomorrow,
} from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** URL-safe slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/** Slug with a short random suffix to avoid collisions. */
export function uniqueSlug(input: string): string {
  const base = slugify(input) || "item";
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "MMM d, yyyy");
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "MMM d, yyyy · h:mm a");
}

export function relativeTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/** Friendly due-date label for tasks. */
export function dueLabel(date: Date | string | null | undefined): {
  label: string;
  tone: "overdue" | "today" | "soon" | "later" | "none";
} {
  if (!date) return { label: "No due date", tone: "none" };
  const d = new Date(date);
  if (isToday(d)) return { label: "Today", tone: "today" };
  if (isTomorrow(d)) return { label: "Tomorrow", tone: "soon" };
  if (isPast(d)) return { label: `Overdue · ${format(d, "MMM d")}`, tone: "overdue" };
  return { label: format(d, "MMM d"), tone: "later" };
}

export function pluralize(count: number, singular: string, plural?: string) {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

export function formatMinutes(min: number | null | undefined): string {
  if (min == null) return "—";
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/** Average of defined numbers, rounded to 1 decimal. Null if none. */
export function avg(values: (number | null | undefined)[]): number | null {
  const nums = values.filter((v): v is number => typeof v === "number");
  if (!nums.length) return null;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function truncate(text: string, length = 140): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + "…";
}

/** Strip markdown to a plain-text excerpt for cards/search snippets. */
export function plainExcerpt(md: string | null | undefined, length = 160): string {
  if (!md) return "";
  const text = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return truncate(text, length);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

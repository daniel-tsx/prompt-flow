/**
 * Calculated metrics for the prompt/workflow operating system.
 * All functions are pure so they can run on the server (queries) or client.
 */

import { clamp, avg } from "./utils";

export type RunResult =
  | "excellent"
  | "good"
  | "usable-with-edits"
  | "poor"
  | "failed";

export const RESULT_WEIGHT: Record<RunResult, number> = {
  excellent: 1,
  good: 0.8,
  "usable-with-edits": 0.6,
  poor: 0.3,
  failed: 0,
};

export type ScoreTier = "excellent" | "strong" | "moderate" | "weak" | "unknown";

export function scoreTier(score: number | null | undefined): ScoreTier {
  if (score == null) return "unknown";
  if (score >= 80) return "excellent";
  if (score >= 60) return "strong";
  if (score >= 40) return "moderate";
  return "weak";
}

export const TIER_ACCENT: Record<ScoreTier, "emerald" | "teal" | "amber" | "rose" | "slate"> = {
  excellent: "emerald",
  strong: "teal",
  moderate: "amber",
  weak: "rose",
  unknown: "slate",
};

type RunLike = {
  resultStatus: RunResult;
  date: Date | string;
  estimatedTimeSavedMinutes?: number | null;
};

function daysSince(date: Date | string): number {
  return (Date.now() - new Date(date).getTime()) / 86_400_000;
}

/* -------------------------------------------------------------------------- */
/*  1. Prompt Reliability Score                                                 */
/* -------------------------------------------------------------------------- */

export function reliabilityScore(input: {
  runs: RunLike[];
  qualityScore?: number | null;
  resultScore?: number | null;
}): number | null {
  const { runs } = input;
  const quality = input.qualityScore ?? input.resultScore ?? null;

  if (runs.length === 0 && quality == null) return null;

  const weights = runs.map((r) => RESULT_WEIGHT[r.resultStatus]);
  const avgResult = weights.length
    ? weights.reduce((a, b) => a + b, 0) / weights.length
    : 0.5;

  const successCount = runs.filter((r) => RESULT_WEIGHT[r.resultStatus] >= 0.6).length;
  const failCount = runs.filter((r) => RESULT_WEIGHT[r.resultStatus] <= 0.3).length;

  const successfulRuns = runs.filter((r) => RESULT_WEIGHT[r.resultStatus] >= 0.6);
  const mostRecentSuccess = successfulRuns
    .map((r) => daysSince(r.date))
    .sort((a, b) => a - b)[0];

  const recencyFactor =
    mostRecentSuccess == null
      ? 0
      : mostRecentSuccess <= 14
        ? 1
        : clamp(1 - (mostRecentSuccess - 14) / 120, 0.2, 1);

  const qualityFactor = quality != null ? quality / 10 : avgResult;
  const volumeFactor = clamp(successCount / 5, 0, 1);
  const failPenalty = Math.min(failCount * 4, 20);

  const score =
    0.55 * (avgResult * 100) +
    0.2 * (qualityFactor * 100) +
    0.15 * (volumeFactor * 100) +
    0.1 * (recencyFactor * 100) -
    failPenalty;

  return Math.round(clamp(score, 0, 100));
}

/* -------------------------------------------------------------------------- */
/*  2. Prompt Usefulness Score                                                  */
/* -------------------------------------------------------------------------- */

export function usefulnessScore(input: {
  favorite: boolean;
  runs: RunLike[];
  qualityScore?: number | null;
  linkedWorkflowCount: number;
}): number {
  const { favorite, runs, qualityScore, linkedWorkflowCount } = input;
  const totalTimeSaved = runs.reduce(
    (sum, r) => sum + (r.estimatedTimeSavedMinutes ?? 0),
    0,
  );

  const score =
    (favorite ? 15 : 0) +
    clamp(runs.length / 8, 0, 1) * 30 +
    (qualityScore != null ? (qualityScore / 10) * 25 : 12) +
    clamp(totalTimeSaved / 600, 0, 1) * 20 +
    clamp(linkedWorkflowCount / 3, 0, 1) * 10;

  return Math.round(clamp(score, 0, 100));
}

/* -------------------------------------------------------------------------- */
/*  3. Workflow Maturity Score                                                  */
/* -------------------------------------------------------------------------- */

const WORKFLOW_STATUS_FACTOR: Record<string, number> = {
  reliable: 1,
  active: 0.7,
  "needs-improvement": 0.5,
  draft: 0.25,
  archived: 0.3,
};

export function workflowMaturityScore(input: {
  stepCount: number;
  linkedPromptCount: number;
  status: string;
  whenToUse?: string | null;
  whenNotToUse?: string | null;
  outcome?: string | null;
}): number {
  const completeness =
    ((input.whenToUse ? 1 : 0) +
      (input.whenNotToUse ? 1 : 0) +
      (input.outcome ? 1 : 0)) /
    3;

  const statusFactor = WORKFLOW_STATUS_FACTOR[input.status] ?? 0.25;

  const score =
    clamp(input.stepCount / 5, 0, 1) * 30 +
    clamp(input.linkedPromptCount / 3, 0, 1) * 20 +
    completeness * 25 +
    statusFactor * 25;

  return Math.round(clamp(score, 0, 100));
}

/* -------------------------------------------------------------------------- */
/*  4. Inbox Pressure                                                           */
/* -------------------------------------------------------------------------- */

export type PressureTier = "calm" | "manageable" | "busy" | "overloaded";

export function inboxPressure(input: {
  inboxCount: number;
  overdueCount: number;
  highPriorityCount: number;
  unconvertedIdeaCount: number;
}): { score: number; tier: PressureTier } {
  const score = Math.round(
    clamp(
      clamp(input.inboxCount / 15, 0, 1) * 35 +
        clamp(input.overdueCount / 5, 0, 1) * 30 +
        clamp(input.highPriorityCount / 5, 0, 1) * 20 +
        clamp(input.unconvertedIdeaCount / 8, 0, 1) * 15,
      0,
      100,
    ),
  );

  const tier: PressureTier =
    score >= 70
      ? "overloaded"
      : score >= 45
        ? "busy"
        : score >= 20
          ? "manageable"
          : "calm";

  return { score, tier };
}

export const PRESSURE_ACCENT: Record<PressureTier, "emerald" | "teal" | "amber" | "rose"> = {
  calm: "emerald",
  manageable: "teal",
  busy: "amber",
  overloaded: "rose",
};

/* -------------------------------------------------------------------------- */
/*  5. Prompt Health                                                            */
/* -------------------------------------------------------------------------- */

export type HealthFlag =
  | "no-runs"
  | "poor-results"
  | "versions-no-reliable"
  | "stale-favorite"
  | "low-quality";

export const HEALTH_FLAG_LABEL: Record<HealthFlag, string> = {
  "no-runs": "No run history",
  "poor-results": "Poor recent results",
  "versions-no-reliable": "Many versions, none reliable",
  "stale-favorite": "Favorite, not used recently",
  "low-quality": "Low quality score",
};

export function promptHealthFlags(input: {
  status: string;
  favorite: boolean;
  qualityScore?: number | null;
  versionCount: number;
  runs: RunLike[];
}): HealthFlag[] {
  const flags: HealthFlag[] = [];
  const { runs } = input;

  if (runs.length === 0 && input.status !== "draft" && input.status !== "archived") {
    flags.push("no-runs");
  }

  if (runs.length >= 2) {
    const mean = avg(runs.map((r) => RESULT_WEIGHT[r.resultStatus])) ?? 1;
    if (mean < 0.45) flags.push("poor-results");
  }

  if (input.versionCount >= 3 && input.status !== "reliable") {
    flags.push("versions-no-reliable");
  }

  if (input.favorite) {
    const last = runs.map((r) => daysSince(r.date)).sort((a, b) => a - b)[0];
    if (last == null || last > 45) flags.push("stale-favorite");
  }

  if (input.qualityScore != null && input.qualityScore <= 4) {
    flags.push("low-quality");
  }

  return flags;
}

/** Aggregate health of the whole prompt library (0-100, higher is healthier). */
export function libraryHealthScore(prompts: { flags: HealthFlag[] }[]): number {
  if (prompts.length === 0) return 100;
  const withIssues = prompts.filter((p) => p.flags.length > 0).length;
  return Math.round(clamp((1 - withIssues / prompts.length) * 100, 0, 100));
}

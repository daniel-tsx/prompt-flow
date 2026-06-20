import { randomUUID } from "node:crypto";
import { slugify } from "@/lib/utils";
import type {
  NewCollection,
  NewCollectionItem,
  NewNote,
  NewProject,
  NewPrompt,
  NewPromptRun,
  NewPromptVersion,
  NewTemplate,
  NewWorkflow,
  NewWorkflowStep,
} from "@/db/schema";

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);

/* -------------------------------------------------------------------------- */
/*  Projects                                                                    */
/* -------------------------------------------------------------------------- */

const projectDefs: {
  name: string;
  type: NewProject["type"];
  status: NewProject["status"];
  description: string;
  domain?: string;
  color: string;
}[] = [
  { name: "SmartTrips", type: "commercial", status: "active", color: "#14b8a6", domain: "smarttrips.app", description: "AI travel planning app — itineraries, brand imagery, and trip automation." },
  { name: "Eastbase Studio", type: "content", status: "active", color: "#8b5cf6", domain: "eastbase.studio", description: "Indie studio brand + content engine. Blog, X, LinkedIn, Reddit." },
  { name: "DueKind", type: "commercial", status: "active", color: "#3b82f6", domain: "duekind.com", description: "Friendly invoicing + payment reminders for freelancers." },
  { name: "BurnCap", type: "commercial", status: "active", color: "#f97316", domain: "burncap.io", description: "Runway and burn-rate tracker for early-stage founders." },
  { name: "MergeAttest", type: "devtool", status: "active", color: "#6366f1", domain: "mergeattest.dev", description: "PR attestation + provenance for CI/CD pipelines." },
  { name: "AegisRail", type: "internal-tool", status: "paused", color: "#f43f5e", description: "Internal guardrails + rate-limit control plane." },
  { name: "PodCut", type: "experiment", status: "active", color: "#ec4899", domain: "podcut.fm", description: "Turn long podcasts into short vertical video clips." },
  { name: "Backend Architecture Lab", type: "learning", status: "active", color: "#10b981", description: "Personal lab for backend system design + architecture practice." },
  { name: "CostTracker", type: "internal-tool", status: "active", color: "#06b6d4", description: "Track AI API + infra spend across all projects." },
  { name: "EnvVault", type: "devtool", status: "active", color: "#22c55e", domain: "envvault.dev", description: "Encrypted env var manager with team sharing." },
  { name: "Vocabulary Tracker", type: "personal", status: "active", color: "#a855f7", description: "Spaced-repetition vocabulary tracker for language learning." },
];

export function buildSeedData() {
  const projects: NewProject[] = projectDefs.map((p) => ({
    id: randomUUID(),
    name: p.name,
    slug: slugify(p.name),
    description: p.description,
    domain: p.domain ?? null,
    type: p.type,
    status: p.status,
    color: p.color,
  }));
  const P = Object.fromEntries(projects.map((p) => [p.name, p.id as string]));

  /* ------------------------------ Prompts -------------------------------- */

  const prompts: NewPrompt[] = [];
  const promptVersions: NewPromptVersion[] = [];
  const promptRuns: NewPromptRun[] = [];
  const PID: Record<string, string> = {};

  function addPrompt(def: {
    key: string;
    title: string;
    description: string;
    promptText: string;
    category: NewPrompt["category"];
    intent: NewPrompt["intent"];
    targetTool: NewPrompt["targetTool"];
    targetModel?: string;
    project?: string;
    status: NewPrompt["status"];
    favorite?: boolean;
    quality?: number;
    clarity?: number;
    result?: number;
    cost?: number;
    tags: string[];
    notes?: string;
    createdDaysAgo: number;
  }) {
    const id = randomUUID();
    PID[def.key] = id;
    prompts.push({
      id,
      title: def.title,
      slug: slugify(def.title),
      description: def.description,
      promptText: def.promptText,
      category: def.category,
      intent: def.intent,
      targetTool: def.targetTool,
      targetModel: def.targetModel ?? null,
      relatedProjectId: def.project ? P[def.project] : null,
      status: def.status,
      reusable: true,
      favorite: def.favorite ?? false,
      qualityScore: def.quality ?? null,
      clarityScore: def.clarity ?? null,
      resultScore: def.result ?? null,
      costEfficiencyScore: def.cost ?? null,
      tags: def.tags,
      notes: def.notes ?? null,
      createdAt: daysAgo(def.createdDaysAgo),
      updatedAt: daysAgo(Math.max(0, def.createdDaysAgo - 3)),
    });
  }

  addPrompt({
    key: "saas-bootstrap",
    title: "Build a new SaaS project with Next.js, Drizzle, Neon, BetterAuth",
    description: "End-to-end bootstrap prompt for a production-ready SaaS starter.",
    category: "project-bootstrap",
    intent: "plan-project",
    targetTool: "Codex",
    targetModel: "gpt-5-codex",
    project: "SmartTrips",
    status: "reliable",
    favorite: true,
    quality: 9,
    clarity: 9,
    result: 9,
    cost: 7,
    tags: ["bootstrap", "nextjs", "drizzle", "neon"],
    notes: "Best when you also paste the target folder structure. v3 cut hallucinated packages.",
    createdDaysAgo: 64,
    promptText: `## Role
You are a senior full-stack engineer bootstrapping a production SaaS.

## Stack
- Next.js App Router + TypeScript
- Tailwind + shadcn/ui
- Drizzle ORM on Neon (Postgres)
- BetterAuth for auth
- Deploy on Vercel

## Task
Scaffold {{project_name}}. Produce:
1. Folder structure
2. Drizzle schema for {{core_entities}}
3. Auth wiring (email + OAuth)
4. One protected dashboard route
5. .env.example

## Constraints
- No speculative features. Minimum that runs.
- Every file should compile. No invented packages.
- Use server actions for mutations.`,
  });

  addPrompt({
    key: "api-review",
    title: "Review API routes and suggest Upstash rate limiting if needed",
    description: "Audits route handlers for auth, validation, and abuse protection.",
    category: "api-review",
    intent: "review-code",
    targetTool: "Claude Code",
    targetModel: "claude-opus-4-8",
    project: "MergeAttest",
    status: "reliable",
    quality: 8,
    clarity: 8,
    result: 8,
    cost: 8,
    tags: ["api", "security", "rate-limit", "upstash"],
    createdDaysAgo: 40,
    promptText: `Review every route handler in this codebase.

For each endpoint report:
- Auth: is it protected? who can call it?
- Input validation: is the body/query validated with Zod?
- Rate limiting: should it be rate-limited? If yes, give an Upstash @upstash/ratelimit snippet.
- Idempotency: are write endpoints safe to retry?

Output a table sorted by risk (high → low), then concrete diffs for the top 3 issues.`,
  });

  addPrompt({
    key: "seo-setup",
    title: "Prepare SEO setup before launch",
    description: "Pre-launch SEO checklist: metadata, sitemap, OG, structured data.",
    category: "seo",
    intent: "plan-project",
    targetTool: "ChatGPT",
    project: "Eastbase Studio",
    status: "tested",
    quality: 7,
    clarity: 8,
    tags: ["seo", "launch", "metadata"],
    createdDaysAgo: 28,
    promptText: `You are an SEO engineer. For {{product_name}} ({{domain}}), produce a pre-launch SEO setup:

1. Title + meta description for the 5 most important pages
2. generateMetadata() examples for Next.js App Router
3. sitemap.ts + robots.ts
4. JSON-LD structured data for the product
5. OG image checklist
6. 10 target keywords with intent

Keep it copy-pasteable.`,
  });

  addPrompt({
    key: "marketing-plan",
    title: "Create a full marketing plan for any product",
    description: "Positioning, channels, content calendar, and launch sequence.",
    category: "marketing",
    intent: "plan-project",
    targetTool: "ChatGPT",
    project: "BurnCap",
    status: "reliable",
    favorite: true,
    quality: 8,
    clarity: 7,
    result: 8,
    tags: ["marketing", "gtm", "launch"],
    createdDaysAgo: 52,
    promptText: `Act as a scrappy indie-hacker marketer.

Product: {{product_name}}
Audience: {{target_user}}
Stage: pre-launch

Deliver:
1. One-line positioning + 3 alternatives
2. 3 distribution channels ranked by ROI for a solo founder
3. A 4-week content calendar (X, LinkedIn, Reddit, blog)
4. A launch-week sequence
5. 5 hooks I can A/B test

Be specific. No generic advice.`,
  });

  addPrompt({
    key: "portfolio-3d",
    title: "Design a premium 3D portfolio with GSAP",
    description: "Art-directed, motion-heavy portfolio concept and implementation plan.",
    category: "ui-design",
    intent: "design-ui",
    targetTool: "Claude Code",
    project: "Eastbase Studio",
    status: "tested",
    quality: 7,
    clarity: 7,
    tags: ["3d", "gsap", "portfolio", "motion"],
    createdDaysAgo: 22,
    promptText: `Design a premium, slightly futuristic 3D portfolio.

Direction: {{design_direction}} (dark, glassy, depth).
Stack: Next.js + GSAP + (optional) react-three-fiber.

Give me:
- A hero concept with scroll-driven motion
- 3 signature interactions (and the GSAP timeline for one)
- A section map
- Performance guardrails (don't tank LCP)

Then implement the hero section.`,
  });

  addPrompt({
    key: "travel-images",
    title: "Generate cinematic travel brand images",
    description: "Image-model prompt for a cohesive cinematic travel brand set.",
    category: "image-generation",
    intent: "generate-media",
    targetTool: "image-model",
    targetModel: "midjourney-v7",
    project: "SmartTrips",
    status: "reliable",
    quality: 8,
    result: 9,
    tags: ["image", "brand", "travel", "cinematic"],
    createdDaysAgo: 35,
    promptText: `cinematic travel brand photograph, {{destination}}, golden hour, anamorphic lens flare,
shallow depth of field, muted teal-and-amber grade, premium editorial look,
person small in frame for scale, ultra-detailed, 35mm, --ar 16:9 --style raw`,
  });

  addPrompt({
    key: "lol-video",
    title: "Generate a playful League of Legends-style video prompt",
    description: "Stylized hype video concept for a video-generation model.",
    category: "video-generation",
    intent: "generate-media",
    targetTool: "video-model",
    targetModel: "runway-gen4",
    project: "PodCut",
    status: "draft",
    quality: 5,
    tags: ["video", "stylized", "hype"],
    notes: "Still too chaotic. Needs tighter shot list + camera language.",
    createdDaysAgo: 9,
    promptText: `Stylized cinematic hype trailer, League-of-Legends splash-art energy.
Subject: {{subject}}. Mood: playful, epic, fast.
Shot list: dramatic push-in, particle burst on beat, slow-mo hero pose, logo sting.
Lighting: rim light + volumetric. Camera: 35mm, slight handheld. 6 seconds.`,
  });

  addPrompt({
    key: "nextjs-readiness",
    title: "Review a Next.js app for production readiness",
    description: "Comprehensive production-readiness audit for App Router apps.",
    category: "code-review",
    intent: "review-code",
    targetTool: "Claude Code",
    targetModel: "claude-opus-4-8",
    status: "reliable",
    favorite: true,
    quality: 9,
    clarity: 9,
    result: 9,
    cost: 7,
    tags: ["nextjs", "production", "audit", "performance"],
    notes: "My most reused review prompt. Pairs well with the API review prompt.",
    createdDaysAgo: 58,
    promptText: `Audit this Next.js App Router app for production readiness.

Cover, with file:line evidence:
- Server/Client component boundaries (no secrets/db in client)
- Data fetching + caching correctness
- Loading + error + not-found states
- Form validation + server action security
- Accessibility on key flows
- Bundle/perf risks (heavy client deps, waterfalls)
- Env var handling

Output: prioritized issue list (P0/P1/P2), each with a concrete fix.`,
  });

  addPrompt({
    key: "backend-learning",
    title: "Create a backend architecture learning module",
    description: "Turns a backend topic into a structured, hands-on learning module.",
    category: "learning",
    intent: "teach",
    targetTool: "ChatGPT",
    project: "Backend Architecture Lab",
    status: "tested",
    quality: 8,
    clarity: 9,
    tags: ["backend", "learning", "architecture"],
    createdDaysAgo: 31,
    promptText: `Teach me {{topic}} as a hands-on backend module.

Structure:
1. Mental model (1 paragraph + 1 diagram described in text)
2. The 3 tradeoffs that actually matter
3. A small build exercise I can do in <2h
4. 5 questions a staff engineer would ask in review
5. Common failure modes in production

Assume I'm a strong frontend dev leveling up backend.`,
  });

  addPrompt({
    key: "reddit-post",
    title: "Generate a Reddit discussion-first post",
    description: "Non-salesy, discussion-first Reddit post that survives mod scrutiny.",
    category: "social-post",
    intent: "write-content",
    targetTool: "ChatGPT",
    project: "Eastbase Studio",
    status: "reliable",
    quality: 8,
    result: 8,
    tags: ["reddit", "content", "distribution"],
    createdDaysAgo: 26,
    promptText: `Write a Reddit post for r/{{subreddit}} that is discussion-first, not promotional.

Rules:
- Lead with a real problem or observation
- Share a genuine lesson or data point
- Mention the product only if someone could reasonably ask
- End with an open question
- No marketing voice. Sound like a builder.

Topic: {{topic}}`,
  });

  addPrompt({
    key: "linkedin-update",
    title: "Create a LinkedIn casual product update",
    description: "Warm, human LinkedIn update that isn't cringe.",
    category: "social-post",
    intent: "write-content",
    targetTool: "ChatGPT",
    project: "DueKind",
    status: "tested",
    quality: 7,
    tags: ["linkedin", "content"],
    createdDaysAgo: 18,
    promptText: `Write a casual LinkedIn post about a small win on {{product_name}}.

Tone: human, specific, a little self-deprecating. No hashtags-as-confetti.
Structure: hook line, 2-3 short paragraphs, one concrete detail, soft CTA.
Topic: {{topic}}`,
  });

  addPrompt({
    key: "ph-launch",
    title: "Write a Product Hunt launch post",
    description: "PH launch tagline, description, and first comment.",
    category: "marketing",
    intent: "write-content",
    targetTool: "ChatGPT",
    project: "BurnCap",
    status: "needs-improvement",
    quality: 5,
    result: 4,
    tags: ["product-hunt", "launch", "copy"],
    notes: "Taglines came out generic. Needs a stronger angle + maker story.",
    createdDaysAgo: 14,
    promptText: `Write a Product Hunt launch kit for {{product_name}}.

Give:
- 3 taglines (<60 chars)
- A 2-sentence description
- A maker's first comment (story-driven, why I built it)
- 5 reply templates for common questions

Audience: {{target_user}}.`,
  });

  addPrompt({
    key: "dashboard-ui",
    title: "Design a dashboard UI from product context",
    description: "Generates an information architecture + layout for a data dashboard.",
    category: "ui-design",
    intent: "design-ui",
    targetTool: "Claude Code",
    project: "CostTracker",
    status: "reliable",
    quality: 8,
    clarity: 8,
    result: 8,
    tags: ["dashboard", "ui", "shadcn"],
    createdDaysAgo: 20,
    promptText: `Design a dashboard for {{product_name}}.

Inputs: {{key_metrics}}, {{primary_user_job}}.

Produce:
- Information architecture (what's on the overview vs detail pages)
- A hero metric row (which 4 numbers matter most)
- 3 chart recommendations with the exact data shape
- An empty state + loading state plan
- shadcn/ui component mapping

Dark, premium, fast.`,
  });

  addPrompt({
    key: "system-design",
    title: "Create a system design case study prompt",
    description: "Generates a realistic system-design interview case to practice.",
    category: "system-design",
    intent: "teach",
    targetTool: "ChatGPT",
    project: "Backend Architecture Lab",
    status: "tested",
    quality: 8,
    tags: ["system-design", "interview", "practice"],
    createdDaysAgo: 24,
    promptText: `Generate a realistic system design case study for {{system}}.

Include:
- Functional + non-functional requirements
- Back-of-envelope scale estimates
- A reference architecture (components + data flow)
- 3 hard tradeoffs to discuss
- Failure scenarios + mitigations
- What "good" vs "great" answers look like

Then quiz me with 5 follow-ups.`,
  });

  addPrompt({
    key: "compare-models",
    title: "Compare AI models after using them in real tasks",
    description: "Structured rubric to compare model outputs on the same real task.",
    category: "code-review",
    intent: "review-code",
    targetTool: "other",
    status: "tested",
    favorite: true,
    quality: 8,
    clarity: 7,
    tags: ["evaluation", "models", "rubric"],
    notes: "Use after running the same task on 2+ tools. Feeds my model notes.",
    createdDaysAgo: 12,
    promptText: `I ran the same task on multiple models. Help me compare them objectively.

Task: {{task}}
Models: {{models}}

For each model score 1-10 on: correctness, completeness, code quality, instruction-following, edits-needed, speed-felt.
Then: a verdict table, the single best pick for this task type, and when I'd choose each.`,
  });

  /* ----------------------------- Versions -------------------------------- */

  function addVersions(
    promptKey: string,
    versions: {
      n: number;
      title: string;
      promptText: string;
      changeSummary: string;
      reasonForChange?: string;
      resultNotes?: string;
      quality?: number;
      daysAgo: number;
    }[],
  ) {
    let currentId: string | null = null;
    for (const v of versions) {
      const id = randomUUID();
      promptVersions.push({
        id,
        promptId: PID[promptKey],
        versionNumber: v.n,
        title: v.title,
        promptText: v.promptText,
        changeSummary: v.changeSummary,
        reasonForChange: v.reasonForChange ?? null,
        resultNotes: v.resultNotes ?? null,
        qualityScore: v.quality ?? null,
        createdAt: daysAgo(v.daysAgo),
      });
      currentId = id;
    }
    // Mark the last version as current on the prompt
    const p = prompts.find((x) => x.id === PID[promptKey]);
    if (p) p.currentVersionId = currentId;
  }

  addVersions("saas-bootstrap", [
    { n: 1, title: "SaaS bootstrap v1", promptText: "Scaffold a SaaS with Next.js + Drizzle. List the files.", changeSummary: "Initial version", quality: 6, daysAgo: 64 },
    { n: 2, title: "SaaS bootstrap v2", promptText: "Scaffold a SaaS with Next.js + Drizzle + Neon + BetterAuth. Include schema and auth.", changeSummary: "Added Neon + BetterAuth + schema", reasonForChange: "v1 skipped auth and DB wiring", quality: 7, daysAgo: 50 },
    { n: 3, title: "SaaS bootstrap v3", promptText: prompts.find((x) => x.id === PID["saas-bootstrap"])!.promptText as string, changeSummary: "Added Role + Constraints, banned invented packages", reasonForChange: "v2 hallucinated packages and over-engineered", resultNotes: "Much cleaner output; compiles first try.", quality: 9, daysAgo: 18 },
  ]);

  addVersions("ph-launch", [
    { n: 1, title: "PH launch v1", promptText: "Write a Product Hunt post for my product.", changeSummary: "Initial", quality: 4, daysAgo: 14 },
    { n: 2, title: "PH launch v2", promptText: prompts.find((x) => x.id === PID["ph-launch"])!.promptText as string, changeSummary: "Added structure + maker story", reasonForChange: "v1 was generic", resultNotes: "Better, but taglines still weak.", quality: 5, daysAgo: 6 },
  ]);

  addVersions("nextjs-readiness", [
    { n: 1, title: "Readiness v1", promptText: "Review my Next.js app and find problems.", changeSummary: "Initial", quality: 6, daysAgo: 58 },
    { n: 2, title: "Readiness v2", promptText: prompts.find((x) => x.id === PID["nextjs-readiness"])!.promptText as string, changeSummary: "Added evidence requirement + P0/P1/P2 + perf section", reasonForChange: "v1 was vague and missed perf", resultNotes: "Now my default review prompt.", quality: 9, daysAgo: 30 },
  ]);

  /* ------------------------------- Runs ---------------------------------- */

  function addRun(def: {
    promptKey: string;
    project?: string;
    title: string;
    daysAgo: number;
    tool: NewPromptRun["toolUsed"];
    model?: string;
    task: string;
    output: string;
    result: NewPromptRun["resultStatus"];
    timeSpent?: number;
    timeSaved?: number;
    problems?: string[];
    lessons?: string;
    followUp?: boolean;
    followUpNote?: string;
  }) {
    promptRuns.push({
      id: randomUUID(),
      promptId: PID[def.promptKey],
      promptVersionId: null,
      projectId: def.project ? P[def.project] : null,
      title: def.title,
      date: daysAgo(def.daysAgo),
      toolUsed: def.tool,
      modelUsed: def.model ?? null,
      taskDescription: def.task,
      inputContext: null,
      outputSummary: def.output,
      resultStatus: def.result,
      timeSpentMinutes: def.timeSpent ?? null,
      estimatedTimeSavedMinutes: def.timeSaved ?? null,
      problems: def.problems ?? [],
      lessonsLearned: def.lessons ?? null,
      followUpNeeded: def.followUp ?? false,
      followUpNote: def.followUpNote ?? null,
      createdAt: daysAgo(def.daysAgo),
      updatedAt: daysAgo(def.daysAgo),
    });
  }

  addRun({ promptKey: "saas-bootstrap", project: "SmartTrips", title: "Bootstrap SmartTrips v2 backend", daysAgo: 16, tool: "Codex", model: "gpt-5-codex", task: "Scaffold trips + itinerary schema", output: "Full schema + auth + dashboard route. Compiled first try.", result: "excellent", timeSpent: 25, timeSaved: 180, lessons: "Pasting the folder structure up front removed all guessing." });
  addRun({ promptKey: "saas-bootstrap", project: "DueKind", title: "Reuse bootstrap for DueKind", daysAgo: 9, tool: "Codex", task: "Bootstrap invoicing app", output: "Good base, needed minor auth tweaks.", result: "good", timeSpent: 30, timeSaved: 120 });
  addRun({ promptKey: "api-review", project: "MergeAttest", title: "Pre-launch API audit", daysAgo: 11, tool: "Claude Code", model: "claude-opus-4-8", task: "Audit all routes", output: "Found 2 unprotected write routes + 1 missing rate limit. Gave diffs.", result: "excellent", timeSpent: 20, timeSaved: 90, lessons: "The risk table makes it easy to triage." });
  addRun({ promptKey: "marketing-plan", project: "BurnCap", title: "BurnCap GTM plan", daysAgo: 21, tool: "ChatGPT", task: "Full marketing plan", output: "Solid channel ranking + 4-week calendar.", result: "good", timeSaved: 150 });
  addRun({ promptKey: "travel-images", project: "SmartTrips", title: "Hero imagery batch", daysAgo: 19, tool: "image-model", model: "midjourney-v7", task: "Generate 8 hero shots", output: "6/8 usable, very on-brand.", result: "excellent", timeSaved: 120 });
  addRun({ promptKey: "nextjs-readiness", title: "Readiness pass on CostTracker", daysAgo: 7, tool: "Claude Code", model: "claude-opus-4-8", task: "Production audit", output: "Clear P0/P1/P2 list. Fixed 3 P0s same day.", result: "excellent", timeSpent: 15, timeSaved: 120, lessons: "Evidence with file:line saved me from re-checking." });
  addRun({ promptKey: "nextjs-readiness", title: "Readiness on DueKind", daysAgo: 2, tool: "Claude Code", task: "Audit before launch", output: "Caught a client-bundled secret. Big save.", result: "excellent", timeSaved: 90 });
  addRun({ promptKey: "backend-learning", project: "Backend Architecture Lab", title: "Learn idempotency keys", daysAgo: 13, tool: "ChatGPT", task: "Module on idempotency", output: "Great mental model + 2h exercise.", result: "good", timeSaved: 60 });
  addRun({ promptKey: "reddit-post", project: "Eastbase Studio", title: "r/SaaS distribution post", daysAgo: 10, tool: "ChatGPT", task: "Discussion-first post", output: "Survived mods, 40 comments.", result: "good", timeSaved: 30 });
  addRun({ promptKey: "ph-launch", project: "BurnCap", title: "PH draft attempt", daysAgo: 6, tool: "ChatGPT", task: "Launch kit", output: "Taglines generic, rewrote by hand.", result: "poor", problems: ["generic taglines", "weak hook"], followUp: true, followUpNote: "Try a v3 with a sharper angle + competitor contrast." });
  addRun({ promptKey: "dashboard-ui", project: "CostTracker", title: "CostTracker overview design", daysAgo: 8, tool: "Claude Code", task: "Design overview dashboard", output: "Good IA + chart shapes. Implemented directly.", result: "good", timeSaved: 90 });
  addRun({ promptKey: "lol-video", project: "PodCut", title: "Hype clip test", daysAgo: 5, tool: "video-model", model: "runway-gen4", task: "Stylized hype clip", output: "Too chaotic, motion incoherent.", result: "failed", problems: ["incoherent motion", "no shot discipline"], followUp: true, followUpNote: "Add explicit shot list + camera language." });

  /* ----------------------------- Workflows ------------------------------- */

  const workflows: NewWorkflow[] = [];
  const workflowSteps: NewWorkflowStep[] = [];
  const WID: Record<string, string> = {};

  function addWorkflow(def: {
    key: string;
    title: string;
    description: string;
    type: NewWorkflow["workflowType"];
    project?: string;
    status: NewWorkflow["status"];
    favorite?: boolean;
    outcome?: string;
    whenToUse?: string;
    whenNotToUse?: string;
    tools: string[];
    tags: string[];
    notes?: string;
    daysAgo: number;
    steps: {
      title: string;
      description?: string;
      promptKey?: string;
      instruction?: string;
      expectedOutput?: string;
      checklist?: string[];
    }[];
  }) {
    const id = randomUUID();
    WID[def.key] = id;
    workflows.push({
      id,
      title: def.title,
      slug: slugify(def.title),
      description: def.description,
      workflowType: def.type,
      relatedProjectId: def.project ? P[def.project] : null,
      status: def.status,
      favorite: def.favorite ?? false,
      outcome: def.outcome ?? null,
      whenToUse: def.whenToUse ?? null,
      whenNotToUse: def.whenNotToUse ?? null,
      toolsUsed: def.tools,
      tags: def.tags,
      notes: def.notes ?? null,
      createdAt: daysAgo(def.daysAgo),
      updatedAt: daysAgo(Math.max(0, def.daysAgo - 4)),
    });
    def.steps.forEach((s, i) => {
      workflowSteps.push({
        id: randomUUID(),
        workflowId: id,
        order: i,
        title: s.title,
        description: s.description ?? null,
        linkedPromptId: s.promptKey ? PID[s.promptKey] : null,
        instruction: s.instruction ?? null,
        expectedOutput: s.expectedOutput ?? null,
        checklist: s.checklist ?? [],
      });
    });
  }

  addWorkflow({
    key: "start-internal-tool",
    title: "Start a new internal tool",
    description: "From idea to a running internal tool with auth and one core flow.",
    type: "coding",
    project: "EnvVault",
    status: "reliable",
    favorite: true,
    outcome: "A deployed internal tool with auth, one core entity, and a dashboard.",
    whenToUse: "When you need a small internal tool fast and quality matters more than scale.",
    whenNotToUse: "For public, high-scale SaaS — use the full launch workflow instead.",
    tools: ["Codex", "Claude Code", "Neon"],
    tags: ["internal", "bootstrap"],
    daysAgo: 44,
    steps: [
      { title: "Define the one job", description: "Write the single job the tool must do this week.", checklist: ["Core entity named", "One primary screen", "Out-of-scope list"] },
      { title: "Bootstrap the app", promptKey: "saas-bootstrap", instruction: "Run the bootstrap prompt with the internal-tool scope.", expectedOutput: "Compiling app with schema + auth + dashboard." },
      { title: "Design the core screen", promptKey: "dashboard-ui", instruction: "Generate the IA + layout for the main screen." },
      { title: "Production check", promptKey: "nextjs-readiness", instruction: "Run the readiness audit before sharing internally.", checklist: ["No client secrets", "Loading/empty states", "Validated inputs"] },
    ],
  });

  addWorkflow({
    key: "prepare-saas-launch",
    title: "Prepare a SaaS app for launch",
    description: "Pre-launch checklist across SEO, API hardening, readiness, and marketing.",
    type: "launch",
    project: "BurnCap",
    status: "active",
    outcome: "A launch-ready app + a marketing plan ready to execute.",
    whenToUse: "1-2 weeks before a public launch.",
    whenNotToUse: "During early prototyping.",
    tools: ["Claude Code", "ChatGPT"],
    tags: ["launch", "checklist"],
    daysAgo: 30,
    steps: [
      { title: "Harden the API", promptKey: "api-review", expectedOutput: "Risk table + diffs for top issues." },
      { title: "Production readiness", promptKey: "nextjs-readiness", expectedOutput: "P0/P1/P2 issue list." },
      { title: "SEO setup", promptKey: "seo-setup", checklist: ["Metadata", "Sitemap/robots", "OG images", "JSON-LD"] },
      { title: "Marketing plan", promptKey: "marketing-plan", expectedOutput: "Channels + 4-week calendar + launch sequence." },
      { title: "Product Hunt kit", promptKey: "ph-launch", instruction: "Draft and refine until taglines are sharp." },
    ],
  });

  addWorkflow({
    key: "eastbase-blog-repurpose",
    title: "Write Eastbase blog post and repurpose it",
    description: "Write one blog post, then repurpose it to X, LinkedIn, and Reddit.",
    type: "content",
    project: "Eastbase Studio",
    status: "reliable",
    favorite: true,
    outcome: "1 blog post + 3 platform-native posts from a single idea.",
    whenToUse: "Weekly content cadence.",
    whenNotToUse: "For time-sensitive announcements.",
    tools: ["ChatGPT", "Claude Code"],
    tags: ["content", "repurpose", "eastbase"],
    daysAgo: 26,
    steps: [
      { title: "Draft the blog post", instruction: "Write the long-form post first as the source of truth.", expectedOutput: "800-1200 word post." },
      { title: "Repurpose to Reddit", promptKey: "reddit-post", instruction: "Discussion-first, pick the subreddit." },
      { title: "Repurpose to LinkedIn", promptKey: "linkedin-update", instruction: "Casual, human tone." },
      { title: "Repurpose to X", instruction: "Pull 3 hooks + a thread outline from the post.", checklist: ["3 hooks", "Thread outline", "1 standalone banger"] },
    ],
  });

  addWorkflow({
    key: "review-api-before-launch",
    title: "Review product API before launch",
    description: "Focused API hardening pass with rate limiting and idempotency.",
    type: "debugging",
    project: "MergeAttest",
    status: "active",
    outcome: "All write endpoints protected, validated, and rate-limited.",
    whenToUse: "Before exposing an API publicly.",
    tools: ["Claude Code", "Upstash"],
    tags: ["api", "security"],
    daysAgo: 18,
    steps: [
      { title: "Run the API review prompt", promptKey: "api-review", expectedOutput: "Risk-sorted table." },
      { title: "Add rate limiting", instruction: "Apply Upstash ratelimit to the top-risk endpoints.", checklist: ["Identify hot endpoints", "Add @upstash/ratelimit", "Test 429 path"] },
      { title: "Verify idempotency", instruction: "Ensure POST/PUT are retry-safe." },
    ],
  });

  addWorkflow({
    key: "marketing-video-concept",
    title: "Generate marketing video concept",
    description: "From product angle to a generation-ready video prompt.",
    type: "marketing",
    project: "PodCut",
    status: "draft",
    outcome: "A tight, generation-ready video prompt with a shot list.",
    whenToUse: "When you want a hype/launch clip.",
    tools: ["ChatGPT", "video-model"],
    tags: ["video", "marketing"],
    daysAgo: 8,
    steps: [
      { title: "Pick the angle", instruction: "Choose one emotion + one core message." },
      { title: "Write the video prompt", promptKey: "lol-video", instruction: "Add an explicit shot list + camera language.", expectedOutput: "6-8s generation prompt." },
      { title: "Generate + iterate", instruction: "Generate, log the run, refine the shot list." },
    ],
  });

  addWorkflow({
    key: "design-claude-build-codex",
    title: "Design UI in Claude, implement in Codex",
    description: "Two-model workflow: design with Claude, implement with Codex.",
    type: "design",
    project: "SmartTrips",
    status: "reliable",
    favorite: true,
    outcome: "A designed + implemented feature with clean handoff.",
    whenToUse: "Feature work where design quality matters.",
    whenNotToUse: "Tiny tweaks — just do them directly.",
    tools: ["Claude Code", "Codex"],
    tags: ["design", "handoff", "two-model"],
    daysAgo: 22,
    steps: [
      { title: "Design with Claude", promptKey: "dashboard-ui", instruction: "Get IA, layout, and component mapping." },
      { title: "Lock the spec", instruction: "Turn the design into a short build spec.", checklist: ["Components listed", "States defined", "Data shape agreed"] },
      { title: "Implement with Codex", promptKey: "saas-bootstrap", instruction: "Hand the spec to Codex for implementation." },
      { title: "Compare + log", promptKey: "compare-models", instruction: "Note what each model did best." },
    ],
  });

  addWorkflow({
    key: "test-new-model",
    title: "Test new AI coding model",
    description: "Standard rubric to evaluate a new coding model on a real task.",
    type: "coding",
    project: "Backend Architecture Lab",
    status: "active",
    outcome: "A scored verdict on whether to adopt a new model.",
    whenToUse: "Whenever a new coding model ships.",
    tools: ["Codex", "Claude Code", "Cursor"],
    tags: ["evaluation", "models"],
    daysAgo: 12,
    steps: [
      { title: "Pick a real task", instruction: "Use an actual task from a current project, not a toy." },
      { title: "Run on each model", instruction: "Same prompt, same context, log each as a prompt run." },
      { title: "Score with the rubric", promptKey: "compare-models", expectedOutput: "Verdict table + best pick." },
    ],
  });

  addWorkflow({
    key: "content-from-dogfooding",
    title: "Create content from product dogfooding",
    description: "Turn your own product usage into authentic content.",
    type: "content",
    project: "DueKind",
    status: "draft",
    outcome: "Authentic content rooted in real usage.",
    whenToUse: "When you used your own product and hit something interesting.",
    tools: ["ChatGPT"],
    tags: ["content", "dogfooding"],
    daysAgo: 6,
    steps: [
      { title: "Capture the moment", instruction: "Note the exact friction or win while it's fresh." },
      { title: "Draft LinkedIn", promptKey: "linkedin-update" },
      { title: "Draft Reddit", promptKey: "reddit-post" },
    ],
  });

  addWorkflow({
    key: "backend-arch-notes",
    title: "Prepare backend architecture notes",
    description: "Build durable architecture notes for a topic you're learning.",
    type: "learning",
    project: "Backend Architecture Lab",
    status: "reliable",
    outcome: "A reusable architecture note + a small build exercise done.",
    whenToUse: "When leveling up a backend topic.",
    tools: ["ChatGPT"],
    tags: ["learning", "backend"],
    daysAgo: 24,
    steps: [
      { title: "Generate the module", promptKey: "backend-learning", expectedOutput: "Mental model + tradeoffs + exercise." },
      { title: "Do the exercise", instruction: "Actually build the <2h exercise.", checklist: ["Build it", "Note 2 surprises", "Write the failure modes"] },
      { title: "Practice system design", promptKey: "system-design", instruction: "Run a related case study." },
    ],
  });

  addWorkflow({
    key: "build-prompt-pack",
    title: "Build a prompt pack for a product",
    description: "Assemble a reusable prompt pack tailored to one product.",
    type: "product-planning",
    status: "active",
    outcome: "A curated collection of prompts ready to reuse for a product.",
    whenToUse: "When starting serious work on a product.",
    tools: ["Claude Code"],
    tags: ["prompts", "pack"],
    daysAgo: 15,
    steps: [
      { title: "List the recurring tasks", instruction: "What will you ask an AI to do 10+ times on this product?" },
      { title: "Adapt base prompts", promptKey: "saas-bootstrap", instruction: "Clone + tailor relevant base prompts." },
      { title: "Group into a collection", instruction: "Create a collection and add the tailored prompts." },
    ],
  });

  /* ------------------------------- Notes --------------------------------- */

  const notes: NewNote[] = [
    { id: randomUUID(), title: "Review prompts used for BurnCap content", body: "Audit which BurnCap content prompts actually performed. Archive the dead ones.", noteType: "task", status: "inbox", priority: "medium", relatedProjectId: P["BurnCap"], dueDate: daysAgo(-2), pinned: false, tags: ["burncap", "audit"], createdAt: daysAgo(4), updatedAt: daysAgo(4) },
    { id: randomUUID(), title: "Create SEO checklist prompt for Eastbase", body: "Turn the SEO setup prompt into a reusable checklist template.", noteType: "task", status: "active", priority: "high", relatedProjectId: P["Eastbase Studio"], relatedPromptId: PID["seo-setup"], dueDate: daysAgo(1), pinned: true, tags: ["seo", "template"], createdAt: daysAgo(6), updatedAt: daysAgo(2) },
    { id: randomUUID(), title: "Prompt pack for launching small SaaS products", body: "A reusable pack: bootstrap → API review → readiness → SEO → marketing → PH.", noteType: "idea", status: "inbox", priority: "high", pinned: true, tags: ["pack", "saas"], createdAt: daysAgo(5), updatedAt: daysAgo(5) },
    { id: randomUUID(), title: "Workflow for comparing Claude Code vs Codex on the same task", body: "Formalize the two-model eval into a repeatable workflow with the rubric prompt.", noteType: "workflow-idea", status: "inbox", priority: "medium", relatedPromptId: PID["compare-models"], pinned: false, tags: ["evaluation", "workflow"], createdAt: daysAgo(7), updatedAt: daysAgo(7) },
    { id: randomUUID(), title: "Add idempotency checklist to backend prompts", body: "Every backend/API prompt should ask: are writes retry-safe? Add to the constraints.", noteType: "technical-note", status: "active", priority: "medium", relatedProjectId: P["Backend Architecture Lab"], pinned: false, tags: ["backend", "idempotency"], createdAt: daysAgo(9), updatedAt: daysAgo(3) },
    { id: randomUUID(), title: "Generate UI polish checklist for shadcn dashboards", body: "A reusable 'make it premium' pass: spacing, empty states, density, motion.", noteType: "prompt-idea", status: "inbox", priority: "medium", relatedProjectId: P["CostTracker"], pinned: false, tags: ["ui", "shadcn", "polish"], createdAt: daysAgo(8), updatedAt: daysAgo(8) },
    { id: randomUUID(), title: "From screenshot → product analysis → marketing video prompt", body: "Pipeline: drop a product screenshot, get analysis, then a generation-ready video prompt.", noteType: "workflow-idea", status: "inbox", priority: "low", relatedProjectId: P["PodCut"], pinned: false, tags: ["video", "pipeline"], createdAt: daysAgo(10), updatedAt: daysAgo(10) },
    { id: randomUUID(), title: "Why personal internal tools are underrated for indie builders", body: "Content angle: the leverage of building your own small tools. Tie to this app.", noteType: "content-idea", status: "inbox", priority: "medium", relatedProjectId: P["Eastbase Studio"], pinned: false, tags: ["content", "indie"], createdAt: daysAgo(3), updatedAt: daysAgo(3) },
    { id: randomUUID(), title: "Ship the prompt run logging habit", body: "Log every meaningful AI task as a run for a week. See what's actually reliable.", noteType: "reminder", status: "inbox", priority: "low", pinned: false, tags: ["habit"], createdAt: daysAgo(1), updatedAt: daysAgo(1) },
    { id: randomUUID(), title: "Read up on Postgres partial indexes", body: "For the notes status filters — partial indexes on inbox/active could help later.", noteType: "learning-note", status: "inbox", priority: "low", relatedProjectId: P["Backend Architecture Lab"], pinned: false, tags: ["postgres", "indexes"], createdAt: daysAgo(11), updatedAt: daysAgo(11) },
  ];

  /* ----------------------------- Templates ------------------------------- */

  const templates: NewTemplate[] = [
    { id: randomUUID(), name: "Coding agent project bootstrap", templateType: "project-bootstrap", description: "Hand a coding agent everything it needs to scaffold a new project.", usageNotes: "Paste your real folder structure for best results.", variables: [{ name: "project_name" }, { name: "tech_stack" }, { name: "core_entities" }, { name: "constraints" }], content: "Bootstrap {{project_name}} using {{tech_stack}}.\nCore entities: {{core_entities}}.\nConstraints: {{constraints}}.\n\nProduce a folder structure, schema, and one working route. No invented packages.", createdAt: daysAgo(60), updatedAt: daysAgo(60) },
    { id: randomUUID(), name: "Claude Code UI redesign", templateType: "coding-agent", description: "Ask Claude Code to redesign a UI with a clear design direction.", variables: [{ name: "target_screen" }, { name: "design_direction" }, { name: "constraints" }], content: "Redesign {{target_screen}}.\nDesign direction: {{design_direction}}.\nConstraints: {{constraints}}.\n\nGive IA, layout, component mapping (shadcn/ui), then implement.", createdAt: daysAgo(40), updatedAt: daysAgo(40) },
    { id: randomUUID(), name: "Codex feature implementation", templateType: "coding-agent", description: "Tight spec → implementation for Codex.", variables: [{ name: "feature_scope" }, { name: "tech_stack" }, { name: "output_format" }], content: "Implement {{feature_scope}} in {{tech_stack}}.\nFollow existing patterns. Surgical changes only.\nOutput: {{output_format}}.", createdAt: daysAgo(38), updatedAt: daysAgo(38) },
    { id: randomUUID(), name: "API review prompt", templateType: "prompt", description: "Reusable API hardening review.", variables: [{ name: "constraints" }], content: "Review all route handlers for auth, validation, rate limiting, idempotency.\nConstraints: {{constraints}}.\nOutput a risk table + diffs for the top 3.", createdAt: daysAgo(35), updatedAt: daysAgo(35) },
    { id: randomUUID(), name: "SEO setup prompt", templateType: "prompt", description: "Pre-launch SEO setup generator.", variables: [{ name: "product_name" }, { name: "domain" }], content: "Produce a pre-launch SEO setup for {{product_name}} ({{domain}}): metadata, sitemap/robots, JSON-LD, OG checklist, 10 keywords.", createdAt: daysAgo(33), updatedAt: daysAgo(33) },
    { id: randomUUID(), name: "Marketing plan prompt", templateType: "content", description: "GTM plan for a solo founder.", variables: [{ name: "product_name" }, { name: "target_user" }], content: "Create a marketing plan for {{product_name}} targeting {{target_user}}: positioning, 3 channels, 4-week calendar, launch sequence, 5 hooks.", createdAt: daysAgo(31), updatedAt: daysAgo(31) },
    { id: randomUUID(), name: "Product research prompt", templateType: "prompt", description: "Structured product/market research.", variables: [{ name: "product_idea" }, { name: "target_user" }], content: "Research {{product_idea}} for {{target_user}}: existing solutions, gaps, pricing norms, top 3 risks, and a wedge to enter.", createdAt: daysAgo(29), updatedAt: daysAgo(29) },
    { id: randomUUID(), name: "Image generation prompt", templateType: "media-generation", description: "Cinematic brand image scaffold.", variables: [{ name: "subject" }, { name: "mood" }, { name: "grade" }], content: "cinematic {{subject}}, {{mood}}, {{grade}} grade, shallow depth of field, premium editorial, 35mm, --ar 16:9 --style raw", createdAt: daysAgo(27), updatedAt: daysAgo(27) },
    { id: randomUUID(), name: "Video generation prompt", templateType: "media-generation", description: "Short generation-ready video prompt with shot list.", variables: [{ name: "subject" }, { name: "mood" }], content: "Cinematic clip of {{subject}}. Mood: {{mood}}.\nShot list: push-in, particle burst on beat, slow-mo hero, logo sting.\nLighting: rim + volumetric. 6 seconds.", createdAt: daysAgo(25), updatedAt: daysAgo(25) },
    { id: randomUUID(), name: "Reddit discussion post", templateType: "content", description: "Discussion-first Reddit post.", variables: [{ name: "subreddit" }, { name: "topic" }], content: "Write a discussion-first post for r/{{subreddit}} about {{topic}}. Lead with a problem, share a lesson, end with a question. No marketing voice.", createdAt: daysAgo(23), updatedAt: daysAgo(23) },
    { id: randomUUID(), name: "LinkedIn post", templateType: "content", description: "Casual human LinkedIn update.", variables: [{ name: "product_name" }, { name: "topic" }], content: "Casual LinkedIn post about {{topic}} on {{product_name}}. Hook line, 2-3 short paragraphs, one concrete detail, soft CTA.", createdAt: daysAgo(21), updatedAt: daysAgo(21) },
    { id: randomUUID(), name: "Backend architecture planning", templateType: "prompt", description: "Plan backend architecture for a small SaaS.", variables: [{ name: "system" }, { name: "constraints" }], content: "Plan the backend architecture for {{system}}. Constraints: {{constraints}}.\nGive components, data flow, 3 tradeoffs, failure modes, and a phased build order.", createdAt: daysAgo(19), updatedAt: daysAgo(19) },
    { id: randomUUID(), name: "System design practice", templateType: "prompt", description: "Generate a system design case to practice.", variables: [{ name: "system" }], content: "Generate a system design case study for {{system}}: requirements, scale estimates, reference architecture, 3 tradeoffs, failure scenarios, and 5 follow-up questions.", createdAt: daysAgo(17), updatedAt: daysAgo(17) },
  ];

  /* ---------------------------- Collections ------------------------------ */

  const collections: NewCollection[] = [];
  const collectionItems: NewCollectionItem[] = [];

  function addCollection(def: {
    name: string;
    description: string;
    type: NewCollection["collectionType"];
    color: string;
    icon?: string;
    items: { type: NewCollectionItem["itemType"]; id: string }[];
  }) {
    const id = randomUUID();
    collections.push({
      id,
      name: def.name,
      description: def.description,
      collectionType: def.type,
      color: def.color,
      icon: def.icon ?? null,
    });
    def.items.forEach((it, i) => {
      collectionItems.push({
        id: randomUUID(),
        collectionId: id,
        itemType: it.type,
        itemId: it.id,
        position: i,
      });
    });
  }

  addCollection({
    name: "SaaS Bootstrap Prompts",
    description: "Everything to take a SaaS from zero to launch-ready.",
    type: "prompt-pack",
    color: "#8b5cf6",
    items: [
      { type: "prompt", id: PID["saas-bootstrap"] },
      { type: "prompt", id: PID["api-review"] },
      { type: "prompt", id: PID["nextjs-readiness"] },
      { type: "prompt", id: PID["seo-setup"] },
      { type: "workflow", id: WID["prepare-saas-launch"] },
    ],
  });

  addCollection({
    name: "Marketing & SEO",
    description: "Plans, posts, and pre-launch SEO.",
    type: "content-pack",
    color: "#f43f5e",
    items: [
      { type: "prompt", id: PID["marketing-plan"] },
      { type: "prompt", id: PID["seo-setup"] },
      { type: "prompt", id: PID["ph-launch"] },
      { type: "prompt", id: PID["reddit-post"] },
      { type: "prompt", id: PID["linkedin-update"] },
    ],
  });

  addCollection({
    name: "Video/Image Generation",
    description: "Media generation prompts + concepts.",
    type: "media-pack",
    color: "#ec4899",
    items: [
      { type: "prompt", id: PID["travel-images"] },
      { type: "prompt", id: PID["lol-video"] },
      { type: "workflow", id: WID["marketing-video-concept"] },
    ],
  });

  addCollection({
    name: "Coding Agent Workflows",
    description: "Repeatable workflows for coding agents.",
    type: "workflow-pack",
    color: "#6366f1",
    items: [
      { type: "workflow", id: WID["start-internal-tool"] },
      { type: "workflow", id: WID["design-claude-build-codex"] },
      { type: "workflow", id: WID["test-new-model"] },
      { type: "prompt", id: PID["compare-models"] },
    ],
  });

  addCollection({
    name: "Eastbase Content",
    description: "The Eastbase content engine.",
    type: "content-pack",
    color: "#a855f7",
    items: [
      { type: "workflow", id: WID["eastbase-blog-repurpose"] },
      { type: "prompt", id: PID["reddit-post"] },
      { type: "prompt", id: PID["linkedin-update"] },
    ],
  });

  addCollection({
    name: "Backend Learning",
    description: "Architecture and system-design practice.",
    type: "learning-pack",
    color: "#10b981",
    items: [
      { type: "prompt", id: PID["backend-learning"] },
      { type: "prompt", id: PID["system-design"] },
      { type: "workflow", id: WID["backend-arch-notes"] },
    ],
  });

  addCollection({
    name: "Product Research",
    description: "Research and planning prompts.",
    type: "prompt-pack",
    color: "#06b6d4",
    items: [
      { type: "prompt", id: PID["marketing-plan"] },
      { type: "prompt", id: PID["dashboard-ui"] },
    ],
  });

  return {
    projects,
    prompts,
    promptVersions,
    promptRuns,
    workflows,
    workflowSteps,
    notes,
    templates,
    collections,
    collectionItems,
  };
}

import type { LucideIcon } from "lucide-react";
import {
  Bot,
  Boxes,
  Braces,
  Brain,
  Bug,
  Clapperboard,
  Code2,
  Database,
  FileText,
  FlaskConical,
  GraduationCap,
  Image as ImageIcon,
  Layers,
  Lightbulb,
  ListChecks,
  Megaphone,
  MessageSquare,
  Network,
  Package,
  PenLine,
  Rocket,
  Search,
  Server,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  TerminalSquare,
  TestTube2,
  Wand2,
  Wrench,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Accent system (the app's category/status color language)                   */
/* -------------------------------------------------------------------------- */

export type Accent =
  | "violet"
  | "teal"
  | "blue"
  | "amber"
  | "rose"
  | "emerald"
  | "cyan"
  | "indigo"
  | "orange"
  | "pink"
  | "slate";

export const accentBadge: Record<Accent, string> = {
  violet: "border-violet-500/25 bg-violet-500/10 text-violet-300",
  teal: "border-teal-500/25 bg-teal-500/10 text-teal-300",
  blue: "border-blue-500/25 bg-blue-500/10 text-blue-300",
  amber: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  rose: "border-rose-500/25 bg-rose-500/10 text-rose-300",
  emerald: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  cyan: "border-cyan-500/25 bg-cyan-500/10 text-cyan-300",
  indigo: "border-indigo-500/25 bg-indigo-500/10 text-indigo-300",
  orange: "border-orange-500/25 bg-orange-500/10 text-orange-300",
  pink: "border-pink-500/25 bg-pink-500/10 text-pink-300",
  slate: "border-slate-500/25 bg-slate-500/10 text-slate-300",
};

export const accentDot: Record<Accent, string> = {
  violet: "bg-violet-400",
  teal: "bg-teal-400",
  blue: "bg-blue-400",
  amber: "bg-amber-400",
  rose: "bg-rose-400",
  emerald: "bg-emerald-400",
  cyan: "bg-cyan-400",
  indigo: "bg-indigo-400",
  orange: "bg-orange-400",
  pink: "bg-pink-400",
  slate: "bg-slate-400",
};

export const accentText: Record<Accent, string> = {
  violet: "text-violet-300",
  teal: "text-teal-300",
  blue: "text-blue-300",
  amber: "text-amber-300",
  rose: "text-rose-300",
  emerald: "text-emerald-300",
  cyan: "text-cyan-300",
  indigo: "text-indigo-300",
  orange: "text-orange-300",
  pink: "text-pink-300",
  slate: "text-slate-300",
};

export type Option<T extends string = string> = {
  value: T;
  label: string;
  accent: Accent;
  icon?: LucideIcon;
  hint?: string;
};

function index<T extends string>(opts: Option<T>[]): Record<T, Option<T>> {
  return Object.fromEntries(opts.map((o) => [o.value, o])) as Record<
    T,
    Option<T>
  >;
}

/* -------------------------------------------------------------------------- */
/*  Projects                                                                    */
/* -------------------------------------------------------------------------- */

export const PROJECT_TYPES: Option[] = [
  { value: "personal", label: "Personal", accent: "violet" },
  { value: "commercial", label: "Commercial", accent: "emerald" },
  { value: "internal-tool", label: "Internal Tool", accent: "blue" },
  { value: "devtool", label: "Dev Tool", accent: "cyan" },
  { value: "content", label: "Content", accent: "amber" },
  { value: "learning", label: "Learning", accent: "teal" },
  { value: "experiment", label: "Experiment", accent: "pink" },
  { value: "other", label: "Other", accent: "slate" },
];

export const PROJECT_STATUSES: Option[] = [
  { value: "active", label: "Active", accent: "emerald" },
  { value: "paused", label: "Paused", accent: "amber" },
  { value: "archived", label: "Archived", accent: "slate" },
];

/* -------------------------------------------------------------------------- */
/*  Prompts                                                                     */
/* -------------------------------------------------------------------------- */

export const PROMPT_CATEGORIES: Option[] = [
  { value: "coding-agent", label: "Coding Agent", accent: "violet", icon: Bot },
  { value: "project-bootstrap", label: "Project Bootstrap", accent: "indigo", icon: Rocket },
  { value: "ui-design", label: "UI Design", accent: "pink", icon: Wand2 },
  { value: "frontend", label: "Frontend", accent: "cyan", icon: Code2 },
  { value: "backend", label: "Backend", accent: "teal", icon: Server },
  { value: "database", label: "Database", accent: "emerald", icon: Database },
  { value: "api-review", label: "API Review", accent: "blue", icon: Network },
  { value: "testing", label: "Testing", accent: "amber", icon: TestTube2 },
  { value: "refactor", label: "Refactor", accent: "orange", icon: Wrench },
  { value: "seo", label: "SEO", accent: "emerald", icon: Search },
  { value: "marketing", label: "Marketing", accent: "rose", icon: Megaphone },
  { value: "social-post", label: "Social Post", accent: "pink", icon: Share2 },
  { value: "blog-writing", label: "Blog Writing", accent: "amber", icon: PenLine },
  { value: "product-research", label: "Product Research", accent: "blue", icon: Search },
  { value: "image-generation", label: "Image Generation", accent: "violet", icon: ImageIcon },
  { value: "video-generation", label: "Video Generation", accent: "rose", icon: Clapperboard },
  { value: "system-design", label: "System Design", accent: "indigo", icon: Network },
  { value: "learning", label: "Learning", accent: "teal", icon: GraduationCap },
  { value: "debugging", label: "Debugging", accent: "orange", icon: Bug },
  { value: "code-review", label: "Code Review", accent: "blue", icon: ListChecks },
  { value: "other", label: "Other", accent: "slate", icon: Sparkles },
];

export const PROMPT_INTENTS: Option[] = [
  { value: "generate-code", label: "Generate Code", accent: "violet", icon: Code2 },
  { value: "review-code", label: "Review Code", accent: "blue", icon: ListChecks },
  { value: "plan-project", label: "Plan Project", accent: "indigo", icon: Target },
  { value: "design-ui", label: "Design UI", accent: "pink", icon: Wand2 },
  { value: "write-content", label: "Write Content", accent: "amber", icon: PenLine },
  { value: "research", label: "Research", accent: "blue", icon: Search },
  { value: "summarize", label: "Summarize", accent: "teal", icon: FileText },
  { value: "debug", label: "Debug", accent: "orange", icon: Bug },
  { value: "generate-media", label: "Generate Media", accent: "rose", icon: ImageIcon },
  { value: "teach", label: "Teach", accent: "emerald", icon: GraduationCap },
  { value: "brainstorm", label: "Brainstorm", accent: "cyan", icon: Lightbulb },
  { value: "other", label: "Other", accent: "slate", icon: Sparkles },
];

export const TARGET_TOOLS: Option[] = [
  { value: "Codex", label: "Codex", accent: "emerald", icon: TerminalSquare },
  { value: "Claude Code", label: "Claude Code", accent: "orange", icon: Bot },
  { value: "Cursor", label: "Cursor", accent: "cyan", icon: Code2 },
  { value: "ChatGPT", label: "ChatGPT", accent: "teal", icon: MessageSquare },
  { value: "Gemini", label: "Gemini", accent: "blue", icon: Sparkles },
  { value: "image-model", label: "Image Model", accent: "violet", icon: ImageIcon },
  { value: "video-model", label: "Video Model", accent: "rose", icon: Clapperboard },
  { value: "other", label: "Other", accent: "slate", icon: Wand2 },
];

export const PROMPT_STATUSES: Option[] = [
  { value: "draft", label: "Draft", accent: "slate" },
  { value: "tested", label: "Tested", accent: "blue" },
  { value: "reliable", label: "Reliable", accent: "emerald" },
  { value: "needs-improvement", label: "Needs Work", accent: "amber" },
  { value: "archived", label: "Archived", accent: "slate" },
];

export const RUN_RESULTS: Option[] = [
  { value: "excellent", label: "Excellent", accent: "emerald" },
  { value: "good", label: "Good", accent: "teal" },
  { value: "usable-with-edits", label: "Usable w/ Edits", accent: "amber" },
  { value: "poor", label: "Poor", accent: "orange" },
  { value: "failed", label: "Failed", accent: "rose" },
];

/* -------------------------------------------------------------------------- */
/*  Workflows                                                                   */
/* -------------------------------------------------------------------------- */

export const WORKFLOW_TYPES: Option[] = [
  { value: "coding", label: "Coding", accent: "violet", icon: Code2 },
  { value: "design", label: "Design", accent: "pink", icon: Wand2 },
  { value: "product-planning", label: "Product Planning", accent: "indigo", icon: Target },
  { value: "marketing", label: "Marketing", accent: "rose", icon: Megaphone },
  { value: "seo", label: "SEO", accent: "emerald", icon: Search },
  { value: "research", label: "Research", accent: "blue", icon: Search },
  { value: "launch", label: "Launch", accent: "amber", icon: Rocket },
  { value: "content", label: "Content", accent: "amber", icon: PenLine },
  { value: "debugging", label: "Debugging", accent: "orange", icon: Bug },
  { value: "learning", label: "Learning", accent: "teal", icon: GraduationCap },
  { value: "other", label: "Other", accent: "slate", icon: Layers },
];

export const WORKFLOW_STATUSES: Option[] = [
  { value: "draft", label: "Draft", accent: "slate" },
  { value: "active", label: "Active", accent: "blue" },
  { value: "reliable", label: "Reliable", accent: "emerald" },
  { value: "needs-improvement", label: "Needs Work", accent: "amber" },
  { value: "archived", label: "Archived", accent: "slate" },
];

/* -------------------------------------------------------------------------- */
/*  Notes / Tasks                                                               */
/* -------------------------------------------------------------------------- */

export const NOTE_TYPES: Option[] = [
  { value: "quick-note", label: "Quick Note", accent: "slate", icon: FileText },
  { value: "task", label: "Task", accent: "blue", icon: ListChecks },
  { value: "idea", label: "Idea", accent: "amber", icon: Lightbulb },
  { value: "product-idea", label: "Product Idea", accent: "violet", icon: Rocket },
  { value: "content-idea", label: "Content Idea", accent: "rose", icon: PenLine },
  { value: "prompt-idea", label: "Prompt Idea", accent: "cyan", icon: Sparkles },
  { value: "workflow-idea", label: "Workflow Idea", accent: "teal", icon: Layers },
  { value: "technical-note", label: "Technical Note", accent: "indigo", icon: Braces },
  { value: "reminder", label: "Reminder", accent: "orange", icon: Target },
  { value: "learning-note", label: "Learning Note", accent: "emerald", icon: GraduationCap },
  { value: "other", label: "Other", accent: "slate", icon: FileText },
];

export const NOTE_STATUSES: Option[] = [
  { value: "inbox", label: "Inbox", accent: "blue" },
  { value: "active", label: "Active", accent: "violet" },
  { value: "done", label: "Done", accent: "emerald" },
  { value: "converted", label: "Converted", accent: "teal" },
  { value: "archived", label: "Archived", accent: "slate" },
];

export const PRIORITIES: Option[] = [
  { value: "low", label: "Low", accent: "slate" },
  { value: "medium", label: "Medium", accent: "amber" },
  { value: "high", label: "High", accent: "rose" },
];

/* -------------------------------------------------------------------------- */
/*  Templates / Collections                                                     */
/* -------------------------------------------------------------------------- */

export const TEMPLATE_TYPES: Option[] = [
  { value: "prompt", label: "Prompt", accent: "violet", icon: Sparkles },
  { value: "workflow", label: "Workflow", accent: "teal", icon: Layers },
  { value: "note", label: "Note", accent: "slate", icon: FileText },
  { value: "task", label: "Task", accent: "blue", icon: ListChecks },
  { value: "project-bootstrap", label: "Project Bootstrap", accent: "indigo", icon: Rocket },
  { value: "coding-agent", label: "Coding Agent", accent: "violet", icon: Bot },
  { value: "media-generation", label: "Media Generation", accent: "rose", icon: ImageIcon },
  { value: "content", label: "Content", accent: "amber", icon: PenLine },
  { value: "other", label: "Other", accent: "slate", icon: FlaskConical },
];

export const COLLECTION_TYPES: Option[] = [
  { value: "prompt-pack", label: "Prompt Pack", accent: "violet", icon: Sparkles },
  { value: "workflow-pack", label: "Workflow Pack", accent: "teal", icon: Layers },
  { value: "project-pack", label: "Project Pack", accent: "indigo", icon: Boxes },
  { value: "content-pack", label: "Content Pack", accent: "amber", icon: PenLine },
  { value: "media-pack", label: "Media Pack", accent: "rose", icon: ImageIcon },
  { value: "learning-pack", label: "Learning Pack", accent: "emerald", icon: GraduationCap },
  { value: "other", label: "Other", accent: "slate", icon: Package },
];

export const COLLECTION_ITEM_TYPES: Option[] = [
  { value: "prompt", label: "Prompt", accent: "violet", icon: Sparkles },
  { value: "workflow", label: "Workflow", accent: "teal", icon: Layers },
  { value: "template", label: "Template", accent: "amber", icon: FileText },
  { value: "note", label: "Note", accent: "blue", icon: ListChecks },
];

/* -------------------------------------------------------------------------- */
/*  Lookup maps                                                                 */
/* -------------------------------------------------------------------------- */

export const projectTypeMap = index(PROJECT_TYPES);
export const projectStatusMap = index(PROJECT_STATUSES);
export const promptCategoryMap = index(PROMPT_CATEGORIES);
export const promptIntentMap = index(PROMPT_INTENTS);
export const targetToolMap = index(TARGET_TOOLS);
export const promptStatusMap = index(PROMPT_STATUSES);
export const runResultMap = index(RUN_RESULTS);
export const workflowTypeMap = index(WORKFLOW_TYPES);
export const workflowStatusMap = index(WORKFLOW_STATUSES);
export const noteTypeMap = index(NOTE_TYPES);
export const noteStatusMap = index(NOTE_STATUSES);
export const priorityMap = index(PRIORITIES);
export const templateTypeMap = index(TEMPLATE_TYPES);
export const collectionTypeMap = index(COLLECTION_TYPES);
export const collectionItemTypeMap = index(COLLECTION_ITEM_TYPES);

export function optionLabel(map: Record<string, Option>, value: string | null) {
  if (!value) return "—";
  return map[value]?.label ?? value;
}

/* Curated palette for project/collection color pickers */
export const COLOR_SWATCHES = [
  "#8b5cf6", // violet
  "#14b8a6", // teal
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#f43f5e", // rose
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#6366f1", // indigo
  "#ec4899", // pink
  "#f97316", // orange
];

/* Editor scaffold snippets — inserted by the prompt editor helpers */
export const EDITOR_SECTIONS = {
  role: "## Role\nYou are a {{role}} with deep expertise in {{domain}}.\n",
  context:
    "## Context\n- Project: {{project_name}}\n- Tech stack: {{tech_stack}}\n- Current state: {{current_state}}\n",
  constraints:
    "## Constraints\n- Do not {{constraint}}\n- Keep changes surgical and scoped\n- Follow existing patterns in the codebase\n",
  output:
    "## Output Requirements\n- Format: {{output_format}}\n- Include: {{must_include}}\n- Exclude: {{must_exclude}}\n",
  checklist:
    "## Checklist\n- [ ] {{item_1}}\n- [ ] {{item_2}}\n- [ ] {{item_3}}\n",
  examples:
    "## Examples\n**Input:** {{example_input}}\n\n**Expected output:** {{example_output}}\n",
} as const;

export const EDITOR_SECTION_LABELS: { key: keyof typeof EDITOR_SECTIONS; label: string; icon: LucideIcon }[] = [
  { key: "role", label: "Role", icon: Brain },
  { key: "context", label: "Context", icon: Layers },
  { key: "constraints", label: "Constraints", icon: ShieldCheck },
  { key: "output", label: "Output", icon: Target },
  { key: "checklist", label: "Checklist", icon: ListChecks },
  { key: "examples", label: "Examples", icon: FileText },
];

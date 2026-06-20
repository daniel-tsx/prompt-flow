# PromptFlow Library

A personal **AI command library** — store, organize, version, reuse, and evaluate the prompts, workflows, notes, and ideas you use across Codex, Claude Code, Cursor, ChatGPT, and image/video models. Not a SaaS; a serious single-user operating system for prompt work, with a fast capture inbox built in.

> Status: `current`. Dark productivity cockpit. Desktop-first, responsive.

## Stack

- **Next.js 16** (App Router, Server Actions) · **TypeScript** · **React 19**
- **Tailwind CSS v4** + **shadcn/ui** (base-ui primitives, `nova` style)
- **Drizzle ORM** on **Neon** (PostgreSQL)
- **React Hook Form + Zod**, **Recharts**, **date-fns**, **lucide-react**
- Markdown editor/preview (`react-markdown` + `remark-gfm`), command palette (`cmdk`), toasts (`sonner`)

Structured so **BetterAuth** (per-user auth) and **AI features** can be added later without a rewrite.

## Getting started

```bash
pnpm install

# 1. Add your connection string + passcode
cp .env.example .env.local
#    DATABASE_URL  → your Neon (or any Postgres) connection string
#    OWNER_PASSCODE → the secret for your private account (choose your own)

# 2. Create the schema and load the demo data
pnpm db:push      # push the Drizzle schema to your database
pnpm db:seed      # seed the read-only DEMO account (11 projects, 15 prompts, …)

# 3. Run it
pnpm dev          # http://localhost:3000  → /unlock
```

You need a `DATABASE_URL` before the app will load — get a free Postgres database at [neon.tech](https://neon.tech). Without it, every page shows a friendly "connect a database" screen.

## Two accounts (lightweight passcode gate — no full auth)

Opening the app shows an **/unlock** screen:

- **Enter your `OWNER_PASSCODE`** → your private, fully editable library.
- **"See the demo"** → the seeded, **read-only** showcase account.

Both accounts live in the same database, partitioned by an `account` column; every query is scoped and every write is owner-only. The owner cookie is `sha256(OWNER_PASSCODE)`, so it can't be forged. `pnpm db:seed` only touches the demo account — your owner data is never wiped. Structured so BetterAuth can replace the gate later without schema changes.

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm db:generate` | Generate a SQL migration from the schema |
| `pnpm db:push` | Push the schema directly (fastest for personal use) |
| `pnpm db:migrate` | Apply generated migrations |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm db:seed` | Reset + load demo data |

## What's inside

- **Dashboard** — counters, prompt-quality trend, runs-by-tool, category distribution, inbox pressure, most-successful / needs-improvement prompts, top projects.
- **Prompts** — card/table library with filters & search; detail with 7 tabs (overview, current, **versions** w/ line-diff, **runs**, notes, workflows, project); markdown editor with section helpers and scores.
- **Workflows** — builder with reorderable steps + linked prompts; detail step-runner with progress and copy-to-clipboard.
- **Inbox & Tasks** — global quick capture (⌘⇧N), 9 inbox views, convert notes → prompt/workflow/template, tasks grouped by due date.
- **Templates** — reusable templates with `{{variables}}`; create prompt/workflow from a template.
- **Collections** — curated packs; export a pack as Markdown.
- **Projects · Runs · Reports · Settings** — project hubs, run log, library-health analytics, JSON/Markdown/CSV import & export.

### Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `⌘/Ctrl + K` | Command palette (search + create + copy recent prompt) |
| `⌘/Ctrl + ⇧ + N` | Quick capture (note) |
| `⌘/Ctrl + ⇧ + P` | New prompt |
| `⌘/Ctrl + ⇧ + T` | New task |
| `⌘/Ctrl + ↵` | Save in an editor |

## Architecture

```
app/                 # routes — (app)/ group holds the shell + all feature pages
  (app)/layout.tsx   # cockpit shell (sidebar, top bar, command palette, quick capture)
components/          # layout, forms, editor, prompts, workflows, notes, runs, charts, shared, settings
db/
  schema.ts          # Drizzle schema (10 entities + collection items)
  queries/           # all reads (prompts, workflows, notes, runs, stats, search, …)
  index.ts           # lazy Neon client (never throws at build time)
lib/
  validations/       # Zod schemas
  scoring.ts         # reliability, usefulness, workflow maturity, inbox pressure, prompt health
  actions/           # Server Actions (mutations) per entity + import/export
  export.ts          # JSON / Markdown / CSV builders
  constants.ts       # enum options → labels, accent colors, icons (the design language)
seed/                # seed runner   ·   lib/seed-data/ holds the data
```

All data access lives in `db/queries`; all mutations are Server Actions in `lib/actions`; calculated metrics live in `lib/scoring`. Pages are `force-dynamic` (personal data), and the database client is lazy so `pnpm build` works without a connection.

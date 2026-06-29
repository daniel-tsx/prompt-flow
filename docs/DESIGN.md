# DESIGN.md

Status: `current`. The source of truth is `app/globals.css` (Tailwind v4 `@theme`) + `lib/constants.ts` (accent language). This documents intent.

## Theme

Dark by default — earned, not reflexive: a builder in a dim room at night wants a low-luminance instrument panel, not a white page. Light theme exists and is usable but secondary.

## Color (OKLCH, tinted neutrals)

Strategy: **Restrained.** Tinted blue-violet neutrals carry the surface; one violet accent does the lifting; a small accent set marks meaning only.

- **Base:** deep blue-violet near-black `oklch(0.17 0.015 280)`; elevated surfaces step up in L. Every neutral is tinted toward 280 hue (never pure `#000`/`#fff`).
- **Primary:** violet `oklch(0.66 0.19 292)`.
- **Meaning accents** (`lib/constants.ts`): violet, teal, blue, amber, rose, emerald, cyan, indigo, orange, pink, slate. Used as low-alpha badges (`border/bg/text` at ~10–25%) to encode category, intent, tool, status, score tier. Never decorative.
- **Charts:** `--chart-1..5` = violet, teal, blue, amber, rose for sequential/trend series. Distribution charts (runs-by-tool, category composition) instead color each bar/segment by its **meaning accent** via `accentHex` (the `-400` family mirroring `accentDot`), so the data ties back to the rest of the UI.

## Typography

- **Sans:** Geist. **Mono:** Geist Mono (prompt text, codes, tabular metrics).
- Hierarchy by scale + weight; headings carry tight tracking (`tracking-tight`). Numbers use `tabular-nums`.
- Body line length capped; prose lives in `.markdown-body`.

## Elevation & shape

- Radius scale from `--radius` (0.625rem). Cards/inputs share the family; pills are full-round.
- Elevation is subtle: hairline borders (`oklch(1 0 0 / ~9%)`) + faint shadow on raised cards. No heavy drop shadows, no glass-by-default (backdrop-blur only on sticky chrome).

## Motion

- Short, ease-out. Color/opacity/transform only — never animate layout. No bounce.

## Components

shadcn/ui on **base-ui** primitives (`nova` style). Composition uses `render`, not `asChild`. Shared building blocks: `PageHeader`/`PageContainer`, `StatCard`, `OptionBadge`, `ScoreBadge`, `Card`, `EmptyState`, command palette, quick capture.

## Brand mark

Constructed "P" with a teal command-prompt caret + cursor dot in its counter. Static +
subtle animated SVG; one source of truth in `lib/brand/mark.ts`. See
`docs/architecture/logo-brand-notes.md`.

## Bans (project-specific)

- No side-stripe (`border-l` accent) cards/callouts.
- No gradient text.
- No gradient hero-metric numbers.
- No identical icon+heading+text card grids as filler.

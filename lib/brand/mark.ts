/**
 * PromptFlow brand mark — single source of truth for geometry + color.
 *
 * The mark is a constructed capital "P" whose bowl-counter holds a teal command
 * prompt: a caret `>` and a cursor dot — "the place where you type, and the entry
 * it produces." It reads as one engineered glyph, not a letter dropped in a tile.
 *
 * Consumed by both `components/brand-logo.tsx` (JSX) and `scripts/gen-brand.mts`
 * (static SVG strings) so the in-app logo, the standalone files, and the favicons
 * are pixel-identical. Geometry lives in `markGeo`; nothing else hardcodes coords.
 *
 * viewBox is "0 0 64 64". The glyph is shifted -1.5 in x for optical centering.
 */

export const brand = {
  violetFrom: "#a78bfa", // violet-300 — top-left of the P gradient
  violetTo: "#7c3aed", // violet-600 — bottom-right of the P gradient
  violetFlat: "#8b5cf6", // violet-400/500 — flat fill for favicons / mono
  teal: "#2dd4bf", // teal-400 — prompt accent on dark surfaces
  tealOnLight: "#14b8a6", // teal-500 — AA-legible accent on near-white
  cockpit: "#15131d", // base near-black (app background)
  cockpitTile: "#1d1a28", // elevated tile (app-icon container)
  onDark: "#ece9f5", // wordmark color on dark
} as const;

export const markGeo = {
  shiftX: -1.5,
  gradient: { x1: 16, y1: 11, x2: 50, y2: 52 },
  stem: { x: 16, y: 11, w: 10, h: 42, rx: 3 },
  // Bowl as a single filled D-ring (outer D + inner counter hole, even-odd).
  bowl: "M22 11 H34 A18 18 0 0 1 34 47 H22 Z M26 20 H34 A9 9 0 0 1 34 38 H26 Z",
  caret: "M28.5 23.5 L35.5 29 L28.5 34.5",
  dot: { cx: 40, cy: 29, r: 1.9 },
  caretLen: 18, // ~path length of `caret`, for stroke-dash draw
} as const;

/**
 * Mount animation for the animated mark: the caret is "typed" in (stroke draw),
 * the cursor dot lands (pop), then one soft cursor pulse settles. Plays once — no
 * perpetual motion. Fully static (and complete) under reduced-motion or no-CSS.
 * GPU-cheap: opacity + transform + stroke-dashoffset only.
 */
export const markAnimationCss = `
@media (prefers-reduced-motion: no-preference) {
  .pf-caret { stroke-dasharray: ${markGeo.caretLen}; stroke-dashoffset: ${markGeo.caretLen}; animation: pf-draw 0.55s 0.12s ease-out forwards; }
  .pf-dot { opacity: 0; transform: scale(0.5); transform-box: fill-box; transform-origin: center; animation: pf-pop 0.22s 0.62s ease-out forwards; }
  .pf-accent { animation: pf-settle 1.4s 1s ease-in-out 1; }
}
@keyframes pf-draw { to { stroke-dashoffset: 0; } }
@keyframes pf-pop { to { opacity: 1; transform: scale(1); } }
@keyframes pf-settle { 0%, 100% { opacity: 1; } 50% { opacity: 0.82; } }
`.trim();

type MarkOptions = {
  /** unique suffix for the gradient id (avoid collisions when inlined repeatedly) */
  idSuffix: string;
  /** flat violet fill instead of the gradient (favicon / mono contexts) */
  flat?: boolean;
  /** override the flat fill color (mono-white / mono-violet variants) */
  flatColor?: string;
  /** teal accent color */
  teal?: string;
  /** include the cursor dot (dropped at favicon scale) */
  withDot?: boolean;
  /** caret stroke width (slightly bolder for tiny favicons) */
  caretWidth?: number;
  /** embed the mount animation (style + classes) */
  animated?: boolean;
};

/** Inner markup of the mark (no <svg> wrapper). Shared by the generator + files. */
export function markInnerSvg(opts: MarkOptions): string {
  const {
    idSuffix,
    flat = false,
    flatColor = brand.violetFlat,
    teal = brand.teal,
    withDot = true,
    caretWidth = 4,
    animated = false,
  } = opts;
  const g = markGeo;
  const id = `pfp-${idSuffix}`;
  const fill = flat ? flatColor : `url(#${id})`;
  const defs = flat
    ? ""
    : `<defs><linearGradient id="${id}" x1="${g.gradient.x1}" y1="${g.gradient.y1}" x2="${g.gradient.x2}" y2="${g.gradient.y2}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${brand.violetFrom}"/><stop offset="1" stop-color="${brand.violetTo}"/></linearGradient></defs>`;
  const style = animated ? `<style>${markAnimationCss}</style>` : "";
  const caretCls = animated ? ' class="pf-caret"' : "";
  const dot = withDot
    ? `<circle${animated ? ' class="pf-dot"' : ""} cx="${g.dot.cx}" cy="${g.dot.cy}" r="${g.dot.r}" fill="${teal}"/>`
    : "";
  return (
    `${style}${defs}<g transform="translate(${g.shiftX} 0)">` +
    `<g fill="${fill}">` +
    `<rect x="${g.stem.x}" y="${g.stem.y}" width="${g.stem.w}" height="${g.stem.h}" rx="${g.stem.rx}"/>` +
    `<path fill-rule="evenodd" d="${g.bowl}"/>` +
    `</g>` +
    `<g${animated ? ' class="pf-accent"' : ""}>` +
    `<path${caretCls} d="${g.caret}" fill="none" stroke="${teal}" stroke-width="${caretWidth}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `${dot}` +
    `</g>` +
    `</g>`
  );
}

/** Full standalone <svg> for the mark. */
export function markSvg(opts: MarkOptions & { size?: number }): string {
  const { size = 64, ...inner } = opts;
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="PromptFlow">${markInnerSvg(inner)}</svg>`;
}

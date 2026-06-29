/**
 * Generates the full PromptFlow brand asset set from the single source of truth
 * in `lib/brand/mark.ts`. Run: pnpm gen:brand
 *
 * SVG (vector, crisp everywhere):
 *   app/icon.svg                       browser SVG favicon (simplified mark)
 *   public/logo.svg                    primary static mark, full color
 *   public/logo-animated.svg           animated mark (CSS, reduced-motion safe)
 *   public/brand/mark-light.svg        full mark with light-bg teal
 *   public/brand/mark-mono-white.svg   single-color white glyph
 *   public/brand/mark-mono-violet.svg  single-color violet glyph
 *
 * Raster (rasterized with resvg):
 *   app/favicon.ico                    16/32/48 multi-res (simplified mark)
 *   app/apple-icon.png                 180, full mark on full-bleed cockpit tile
 *   app/opengraph-image.png            1200x630 link-preview card
 *   public/favicon-16x16.png           simplified mark, transparent
 *   public/favicon-32x32.png           simplified mark, transparent
 *   public/icon-192.png                full mark on rounded cockpit tile
 *   public/icon-512.png                full mark on rounded cockpit tile
 *   public/icon-maskable-512.png       maskable safe-area variant
 *   public/logo-256.png                full mark, transparent
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import pngToIco from "png-to-ico";
import { brand, markInnerSvg, markSvg } from "../lib/brand/mark";

const root = resolve(import.meta.dirname, "..");
const out = (p: string) => resolve(root, p);
mkdirSync(out("public/brand"), { recursive: true });

const SVG_OPEN = `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="PromptFlow">`;

/** Full mark on a cockpit tile, optionally rounded; mark centered with padding. */
function tileSvg(opts: { rx?: number; scale?: number; teal?: string; glow?: boolean }) {
  const { rx = 0, scale = 0.82, teal = brand.teal, glow = true } = opts;
  // place the glyph (bbox center ~32.5,32) at the tile center with `scale`.
  const wrap = `translate(32 32) scale(${scale}) translate(-32.5 -32)`;
  const defs = glow
    ? `<defs><radialGradient id="tileGlow" cx="28%" cy="20%" r="80%"><stop offset="0" stop-color="#8b5cf6" stop-opacity="0.16"/><stop offset="60%" stop-color="#8b5cf6" stop-opacity="0"/></radialGradient></defs>`
    : "";
  return (
    SVG_OPEN +
    defs +
    `<rect width="64" height="64" rx="${rx}" fill="${brand.cockpitTile}"/>` +
    (glow ? `<rect width="64" height="64" rx="${rx}" fill="url(#tileGlow)"/>` : "") +
    `<g transform="${wrap}">${markInnerSvg({ idSuffix: "tile", teal })}</g>` +
    `</svg>`
  );
}

function render(svg: string, size: number, background?: string): Buffer {
  const r = new Resvg(svg, {
    background,
    fitTo: { mode: "width", value: size },
    font: { loadSystemFonts: true },
  });
  return Buffer.from(r.render().asPng());
}

/* ---- standalone SVG files ---- */
const simplified = SVG_OPEN + markInnerSvg({ idSuffix: "fav", flat: true, withDot: false, caretWidth: 4.5 }) + `</svg>`;
writeFileSync(out("app/icon.svg"), simplified + "\n");
writeFileSync(out("public/logo.svg"), markSvg({ idSuffix: "logo", size: 512 }) + "\n");
writeFileSync(out("public/logo-animated.svg"), markSvg({ idSuffix: "anim", size: 512, animated: true }) + "\n");
writeFileSync(out("public/brand/mark-light.svg"), markSvg({ idSuffix: "light", size: 512, teal: brand.tealOnLight }) + "\n");
writeFileSync(out("public/brand/mark-mono-white.svg"), markSvg({ idSuffix: "w", size: 512, flat: true, flatColor: "#ffffff", teal: "#ffffff" }) + "\n");
writeFileSync(out("public/brand/mark-mono-violet.svg"), markSvg({ idSuffix: "v", size: 512, flat: true, flatColor: brand.violetFlat, teal: brand.violetFlat }) + "\n");

/* ---- favicons (simplified, transparent) ---- */
const ico = await pngToIco([16, 32, 48].map((s) => render(simplified, s)));
writeFileSync(out("app/favicon.ico"), ico);
writeFileSync(out("public/favicon-16x16.png"), render(simplified, 16));
writeFileSync(out("public/favicon-32x32.png"), render(simplified, 32));

/* ---- full mark, transparent ---- */
writeFileSync(out("public/logo-256.png"), render(markSvg({ idSuffix: "p256", size: 512 }), 256));

/* ---- app-icon tiles ---- */
writeFileSync(out("app/apple-icon.png"), render(tileSvg({ rx: 0, scale: 0.82 }), 180)); // iOS masks corners
writeFileSync(out("public/icon-192.png"), render(tileSvg({ rx: 13, scale: 0.82 }), 192));
writeFileSync(out("public/icon-512.png"), render(tileSvg({ rx: 13, scale: 0.82 }), 512));
writeFileSync(out("public/icon-maskable-512.png"), render(tileSvg({ rx: 0, scale: 0.62 }), 512));

/* ---- Open Graph card ---- */
const og = `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="ogA" cx="14%" cy="0%" r="70%"><stop offset="0" stop-color="#8b5cf6" stop-opacity="0.16"/><stop offset="60%" stop-color="#8b5cf6" stop-opacity="0"/></radialGradient>
    <radialGradient id="ogB" cx="100%" cy="0%" r="55%"><stop offset="0" stop-color="#2dd4bf" stop-opacity="0.10"/><stop offset="55%" stop-color="#2dd4bf" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1200" height="630" fill="${brand.cockpit}"/>
  <rect width="1200" height="630" fill="url(#ogA)"/>
  <rect width="1200" height="630" fill="url(#ogB)"/>
  <g transform="translate(118 300) scale(3.3) translate(-32.5 -32)">${markInnerSvg({ idSuffix: "og" })}</g>
  <text x="372" y="298" font-family="Geist, 'Segoe UI', Arial, sans-serif" font-size="90" fill="${brand.onDark}" letter-spacing="-2"><tspan font-weight="500">Prompt</tspan><tspan font-weight="700">Flow</tspan></text>
  <text x="375" y="352" font-family="'Geist Mono', Consolas, monospace" font-size="26" letter-spacing="7" fill="#a78bfa">COMMAND&#160;LIBRARY</text>
  <text x="375" y="404" font-family="Geist, 'Segoe UI', Arial, sans-serif" font-size="29" fill="#9b95ad">Store, version, and reuse your AI prompts.</text>
</svg>`;
writeFileSync(out("app/opengraph-image.png"), render(og, 1200));

console.log("✔ brand assets written (app/, public/, public/brand/)");

// Generates app/favicon.ico, app/apple-icon.png, and public/logo-256.png
// from public/logo.svg. Run: pnpm gen:favicon
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import pngToIco from "png-to-ico";

const root = resolve(import.meta.dirname, "..");
const svg = readFileSync(resolve(root, "public/logo.svg"), "utf8");

// Apple touch icon: full-bleed (iOS applies its own rounded mask), no transparent corners.
const appleSvg = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="pfTile" cx="32%" cy="24%" r="85%">
      <stop offset="0%" stop-color="#a78bfa" />
      <stop offset="52%" stop-color="#7c3aed" />
      <stop offset="100%" stop-color="#5b21b6" />
    </radialGradient>
    <linearGradient id="pfBolt" x1="18" y1="10" x2="46" y2="54" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#ede9fe" />
    </linearGradient>
  </defs>
  <rect width="64" height="64" fill="url(#pfTile)" />
  <g transform="translate(9.4 9.4) scale(1.88)">
    <path d="M13 2L3 14h7l-1 8L21 10h-7z" fill="url(#pfBolt)" />
  </g>
  <path d="M46.5 16.5l1.2 2.6 2.6 1.2-2.6 1.2-1.2 2.6-1.2-2.6-2.6-1.2 2.6-1.2z" fill="#5eead4" />
</svg>`;

function render(source: string, size: number): Buffer {
  const r = new Resvg(source, { fitTo: { mode: "width", value: size } });
  return Buffer.from(r.render().asPng());
}

const sizes = [16, 32, 48, 64, 128, 256];
const ico = await pngToIco(sizes.map((s) => render(svg, s)));
writeFileSync(resolve(root, "app/favicon.ico"), ico);
writeFileSync(resolve(root, "app/apple-icon.png"), render(appleSvg, 180));
writeFileSync(resolve(root, "public/logo-256.png"), render(svg, 256));

console.log("✔ Wrote app/favicon.ico, app/apple-icon.png, public/logo-256.png");

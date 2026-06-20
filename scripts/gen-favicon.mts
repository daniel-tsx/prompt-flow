// Generates app/favicon.ico (multi-size) from public/logo.svg.
// Run: pnpm gen:favicon
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import pngToIco from "png-to-ico";

const root = resolve(import.meta.dirname, "..");
const svg = readFileSync(resolve(root, "public/logo.svg"), "utf8");

function render(size: number): Buffer {
  const r = new Resvg(svg, { fitTo: { mode: "width", value: size } });
  return Buffer.from(r.render().asPng());
}

const sizes = [16, 32, 48, 64, 128, 256];
const pngs = sizes.map(render);

// A standalone PNG preview + the favicon.ico bundle.
writeFileSync(resolve(root, "public/logo-256.png"), render(256));
const ico = await pngToIco(pngs);
writeFileSync(resolve(root, "app/favicon.ico"), ico);

console.log(`✔ Wrote app/favicon.ico (${sizes.join(", ")}px) and public/logo-256.png`);

"use client";

import { useId } from "react";
import { brand, markGeo, markAnimationCss } from "@/lib/brand/mark";
import { cn } from "@/lib/utils";

/**
 * The PromptFlow mark: a constructed "P" whose bowl-counter holds a teal command
 * prompt — a `>` caret and a cursor dot. Geometry is shared with the static SVG
 * assets via `lib/brand/mark.ts`. Teal uses `--pf-accent` so it stays legible on
 * both the dark cockpit and the light theme (set in `globals.css`).
 */
function MarkGlyph({ animated }: { animated?: boolean }) {
  const id = useId().replace(/:/g, "");
  const teal = "var(--pf-accent, #2dd4bf)";
  const g = markGeo;
  return (
    <>
      {animated ? <style>{markAnimationCss}</style> : null}
      <defs>
        <linearGradient
          id={id}
          x1={g.gradient.x1}
          y1={g.gradient.y1}
          x2={g.gradient.x2}
          y2={g.gradient.y2}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor={brand.violetFrom} />
          <stop offset="1" stopColor={brand.violetTo} />
        </linearGradient>
      </defs>
      <g transform={`translate(${g.shiftX} 0)`}>
        <g fill={`url(#${id})`}>
          <rect x={g.stem.x} y={g.stem.y} width={g.stem.w} height={g.stem.h} rx={g.stem.rx} />
          <path fillRule="evenodd" d={g.bowl} />
        </g>
        <g className={animated ? "pf-accent" : undefined}>
          <path
            className={animated ? "pf-caret" : undefined}
            d={g.caret}
            fill="none"
            stroke={teal}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            className={animated ? "pf-dot" : undefined}
            cx={g.dot.cx}
            cy={g.dot.cy}
            r={g.dot.r}
            fill={teal}
          />
        </g>
      </g>
    </>
  );
}

/** Static mark — use anywhere; the safe default for dense/repeated/mobile UI. */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="PromptFlow"
      className={cn("size-8", className)}
    >
      <MarkGlyph />
    </svg>
  );
}

/**
 * Animated mark — a one-shot reveal on mount (the prompt is "typed", the cursor
 * lands and settles), then rests. Reserve for high-visibility brand moments
 * (header, welcome hero). Degrades to the static mark under reduced motion.
 */
export function BrandLogoAnimated({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="PromptFlow"
      className={cn("size-8", className)}
    >
      <MarkGlyph animated />
    </svg>
  );
}

/**
 * Horizontal lockup: mark + "PromptFlow" wordmark (Prompt medium / Flow semibold)
 * with an optional mono "Command Library" subtitle. The mark carries the color;
 * the type stays quiet.
 */
export function BrandWordmark({
  className,
  animated,
  subtitle = true,
}: {
  className?: string;
  animated?: boolean;
  subtitle?: boolean;
}) {
  const Mark = animated ? BrandLogoAnimated : BrandLogo;
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Mark className="size-8" />
      <span className="flex flex-col leading-tight">
        <span className="text-sm tracking-tight">
          <span className="font-medium">Prompt</span>
          <span className="font-semibold">Flow</span>
        </span>
        {subtitle ? (
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            Command Library
          </span>
        ) : null}
      </span>
    </span>
  );
}

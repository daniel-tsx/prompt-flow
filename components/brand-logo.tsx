import { cn } from "@/lib/utils";

/** The PromptFlow app mark — violet squircle, lightning bolt, teal spark. */
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
      <defs>
        <radialGradient id="pfTile" cx="32%" cy="24%" r="85%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="52%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#5b21b6" />
        </radialGradient>
        <linearGradient id="pfBolt" x1="18" y1="10" x2="46" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ede9fe" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="58" height="58" rx="16" fill="url(#pfTile)" />
      <rect x="3.5" y="3.5" width="57" height="57" rx="15.5" fill="none" stroke="#ffffff" strokeOpacity="0.14" />
      <g transform="translate(9.4 9.4) scale(1.88)">
        <path d="M13 2L3 14h7l-1 8L21 10h-7z" fill="url(#pfBolt)" />
      </g>
      <path d="M46.5 16.5l1.2 2.6 2.6 1.2-2.6 1.2-1.2 2.6-1.2-2.6-2.6-1.2 2.6-1.2z" fill="#5eead4" />
    </svg>
  );
}

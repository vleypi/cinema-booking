import { LOGO_TEXT } from "@/shared/ui/ui.constant";

export const Logo = () => (
  <svg viewBox="2 6 77 28" role="img" aria-label={LOGO_TEXT.label} className="h-8 w-22 shrink-0">
    <g strokeWidth={3} className="stroke-canvas">
      <rect x="4" y="8" width="30" height="24" rx="7" className="fill-lime" />
      <rect x="24" y="8" width="30" height="24" rx="7" className="fill-mint" />
      <rect x="44" y="8" width="30" height="24" rx="7" className="fill-forest" />
    </g>
    <path d="M56.6 16.9 L62.3 20 L56.6 23.1Z" strokeWidth={2} strokeLinejoin="round" className="fill-white stroke-white" />
  </svg>
);

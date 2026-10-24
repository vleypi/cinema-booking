import { LOGO_TEXT } from "@/shared/ui/ui.constant";

export const Logo = () => (
  <svg viewBox="2 6 77 28" role="img" aria-label={LOGO_TEXT.label} className="h-8 w-22 shrink-0">
    <g strokeWidth={3} className="stroke-white">
      <rect x="4" y="8" width="30" height="24" rx="7" className="fill-ray" />
      <rect x="24" y="8" width="30" height="24" rx="7" className="fill-brand" />
      <rect x="44" y="8" width="30" height="24" rx="7" className="fill-ink" />
    </g>
    <path d="M55.8 16.2 Q55.8 14.6 57.2 15.4 L63 18.8 Q64.2 20 63 21.2 L57.2 24.6 Q55.8 25.4 55.8 23.8Z" className="fill-white" />
  </svg>
);

import { LOGO_TEXT } from "@/shared/ui/ui.constant";

export const Logo = () => (
  <svg viewBox="2 6 77 28" role="img" aria-label={LOGO_TEXT.label} className="h-8 w-22 shrink-0">
    <g strokeWidth={3} className="stroke-white">
      <rect x="4" y="8" width="30" height="24" rx="7" className="fill-ray" />
      <rect x="24" y="8" width="30" height="24" rx="7" className="fill-brand" />
      <rect x="44" y="8" width="30" height="24" rx="7" className="fill-ink" />
    </g>
    <path d="M55.5 14.5 Q55.5 12.5 57.3 13.5 L66 18.6 Q67.6 20 66 21.4 L57.3 26.5 Q55.5 27.5 55.5 25.5Z" className="fill-white" />
  </svg>
);

export const WORD_DELAY_CLASSES = [
  "delay-0",
  "delay-40",
  "delay-80",
  "delay-120",
  "delay-160",
  "delay-200",
  "delay-240",
  "delay-280",
  "delay-320",
  "delay-360",
] as const;

export const ITEM_DELAY_CLASSES = ["delay-0", "delay-80", "delay-160", "delay-240", "delay-320", "delay-400"] as const;

export const IN_VIEW_ROOT_MARGIN = "0px 0px -14% 0px";

export const MEDIA_QUERIES = {
  desktop: "(min-width: 56.25rem)",
  coarsePointer: "(pointer: coarse)",
  reducedMotion: "(prefers-reduced-motion: reduce)",
} as const;

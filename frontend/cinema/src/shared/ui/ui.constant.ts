export const BUTTON_VARIANTS = {
  light: "bg-paper text-ink hover:bg-white",
  ghost: "border-paper/28 hover:border-paper",
} as const;

export const BUTTON_SIZES = {
  regular: "min-h-13 px-6",
  small: "min-h-11 px-4.5 text-[0.9rem]",
} as const;

export type ButtonVariant = keyof typeof BUTTON_VARIANTS;
export type ButtonSize = keyof typeof BUTTON_SIZES;

export const CONTAINER_CLASS_NAME = "mx-auto w-full max-w-328";

export const PANEL_CLASS_NAME = "rounded-frame border border-paper/13";

export const CHIP_CLASS_NAME =
  "min-h-10.5 rounded-full border border-paper/13 px-4 text-paper/64 transition-colors duration-300 hover:border-paper/28 hover:text-paper aria-pressed:border-paper aria-pressed:bg-paper aria-pressed:text-ink";

export const MONO_LABEL_CLASS_NAME = "font-mono text-xs tracking-[0.08em] text-paper/38 uppercase";

export const SECTION_TITLE_CLASS_NAME =
  "font-display text-[clamp(2.25rem,5.5vw,5.25rem)] leading-[0.97] font-medium tracking-[-0.005em] uppercase";

export const SECTION_NOTE_CLASS_NAME = "max-w-96 text-paper/64";

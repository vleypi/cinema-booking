export const CATALOG_CINEMAS_PATH = "/catalog/cinemas";

export const CINEMA_TEXT = {
  choose: "Кинотеатр",
  hours: (opensAt: string, closesAt: string) => `Ежедневно ${opensAt}–${closesAt}`,
} as const;

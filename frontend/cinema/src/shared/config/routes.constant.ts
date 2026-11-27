export const SECTION_IDS = {
  top: "top",
  afisha: "afisha",
  comingSoon: "skoro",
  schedule: "seansy",
  faq: "faq",
} as const;

export const ROUTES = {
  home: "/",
  login: "/login",
  film: (filmId: string) => `/films/${filmId}`,
} as const;

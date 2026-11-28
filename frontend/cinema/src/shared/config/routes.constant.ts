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
  cabinet: "/cabinet",
  film: (filmId: string) => `/films/${filmId}`,
  session: (sessionId: string) => `/sessions/${sessionId}`,
  order: (orderNumber: string) => `/orders/${orderNumber}`,
} as const;

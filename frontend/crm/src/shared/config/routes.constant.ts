export const ROUTES = {
  home: "/",
  login: "/login",
  cinemas: "/cinemas",
  staff: "/staff",
  halls: "/halls",
  hall: (hallId: string) => `/halls/${hallId}`,
  prices: "/prices",
} as const;

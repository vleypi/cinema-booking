export const QUERY_KEYS = {
  viewer: ["viewer"],
  cinemas: ["cinemas"],
  staff: ["staff"],
  cinemaStaff: (cinemaId: string) => ["staff", cinemaId],
} as const;

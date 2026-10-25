export const QUERY_KEYS = {
  viewer: ["viewer"],
  cinemas: ["cinemas"],
  staff: ["staff"],
  cinemaStaff: (cinemaId: string) => ["staff", cinemaId],
  cinemaHalls: (cinemaId: string) => ["halls", cinemaId],
  hallLayout: (hallId: string) => ["hall-layout", hallId],
  cinemaTimeBands: (cinemaId: string) => ["time-bands", cinemaId],
  films: ["films"],
  sessions: ["sessions"],
  cinemaSessions: (cinemaId: string, date: string) => ["sessions", cinemaId, date],
} as const;

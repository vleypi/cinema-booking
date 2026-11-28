export const QUERY_KEYS = {
  cinemas: ["cinemas"],
  cinemaFilms: (cinemaId: string, search: string) => ["films", cinemaId, search],
  cinemaSessions: (cinemaId: string) => ["sessions", cinemaId],
  cinemaHalls: (cinemaId: string) => ["halls", cinemaId],
  film: (filmId: string) => ["film", filmId],
  comingSoonFilms: ["films", "coming-soon"],
  sessionSeats: (sessionId: string) => ["session-seats", sessionId],
} as const;

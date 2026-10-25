import type { IListRequest } from "@/shared/api/page.interface";

export const QUERY_KEYS = {
  viewer: ["viewer"],
  cinemas: ["cinemas"],
  cinemaPage: (request: IListRequest<string>) => ["cinemas", request],
  staff: ["staff"],
  cinemaStaff: (cinemaId: string, request: IListRequest<string>) => ["staff", cinemaId, request],
  cinemaHalls: (cinemaId: string) => ["halls", cinemaId],
  hallLayout: (hallId: string) => ["hall-layout", hallId],
  cinemaTimeBands: (cinemaId: string) => ["time-bands", cinemaId],
  films: ["films"],
  filmPage: (request: IListRequest<string>) => ["films", request],
  sessions: ["sessions"],
  cinemaSessions: (cinemaId: string, date: string) => ["sessions", cinemaId, date],
} as const;

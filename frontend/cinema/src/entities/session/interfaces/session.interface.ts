import type { IFilm } from "@luch/shared/film";

export interface ISessionHall {
  id: string;
  name: string;
  format: string;
}

export interface ISession {
  id: string;
  filmId: string;
  hallId: string;
  startsAt: string;
  endsAt: string;
  format: string;
  film: IFilm;
  hall: ISessionHall;
  minPrice: number;
}

export interface IFilmSessions {
  film: IFilm;
  sessions: ISession[];
}

export interface IScheduleDay {
  date: string;
  title: string;
  caption: string;
}

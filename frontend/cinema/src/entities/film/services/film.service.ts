import type { IFilm } from "@luch/shared/film";
import { apiClient } from "@/shared/api";
import { CATALOG_FILMS_PATH, cinemaFilmsPath, COMING_SOON_PATH } from "@/entities/film/constants/film.constant";

class FilmService {
  async getByCinema(cinemaId: string, search: string): Promise<IFilm[]> {
    const { data } = await apiClient.get<IFilm[]>(cinemaFilmsPath(cinemaId), { params: { search: search || undefined } });
    return data;
  }

  async getById(filmId: string): Promise<IFilm> {
    const { data } = await apiClient.get<IFilm>(`${CATALOG_FILMS_PATH}/${filmId}`);
    return data;
  }

  async getComingSoon(): Promise<IFilm[]> {
    const { data } = await apiClient.get<IFilm[]>(COMING_SOON_PATH);
    return data;
  }
}

export const filmService = new FilmService();

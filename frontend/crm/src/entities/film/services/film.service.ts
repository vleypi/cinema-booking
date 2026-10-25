import { apiClient } from "@/shared/api";
import type { IFilm, IFilmPayload } from "@/entities/film/interfaces/film.interface";

const FILMS_PATH = "/films";
const POSTER_FIELD = "file";

class FilmService {
  async getAll(): Promise<IFilm[]> {
    const { data } = await apiClient.get<IFilm[]>(FILMS_PATH);
    return data;
  }

  async create(payload: IFilmPayload): Promise<IFilm> {
    const { data } = await apiClient.post<IFilm>(FILMS_PATH, payload);
    return data;
  }

  async update(filmId: string, payload: IFilmPayload): Promise<IFilm> {
    const { data } = await apiClient.patch<IFilm>(`${FILMS_PATH}/${filmId}`, payload);
    return data;
  }

  async remove(filmId: string): Promise<void> {
    await apiClient.delete(`${FILMS_PATH}/${filmId}`);
  }

  async uploadPoster(filmId: string, poster: File): Promise<IFilm> {
    const body = new FormData();
    body.append(POSTER_FIELD, poster);
    const { data } = await apiClient.put<IFilm>(`${FILMS_PATH}/${filmId}/poster`, body);
    return data;
  }
}

export const filmService = new FilmService();

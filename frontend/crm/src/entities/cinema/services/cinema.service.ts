import { apiClient } from "@/shared/api";
import type { ICinema, ICinemaPayload } from "@/entities/cinema/interfaces/cinema.interface";

const CINEMAS_PATH = "/cinemas";

class CinemaService {
  async getAll(): Promise<ICinema[]> {
    const { data } = await apiClient.get<ICinema[]>(CINEMAS_PATH);
    return data;
  }

  async create(payload: ICinemaPayload): Promise<ICinema> {
    const { data } = await apiClient.post<ICinema>(CINEMAS_PATH, payload);
    return data;
  }

  async update(id: string, payload: ICinemaPayload): Promise<ICinema> {
    const { data } = await apiClient.patch<ICinema>(`${CINEMAS_PATH}/${id}`, payload);
    return data;
  }
}

export const cinemaService = new CinemaService();

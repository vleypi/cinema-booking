import { apiClient } from "@/shared/api";
import { CATALOG_CINEMAS_PATH } from "@/entities/cinema/constants/cinema.constant";
import type { ICinema } from "@/entities/cinema/interfaces/cinema.interface";

class CinemaService {
  async getAll(): Promise<ICinema[]> {
    const { data } = await apiClient.get<ICinema[]>(CATALOG_CINEMAS_PATH);
    return data;
  }
}

export const cinemaService = new CinemaService();

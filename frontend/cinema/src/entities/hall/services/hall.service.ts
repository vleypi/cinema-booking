import { apiClient } from "@/shared/api";
import { cinemaHallsPath } from "@/entities/hall/constants/hall.constant";
import type { ICinemaHalls } from "@/entities/hall/interfaces/hall.interface";

class HallService {
  async getByCinema(cinemaId: string): Promise<ICinemaHalls> {
    const { data } = await apiClient.get<ICinemaHalls>(cinemaHallsPath(cinemaId));
    return data;
  }
}

export const hallService = new HallService();

import { apiClient } from "@/shared/api";
import { cinemaSessionsPath } from "@/entities/session/constants/session.constant";
import type { ISession } from "@/entities/session/interfaces/session.interface";

class SessionService {
  async getByCinema(cinemaId: string): Promise<ISession[]> {
    const { data } = await apiClient.get<ISession[]>(cinemaSessionsPath(cinemaId));
    return data;
  }
}

export const sessionService = new SessionService();

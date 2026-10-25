import { apiClient } from "@/shared/api";
import type { ISession, ISessionPayload } from "@/entities/session/interfaces/session.interface";

const cinemaSessionsPath = (cinemaId: string) => `/cinemas/${cinemaId}/sessions`;

class SessionService {
  async getByCinemaDay(cinemaId: string, date: string): Promise<ISession[]> {
    const { data } = await apiClient.get<ISession[]>(cinemaSessionsPath(cinemaId), { params: { date } });
    return data;
  }

  async create(cinemaId: string, payload: ISessionPayload): Promise<ISession> {
    const { data } = await apiClient.post<ISession>(cinemaSessionsPath(cinemaId), payload);
    return data;
  }

  async remove(sessionId: string): Promise<void> {
    await apiClient.delete(`/sessions/${sessionId}`);
  }
}

export const sessionService = new SessionService();

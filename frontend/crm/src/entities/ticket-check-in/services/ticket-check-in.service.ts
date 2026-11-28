import { apiClient } from "@/shared/api";
import type {
  ICheckInHallOption,
  ICheckInPayload,
  ICheckInResult,
} from "@/entities/ticket-check-in/interfaces/ticket-check-in.interface";

const ticketsBasePath = (cinemaId: string) => `/cinemas/${cinemaId}/tickets`;

class TicketCheckInService {
  async listHalls(cinemaId: string): Promise<ICheckInHallOption[]> {
    const { data } = await apiClient.get<ICheckInHallOption[]>(`${ticketsBasePath(cinemaId)}/halls`);
    return data;
  }

  async checkIn(cinemaId: string, payload: ICheckInPayload): Promise<ICheckInResult> {
    const { data } = await apiClient.post<ICheckInResult>(`${ticketsBasePath(cinemaId)}/check-in`, payload);
    return data;
  }
}

export const ticketCheckInService = new TicketCheckInService();

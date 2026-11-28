import { apiClient } from "@/shared/api";
import type {
  BoxOfficePrintFormat,
  IBoxOfficeOrder,
  IBoxOfficeRefund,
  IBoxOfficeRefundPayload,
  IBoxOfficeSession,
  IBoxOfficeSessionSeats,
  ICreateBoxOfficeOrderPayload,
} from "@/entities/box-office/interfaces/box-office.interface";

const boxOfficeBasePath = (cinemaId: string) => `/cinemas/${cinemaId}/box-office`;

class BoxOfficeService {
  async getSessionsByDay(cinemaId: string, date: string): Promise<IBoxOfficeSession[]> {
    const { data } = await apiClient.get<IBoxOfficeSession[]>(`${boxOfficeBasePath(cinemaId)}/sessions`, {
      params: { date },
    });
    return data;
  }

  async getSessionSeats(cinemaId: string, sessionId: string): Promise<IBoxOfficeSessionSeats> {
    const { data } = await apiClient.get<IBoxOfficeSessionSeats>(
      `${boxOfficeBasePath(cinemaId)}/sessions/${sessionId}/seats`,
    );
    return data;
  }

  async createOrder(cinemaId: string, payload: ICreateBoxOfficeOrderPayload): Promise<IBoxOfficeOrder> {
    const { data } = await apiClient.post<IBoxOfficeOrder>(`${boxOfficeBasePath(cinemaId)}/orders`, payload);
    return data;
  }

  async searchOrders(cinemaId: string, query: string): Promise<IBoxOfficeOrder[]> {
    const trimmed = query.trim();
    const { data } = await apiClient.get<IBoxOfficeOrder[]>(`${boxOfficeBasePath(cinemaId)}/orders`, {
      params: trimmed ? { query: trimmed } : undefined,
    });
    return data;
  }

  async refundOrder(cinemaId: string, orderId: string, payload: IBoxOfficeRefundPayload): Promise<IBoxOfficeRefund> {
    const { data } = await apiClient.post<IBoxOfficeRefund>(
      `${boxOfficeBasePath(cinemaId)}/orders/${orderId}/refunds`,
      payload,
    );
    return data;
  }

  getOrderPdfUrl(cinemaId: string, orderId: string, format: BoxOfficePrintFormat): string {
    return `/api${boxOfficeBasePath(cinemaId)}/orders/${orderId}/pdf?format=${format}`;
  }
}

export const boxOfficeService = new BoxOfficeService();

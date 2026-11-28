import { apiClient } from "@/shared/api";
import type { ICreateOrderPayload, IOrder, IPayment, ISessionSeatsResponse } from "@/entities/order/interfaces/order.interface";

export const orderService = {
  getSessionSeats: async (sessionId: string): Promise<ISessionSeatsResponse> => {
    const { data } = await apiClient.get<ISessionSeatsResponse>(`/sessions/${sessionId}/seats`);

    return data;
  },

  createOrder: async (payload: ICreateOrderPayload): Promise<IOrder> => {
    const { data } = await apiClient.post<IOrder>("/orders", payload);

    return data;
  },

  createOnlinePayment: async (orderId: string): Promise<IPayment> => {
    const { data } = await apiClient.post<IPayment>(`/orders/${orderId}/payments`);

    return data;
  },
};

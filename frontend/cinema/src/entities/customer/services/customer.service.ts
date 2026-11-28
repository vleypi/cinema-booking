import { apiClient } from "@/shared/api";
import { AUTH_API_PATHS } from "@/shared/config";
import type { ICustomerOrdersList, ICustomerProfile, IUpdateCustomerProfilePayload } from "@/entities/customer/interfaces/customer.interface";

export const customerService = {
  requestOtp: async (email: string): Promise<void> => {
    await apiClient.post(AUTH_API_PATHS.requestOtp, { email });
  },

  verifyOtp: async (email: string, code: string): Promise<ICustomerProfile> => {
    const { data } = await apiClient.post<ICustomerProfile>(AUTH_API_PATHS.verifyOtp, { email, code });

    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(AUTH_API_PATHS.logout);
  },

  getMe: async (): Promise<ICustomerProfile> => {
    const { data } = await apiClient.get<ICustomerProfile>(AUTH_API_PATHS.me);

    return data;
  },

  updateMe: async (payload: IUpdateCustomerProfilePayload): Promise<ICustomerProfile> => {
    const { data } = await apiClient.patch<ICustomerProfile>(AUTH_API_PATHS.me, payload);

    return data;
  },

  getOrders: async (): Promise<ICustomerOrdersList> => {
    const { data } = await apiClient.get<ICustomerOrdersList>(AUTH_API_PATHS.orders);

    return data;
  },

  getOrderPdfUrl: (orderId: string): string => `/api${AUTH_API_PATHS.orders}/${orderId}/pdf`,

  getTicketQrUrl: (orderId: string, ticketId: string): string => `/api${AUTH_API_PATHS.orders}/${orderId}/tickets/${ticketId}/qr`,
};

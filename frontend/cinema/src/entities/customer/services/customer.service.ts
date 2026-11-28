import { apiClient } from "@/shared/api";
import { AUTH_API_PATHS } from "@/shared/config";
import type {
  ICustomerOrdersList,
  ICustomerProfile,
  ICustomerRefundResult,
  IRefundPreview,
  IUpdateCustomerProfilePayload,
} from "@/entities/customer/interfaces/customer.interface";

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

  refundOrder: async (orderId: string, ticketIds: string[]): Promise<ICustomerRefundResult> => {
    const { data } = await apiClient.post<ICustomerRefundResult>(`${AUTH_API_PATHS.orders}/${orderId}/refunds`, { ticketIds });
    return data;
  },

  previewRefundByToken: async (token: string): Promise<IRefundPreview> => {
    const { data } = await apiClient.get<IRefundPreview>("/refunds/by-token", { params: { token } });
    return data;
  },

  refundByToken: async (token: string, ticketIds: string[]): Promise<ICustomerRefundResult> => {
    const { data } = await apiClient.post<ICustomerRefundResult>("/refunds/by-token", { token, ticketIds });
    return data;
  },
};

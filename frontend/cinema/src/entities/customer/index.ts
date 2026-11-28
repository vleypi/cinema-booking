export { useCustomerLogout } from "@/entities/customer/hooks/useCustomerLogout";
export { useCustomerMe } from "@/entities/customer/hooks/useCustomerMe";
export { useCustomerOrders } from "@/entities/customer/hooks/useCustomerOrders";
export { useRequestOtp, useVerifyOtp } from "@/entities/customer/hooks/useCustomerOtp";
export { useUpdateCustomerProfile } from "@/entities/customer/hooks/useUpdateCustomerProfile";
export type {
  ICustomerOrder,
  ICustomerOrdersList,
  ICustomerOrderTicket,
  ICustomerProfile,
  IUpdateCustomerProfilePayload,
} from "@/entities/customer/interfaces/customer.interface";
export { customerService } from "@/entities/customer/services/customer.service";

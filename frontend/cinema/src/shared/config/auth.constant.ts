import { ROUTES } from "@/shared/config/routes.constant";

export const AUTH_COOKIES = {
  access: "customer_access",
  refresh: "customer_refresh",
} as const;

export const AUTH_API_PATHS = {
  requestOtp: "/customer/auth/request-otp",
  verifyOtp: "/customer/auth/verify-otp",
  refresh: "/customer/auth/refresh",
  logout: "/customer/auth/logout",
  session: "/customer/auth/session",
  me: "/customer/me",
  orders: "/customer/orders",
} as const;

export const GUEST_ONLY_ROUTES = [ROUTES.login] as const;
export const PROTECTED_ROUTES = [ROUTES.cabinet] as const;

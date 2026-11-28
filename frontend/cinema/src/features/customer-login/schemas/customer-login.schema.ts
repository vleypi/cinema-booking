import { z } from "zod";
import { CUSTOMER_LOGIN_TEXT } from "@/features/customer-login/constants/customer-login.constant";

export const requestOtpSchema = z.object({
  email: z.string().trim().email(CUSTOMER_LOGIN_TEXT.validationEmail),
});

export const verifyOtpSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, CUSTOMER_LOGIN_TEXT.validationCode),
});

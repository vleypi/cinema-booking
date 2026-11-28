import { z } from "zod";
import { BOX_OFFICE_SELL_TEXT } from "@/features/box-office-sell/constants/box-office-sell.constant";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const boxOfficeOrderSchema = z.object({
  paymentMethod: z.enum(["CASH", "CARD_TERMINAL"]),
  email: z
    .string()
    .trim()
    .refine((value) => value === "" || EMAIL_PATTERN.test(value), BOX_OFFICE_SELL_TEXT.invalidEmail),
  name: z.string().trim().max(120, BOX_OFFICE_SELL_TEXT.nameTooLong),
  phone: z.string().trim().max(32, BOX_OFFICE_SELL_TEXT.phoneTooLong),
});

export type BoxOfficeOrderFormValues = z.infer<typeof boxOfficeOrderSchema>;

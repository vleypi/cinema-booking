import { z } from "zod";
import { SESSION_FORMATS } from "@/entities/session";
import { BASE_PRICE_MAX_RUBLES, CREATE_SESSION_TEXT } from "@/features/create-session/constants/create-session.constant";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const isOptionalPrice = (value: string) => {
  if (value === "") return true;
  const price = Number(value);

  return Number.isFinite(price) && price >= 0 && price <= BASE_PRICE_MAX_RUBLES;
};

export const sessionFormSchema = z.object({
  filmId: z.string().min(1, CREATE_SESSION_TEXT.required),
  hallId: z.string().min(1, CREATE_SESSION_TEXT.required),
  date: z.string().regex(DATE_PATTERN, CREATE_SESSION_TEXT.dateFormat),
  time: z.string().regex(TIME_PATTERN, CREATE_SESSION_TEXT.timeFormat),
  format: z.enum(SESSION_FORMATS),
  basePrice: z.string().trim().refine(isOptionalPrice, CREATE_SESSION_TEXT.basePriceRange),
});

export type SessionFormValues = z.infer<typeof sessionFormSchema>;

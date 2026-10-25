import { z } from "zod";
import { multiplierSchema } from "@/shared/lib";
import { PRICE_ZONE_NAME_MAX_LENGTH, SAVE_PRICE_ZONE_TEXT } from "@/features/save-price-zone/constants/save-price-zone.constant";

export const priceZoneFormSchema = z.object({
  name: z.string().trim().min(1, SAVE_PRICE_ZONE_TEXT.required).max(PRICE_ZONE_NAME_MAX_LENGTH, SAVE_PRICE_ZONE_TEXT.tooLong),
  multiplier: multiplierSchema,
});

export type PriceZoneFormValues = z.infer<typeof priceZoneFormSchema>;

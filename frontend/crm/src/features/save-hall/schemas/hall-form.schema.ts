import { z } from "zod";
import { HALL_LIMITS, SAVE_HALL_TEXT } from "@/features/save-hall/constants/save-hall.constant";

const requiredText = (maxLength: number) => z.string().trim().min(1, SAVE_HALL_TEXT.required).max(maxLength, SAVE_HALL_TEXT.tooLong);

export const hallFormSchema = z.object({
  name: requiredText(HALL_LIMITS.nameMaxLength),
  format: requiredText(HALL_LIMITS.formatMaxLength),
  basePrice: z
    .number({ error: SAVE_HALL_TEXT.basePriceRange })
    .min(0, SAVE_HALL_TEXT.basePriceRange)
    .max(HALL_LIMITS.basePriceMaxRubles, SAVE_HALL_TEXT.basePriceRange),
  useTimeBands: z.boolean(),
  isActive: z.boolean(),
});

export type HallFormValues = z.infer<typeof hallFormSchema>;

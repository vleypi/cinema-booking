import { z } from "zod";
import { multiplierSchema } from "@/shared/lib";
import { SAVE_TIME_BAND_TEXT, TIME_BAND_LIMITS } from "@/features/save-time-band/constants/save-time-band.constant";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const timeBandFormSchema = z.object({
  name: z.string().trim().min(1, SAVE_TIME_BAND_TEXT.required).max(TIME_BAND_LIMITS.nameMaxLength, SAVE_TIME_BAND_TEXT.tooLong),
  startsAt: z.string().regex(TIME_PATTERN, SAVE_TIME_BAND_TEXT.timeFormat),
  multiplier: multiplierSchema,
});

export type TimeBandFormValues = z.infer<typeof timeBandFormSchema>;

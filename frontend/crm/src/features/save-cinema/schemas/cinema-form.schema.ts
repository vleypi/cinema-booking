import { z } from "zod";
import { CINEMA_LIMITS, SAVE_CINEMA_TEXT } from "@/features/save-cinema/constants/save-cinema.constant";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const requiredText = (maxLength: number) => z.string().trim().min(1, SAVE_CINEMA_TEXT.required).max(maxLength, SAVE_CINEMA_TEXT.tooLong);
const timeOfDay = z.string().regex(TIME_PATTERN, SAVE_CINEMA_TEXT.timeFormat);

export const cinemaFormSchema = z.object({
  name: requiredText(CINEMA_LIMITS.nameMaxLength),
  slug: z.string().trim().max(CINEMA_LIMITS.slugMaxLength, SAVE_CINEMA_TEXT.tooLong).regex(SLUG_PATTERN, SAVE_CINEMA_TEXT.slugFormat),
  address: requiredText(CINEMA_LIMITS.addressMaxLength),
  timezone: z.string().min(1, SAVE_CINEMA_TEXT.required),
  opensAt: timeOfDay,
  closesAt: timeOfDay,
  cleaningBreakMinutes: z
    .number({ error: SAVE_CINEMA_TEXT.breakRange })
    .int(SAVE_CINEMA_TEXT.breakRange)
    .min(0, SAVE_CINEMA_TEXT.breakRange)
    .max(CINEMA_LIMITS.cleaningBreakMaxMinutes, SAVE_CINEMA_TEXT.breakRange),
  isPublished: z.boolean(),
});

export type CinemaFormValues = z.infer<typeof cinemaFormSchema>;

import { z } from "zod";
import { multiplierSchema } from "@/shared/lib";
import { DAY_START, EDIT_TIME_BANDS_TEXT, TIME_BAND_LIMITS } from "@/features/edit-time-bands/constants/edit-time-bands.constant";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const timeBandSchema = z.object({
  name: z.string().trim().min(1, EDIT_TIME_BANDS_TEXT.required).max(TIME_BAND_LIMITS.nameMaxLength, EDIT_TIME_BANDS_TEXT.tooLong),
  startsAt: z.string().regex(TIME_PATTERN, EDIT_TIME_BANDS_TEXT.timeFormat),
  multiplier: multiplierSchema,
});

export const timeBandsFormSchema = z.object({
  bands: z
    .array(timeBandSchema)
    .min(1)
    .max(TIME_BAND_LIMITS.maxBands)
    .superRefine((bands, context) => {
      if (!bands.some(({ startsAt }) => startsAt === DAY_START)) context.addIssue({ code: "custom", message: EDIT_TIME_BANDS_TEXT.dayStartMissing });

      bands.forEach(({ startsAt }, index) => {
        if (bands.findIndex((band) => band.startsAt === startsAt) !== index) {
          context.addIssue({ code: "custom", path: [index, "startsAt"], message: EDIT_TIME_BANDS_TEXT.duplicateStart });
        }
      });
    }),
});

export type TimeBandsFormValues = z.infer<typeof timeBandsFormSchema>;

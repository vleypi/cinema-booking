import type { ITimeBand } from "@/entities/time-band";
import { DAY_END } from "@/features/edit-time-bands/constants/edit-time-bands.constant";
import type { TimeBandsFormValues } from "@/features/edit-time-bands/schemas/time-bands-form.schema";

export const toTimeBandsFormValues = (bands: readonly ITimeBand[]): TimeBandsFormValues => ({
  bands: bands.map(({ name, startsAt, multiplier }) => ({ name, startsAt, multiplier })),
});

export const findBandEnd = (starts: readonly string[], startsAt: string): string =>
  starts.filter((start) => start > startsAt).toSorted()[0] ?? DAY_END;

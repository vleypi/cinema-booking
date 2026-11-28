import type { ITimeBand, ITimeBandInput } from "@/entities/time-band";

export const buildTimeBandInputs = (bands: readonly ITimeBand[], replacedId: string | null, band: ITimeBandInput | null): ITimeBandInput[] =>
  [...bands.filter(({ id }) => id !== replacedId), ...(band ? [band] : [])]
    .map(({ name, startsAt, multiplier }) => ({ name, startsAt, multiplier }))
    .toSorted((first, second) => first.startsAt.localeCompare(second.startsAt));

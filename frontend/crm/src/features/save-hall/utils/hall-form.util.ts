import { kopecksToRubles, rublesToKopecks } from "@/shared/lib";
import type { IHall, IHallPayload } from "@/entities/hall";
import type { HallFormValues } from "@/features/save-hall/schemas/hall-form.schema";

export const toHallFormValues = ({ name, format, basePrice, useTimeBands, isActive }: IHall): HallFormValues => ({
  name,
  format,
  basePrice: kopecksToRubles(basePrice),
  useTimeBands,
  isActive,
});

export const toHallPayload = ({ isActive, basePrice, ...values }: HallFormValues, isNew: boolean): IHallPayload => ({
  ...values,
  basePrice: rublesToKopecks(basePrice),
  ...(isNew ? {} : { isActive }),
});

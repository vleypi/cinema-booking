import { rublesToKopecks } from "@/shared/lib";
import type { ISessionPayload } from "@/entities/session";
import type { SessionFormValues } from "@/features/create-session/schemas/session-form.schema";

export const toSessionPayload = ({ basePrice, ...values }: SessionFormValues): ISessionPayload => ({
  ...values,
  ...(basePrice === "" ? {} : { basePriceOverride: rublesToKopecks(Number(basePrice)) }),
});

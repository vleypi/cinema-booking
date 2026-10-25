import { z } from "zod";
import { MULTIPLIER_LIMITS, PRICING_TEXT } from "@/shared/config";

const hasAllowedPrecision = (value: number) => Number(value.toFixed(MULTIPLIER_LIMITS.decimalPlaces)) === value;

export const multiplierSchema = z
  .number({ error: PRICING_TEXT.multiplierRange })
  .positive(PRICING_TEXT.multiplierRange)
  .max(MULTIPLIER_LIMITS.max, PRICING_TEXT.multiplierRange)
  .refine(hasAllowedPrecision, PRICING_TEXT.multiplierPrecision);

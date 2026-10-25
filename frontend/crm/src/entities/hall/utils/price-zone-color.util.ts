import { MISSING_PRICE_ZONE_COLOR, PRICE_ZONE_COLORS } from "@/entities/hall/constants/hall.constant";
import type { IPriceZone } from "@/entities/hall/interfaces/hall.interface";

export const getPriceZoneColor = (priceZones: readonly IPriceZone[], priceZoneId: string): string => {
  const index = priceZones.findIndex(({ id }) => id === priceZoneId);

  return index === -1 ? MISSING_PRICE_ZONE_COLOR : PRICE_ZONE_COLORS[index % PRICE_ZONE_COLORS.length];
};

import { joinClassNames } from "@luch/shared/lib";
import { formatMultiplier } from "@/shared/lib";
import type { IPriceZone } from "@/entities/hall/interfaces/hall.interface";
import { getPriceZoneColor } from "@/entities/hall/utils/price-zone-color.util";

interface IPriceZoneLabelProps {
  priceZone: IPriceZone;
  priceZones: readonly IPriceZone[];
}

export const PriceZoneLabel = ({ priceZone, priceZones }: IPriceZoneLabelProps) => (
  <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
    <span className={joinClassNames("size-2.5 shrink-0 rounded-full", getPriceZoneColor(priceZones, priceZone.id))} />
    <span className="text-ink">{priceZone.name}</span>
    <span className="text-gray-500">{formatMultiplier(priceZone.multiplier)}</span>
  </span>
);

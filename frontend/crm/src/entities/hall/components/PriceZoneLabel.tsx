import { formatMultiplier } from "@/shared/lib";
import type { IPriceZone } from "@/entities/hall/interfaces/hall.interface";
import { PriceZoneDot } from "@/entities/hall/components/PriceZoneDot";

interface IPriceZoneLabelProps {
  priceZone: IPriceZone;
  priceZones: readonly IPriceZone[];
}

export const PriceZoneLabel = ({ priceZone, priceZones }: IPriceZoneLabelProps) => (
  <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
    <PriceZoneDot priceZone={priceZone} priceZones={priceZones} />
    <span className="text-ink">{priceZone.name}</span>
    <span className="text-gray-500">{formatMultiplier(priceZone.multiplier)}</span>
  </span>
);

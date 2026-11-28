import { joinClassNames } from "@luch/shared/lib";
import type { IPriceZone } from "@/entities/hall/interfaces/hall.interface";
import { getPriceZoneColor } from "@/entities/hall/utils/price-zone-color.util";

interface IPriceZoneDotProps {
  priceZone: IPriceZone;
  priceZones: readonly IPriceZone[];
  label?: string;
}

export const PriceZoneDot = ({ priceZone, priceZones, label }: IPriceZoneDotProps) => (
  <span
    role={label ? "img" : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
    title={label}
    className={joinClassNames("size-2.5 shrink-0 rounded-full", getPriceZoneColor(priceZones, priceZone.id))}
  />
);

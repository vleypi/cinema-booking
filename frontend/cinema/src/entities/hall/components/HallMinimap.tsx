import { MINIMAP_SEAT_RADIUS, MINIMAP_SEAT_SIZE } from "@/entities/hall/constants/hall.constant";
import type { IHall } from "@/entities/hall/interfaces/hall.interface";
import { getLayoutSize, getZoneTone } from "@/entities/hall/utils/hall.util";

interface IHallMinimapProps {
  hall: IHall;
}

export const HallMinimap = ({ hall }: IHallMinimapProps) => {
  const { columns, rows } = getLayoutSize(hall);
  const zoneOrder = new Map(hall.priceZones.map(({ id }, index) => [id, index]));

  return (
    <svg viewBox={`0 0 ${columns} ${rows}`} aria-hidden className="w-full max-w-88">
      {hall.seats.map(({ posX, posY, priceZoneId }) => (
        <rect
          key={`${posX}-${posY}`}
          x={posX}
          y={posY}
          width={MINIMAP_SEAT_SIZE}
          height={MINIMAP_SEAT_SIZE}
          rx={MINIMAP_SEAT_RADIUS}
          className={getZoneTone(zoneOrder.get(priceZoneId) ?? 0, hall.priceZones.length).fill}
        />
      ))}
    </svg>
  );
};

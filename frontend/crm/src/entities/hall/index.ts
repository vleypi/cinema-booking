export { HallTable } from "@/entities/hall/components/HallTable";
export { PriceZoneLabel } from "@/entities/hall/components/PriceZoneLabel";
export { HALL_TEXT, SEAT_SHAPE_CLASSES, SEAT_TYPE_LABELS, SEAT_TYPES, type SeatType } from "@/entities/hall/constants/hall.constant";
export { useCinemaHalls } from "@/entities/hall/hooks/useCinemaHalls";
export { useHallLayout } from "@/entities/hall/hooks/useHallLayout";
export type { IHall, IHallLayout, IHallLayoutPayload, IHallPayload, IPriceZone, IPriceZonePayload, ISeatInput } from "@/entities/hall/interfaces/hall.interface";
export { hallService } from "@/entities/hall/services/hall.service";
export { getPriceZoneColor } from "@/entities/hall/utils/price-zone-color.util";

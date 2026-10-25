import { formatRubles } from "@/shared/lib";
import type { IHall } from "@/entities/hall";
import { HALL_PAGE_TEXT } from "@/views/hall/constants/hall-page.constant";

export const describeHall = ({ format, basePrice, useTimeBands, isActive }: IHall): string =>
  [
    format,
    `${HALL_PAGE_TEXT.basePrice} ${formatRubles(basePrice)}`,
    useTimeBands ? HALL_PAGE_TEXT.timeBandsOn : HALL_PAGE_TEXT.timeBandsOff,
    ...(isActive ? [] : [HALL_PAGE_TEXT.inactive]),
  ].join(" · ");

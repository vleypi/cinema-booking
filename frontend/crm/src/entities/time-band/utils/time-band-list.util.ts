import type { IListRequest } from "@/shared/api";
import { SORT_ORDERS } from "@/shared/config";
import { TIME_BAND_SORT_FIELDS, type TimeBandSortField } from "@/entities/time-band/constants/time-band.constant";
import type { ITimeBand } from "@/entities/time-band/interfaces/time-band.interface";

const compareBy = (field: TimeBandSortField) => (first: ITimeBand, second: ITimeBand): number =>
  field === TIME_BAND_SORT_FIELDS.multiplier ? first.multiplier - second.multiplier : first[field].localeCompare(second[field]);

export const filterTimeBands = (bands: readonly ITimeBand[], { search, sort = TIME_BAND_SORT_FIELDS.startsAt, order }: IListRequest<TimeBandSortField>): ITimeBand[] => {
  const query = search?.toLowerCase() ?? "";
  const direction = order === SORT_ORDERS.desc ? -1 : 1;
  const compare = compareBy(sort);

  return bands.filter(({ name }) => name.toLowerCase().includes(query)).toSorted((first, second) => compare(first, second) * direction);
};

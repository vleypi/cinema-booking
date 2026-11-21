"use client";

import { formatMultiplier } from "@/shared/lib";
import { DataTable, Highlight, type IDataTableColumn, type IDataTableSorting, TableTitleCell } from "@/shared/ui";
import { TIME_BAND_SORT_FIELDS, TIME_BAND_TEXT, type TimeBandSortField } from "@/entities/time-band/constants/time-band.constant";
import type { ITimeBand } from "@/entities/time-band/interfaces/time-band.interface";

interface ITimeBandTableProps {
  timeBands: readonly ITimeBand[] | undefined;
  isLoading: boolean;
  search: string;
  emptyText: string;
  sorting: IDataTableSorting<TimeBandSortField>;
  onSelect: (timeBand: ITimeBand) => void;
}

const getColumns = (search: string): IDataTableColumn<ITimeBand, TimeBandSortField>[] => [
  { key: "band", header: TIME_BAND_TEXT.band, sortField: TIME_BAND_SORT_FIELDS.name, render: ({ name }) => <TableTitleCell title={<Highlight text={name} query={search} />} /> },
  {
    key: "time",
    header: TIME_BAND_TEXT.time,
    sortField: TIME_BAND_SORT_FIELDS.startsAt,
    render: ({ startsAt, endsAt }) => <span className="tabular-nums">{`${startsAt} – ${endsAt}`}</span>,
  },
  { key: "multiplier", header: TIME_BAND_TEXT.multiplier, sortField: TIME_BAND_SORT_FIELDS.multiplier, render: ({ multiplier }) => formatMultiplier(multiplier) },
];

export const TimeBandTable = ({ timeBands, isLoading, search, emptyText, sorting, onSelect }: ITimeBandTableProps) => (
  <DataTable
    columns={getColumns(search)}
    sorting={sorting}
    rows={timeBands}
    getRowKey={({ id }) => id}
    isLoading={isLoading}
    emptyText={emptyText}
    onRowClick={onSelect}
  />
);

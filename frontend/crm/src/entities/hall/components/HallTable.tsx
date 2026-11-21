"use client";

import { formatMultiplier, formatRubles } from "@/shared/lib";
import { Badge, DataTable, Highlight, type IDataTableColumn, type IDataTableSorting, TableTitleCell } from "@/shared/ui";
import { PriceZoneDot } from "@/entities/hall/components/PriceZoneDot";
import { HALL_SORT_FIELDS, HALL_TEXT, type HallSortField } from "@/entities/hall/constants/hall.constant";
import type { IHall } from "@/entities/hall/interfaces/hall.interface";

interface IHallTableProps {
  halls: IHall[] | undefined;
  isLoading: boolean;
  search: string;
  emptyText: string;
  sorting: IDataTableSorting<HallSortField>;
  onSelect: (hall: IHall) => void;
}

const getColumns = (search: string): IDataTableColumn<IHall, HallSortField>[] => [
  {
    key: "name",
    header: HALL_TEXT.hall,
    sortField: HALL_SORT_FIELDS.name,
    render: ({ name, format }) => <TableTitleCell title={<Highlight text={name} query={search} />} subtitle={<Highlight text={format} query={search} />} />,
  },
  { key: "basePrice", header: HALL_TEXT.basePrice, sortField: HALL_SORT_FIELDS.basePrice, render: ({ basePrice }) => formatRubles(basePrice) },
  {
    key: "priceZones",
    header: HALL_TEXT.priceZones,
    render: ({ priceZones }) =>
      priceZones.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {priceZones.map((priceZone) => (
            <PriceZoneDot
              key={priceZone.id}
              priceZone={priceZone}
              priceZones={priceZones}
              label={`${priceZone.name} ${formatMultiplier(priceZone.multiplier)}`}
            />
          ))}
        </div>
      ) : (
        <span className="text-gray-500">{HALL_TEXT.noZones}</span>
      ),
  },
  { key: "timeBands", header: HALL_TEXT.timeBands, render: ({ useTimeBands }) => (useTimeBands ? HALL_TEXT.timeBandsOn : HALL_TEXT.timeBandsOff) },
  {
    key: "status",
    header: HALL_TEXT.status,
    render: ({ isActive }) => <Badge tone={isActive ? "success" : "neutral"}>{isActive ? HALL_TEXT.active : HALL_TEXT.inactive}</Badge>,
  },
];

export const HallTable = ({ halls, isLoading, search, emptyText, sorting, onSelect }: IHallTableProps) => (
  <DataTable
    columns={getColumns(search)}
    sorting={sorting}
    rows={halls}
    getRowKey={({ id }) => id}
    isLoading={isLoading}
    emptyText={emptyText}
    onRowClick={onSelect}
  />
);

"use client";

import { formatRubles } from "@/shared/lib";
import { Badge, DataTable, type IDataTableColumn } from "@/shared/ui";
import { PriceZoneLabel } from "@/entities/hall/components/PriceZoneLabel";
import { HALL_TEXT } from "@/entities/hall/constants/hall.constant";
import type { IHall } from "@/entities/hall/interfaces/hall.interface";

interface IHallTableProps {
  halls: IHall[] | undefined;
  isLoading: boolean;
  onSelect: (hall: IHall) => void;
}

const COLUMNS: readonly IDataTableColumn<IHall>[] = [
  {
    key: "name",
    header: HALL_TEXT.hall,
    render: ({ name, format }) => (
      <div>
        <p className="font-medium text-ink">{name}</p>
        <p className="text-xs text-gray-500">{format}</p>
      </div>
    ),
  },
  { key: "basePrice", header: HALL_TEXT.basePrice, render: ({ basePrice }) => formatRubles(basePrice) },
  {
    key: "priceZones",
    header: HALL_TEXT.priceZones,
    render: ({ priceZones }) =>
      priceZones.length > 0 ? (
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {priceZones.map((priceZone) => (
            <PriceZoneLabel key={priceZone.id} priceZone={priceZone} priceZones={priceZones} />
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

export const HallTable = ({ halls, isLoading, onSelect }: IHallTableProps) => (
  <DataTable columns={COLUMNS} rows={halls} getRowKey={({ id }) => id} isLoading={isLoading} emptyText={HALL_TEXT.empty} onRowClick={onSelect} />
);

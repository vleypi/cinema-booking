"use client";

import { Badge, DataTable, type IDataTableColumn } from "@/shared/ui";
import { CINEMA_TEXT } from "@/entities/cinema/constants/cinema.constant";
import type { ICinema } from "@/entities/cinema/interfaces/cinema.interface";

interface ICinemaTableProps {
  cinemas: ICinema[] | undefined;
  isLoading: boolean;
  onSelect: (cinema: ICinema) => void;
}

const COLUMNS: readonly IDataTableColumn<ICinema>[] = [
  {
    key: "name",
    header: CINEMA_TEXT.name,
    render: ({ name, slug }) => (
      <div>
        <p className="font-medium text-ink">{name}</p>
        <p className="text-xs text-gray-500">/{slug}</p>
      </div>
    ),
  },
  { key: "address", header: CINEMA_TEXT.address, render: ({ address }) => address },
  { key: "hours", header: CINEMA_TEXT.hours, render: ({ opensAt, closesAt }) => `${opensAt} – ${closesAt}` },
  { key: "timezone", header: CINEMA_TEXT.timezone, render: ({ timezone }) => timezone },
  {
    key: "status",
    header: CINEMA_TEXT.status,
    render: ({ isPublished }) => <Badge tone={isPublished ? "success" : "neutral"}>{isPublished ? CINEMA_TEXT.published : CINEMA_TEXT.hidden}</Badge>,
  },
];

export const CinemaTable = ({ cinemas, isLoading, onSelect }: ICinemaTableProps) => (
  <DataTable columns={COLUMNS} rows={cinemas} getRowKey={({ id }) => id} isLoading={isLoading} emptyText={CINEMA_TEXT.empty} onRowClick={onSelect} />
);

"use client";

import { Badge, DataTable, Highlight, type IDataTableColumn, type IDataTableSorting, TableTitleCell } from "@/shared/ui";
import { CINEMA_SORT_FIELDS, CINEMA_TEXT, type CinemaSortField } from "@/entities/cinema/constants/cinema.constant";
import type { ICinema } from "@/entities/cinema/interfaces/cinema.interface";

interface ICinemaTableProps {
  cinemas: ICinema[] | undefined;
  isLoading: boolean;
  search: string;
  emptyText: string;
  sorting: IDataTableSorting<CinemaSortField>;
  onSelect: (cinema: ICinema) => void;
}

const getColumns = (search: string): IDataTableColumn<ICinema, CinemaSortField>[] => [
  {
    key: "name",
    header: CINEMA_TEXT.name,
    sortField: CINEMA_SORT_FIELDS.name,
    render: ({ name, slug }) => (
      <TableTitleCell
        title={<Highlight text={name} query={search} />}
        subtitle={
          <>
            /<Highlight text={slug} query={search} />
          </>
        }
      />
    ),
  },
  { key: "address", header: CINEMA_TEXT.address, render: ({ address }) => <Highlight text={address} query={search} /> },
  { key: "hours", header: CINEMA_TEXT.hours, render: ({ opensAt, closesAt }) => `${opensAt} – ${closesAt}` },
  { key: "timezone", header: CINEMA_TEXT.timezone, sortField: CINEMA_SORT_FIELDS.timezone, render: ({ timezone }) => timezone },
  {
    key: "status",
    header: CINEMA_TEXT.status,
    render: ({ isPublished }) => <Badge tone={isPublished ? "success" : "neutral"}>{isPublished ? CINEMA_TEXT.published : CINEMA_TEXT.hidden}</Badge>,
  },
];

export const CinemaTable = ({ cinemas, isLoading, search, emptyText, sorting, onSelect }: ICinemaTableProps) => (
  <DataTable
    columns={getColumns(search)}
    sorting={sorting}
    rows={cinemas}
    getRowKey={({ id }) => id}
    isLoading={isLoading}
    emptyText={emptyText}
    onRowClick={onSelect}
  />
);

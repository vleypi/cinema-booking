"use client";

import { STAFF_ROLE_LABELS } from "@/shared/config";
import { Badge, DataTable, Highlight, type IDataTableColumn, type IDataTableSorting } from "@/shared/ui";
import { StaffStatus } from "@/entities/staff/components/StaffStatus";
import { STAFF_ROLE_TONES, STAFF_SORT_FIELDS, STAFF_TEXT, type StaffSortField } from "@/entities/staff/constants/staff.constant";
import type { IStaffMember } from "@/entities/staff/interfaces/staff.interface";

interface IStaffTableProps {
  staff: IStaffMember[] | undefined;
  isLoading: boolean;
  search: string;
  emptyText: string;
  sorting: IDataTableSorting<StaffSortField>;
  onSelect: (member: IStaffMember) => void;
  canEdit: (member: IStaffMember) => boolean;
}

const getColumns = (search: string): IDataTableColumn<IStaffMember, StaffSortField>[] => [
  {
    key: "member",
    header: STAFF_TEXT.member,
    sortField: STAFF_SORT_FIELDS.fullName,
    render: ({ fullName, login }) => (
      <div>
        <p className="font-medium text-ink">
          <Highlight text={fullName} query={search} />
        </p>
        <p className="text-xs text-gray-500">
          <Highlight text={login} query={search} />
        </p>
      </div>
    ),
  },
  { key: "role", header: STAFF_TEXT.role, sortField: STAFF_SORT_FIELDS.role, render: ({ role }) => <Badge tone={STAFF_ROLE_TONES[role]}>{STAFF_ROLE_LABELS[role]}</Badge> },
  { key: "cinemas", header: STAFF_TEXT.cinemas, render: ({ cinemas }) => cinemas.map(({ name }) => name).join(", ") },
  { key: "status", header: STAFF_TEXT.status, sortField: STAFF_SORT_FIELDS.status, render: (member) => <StaffStatus {...member} /> },
];

export const StaffTable = ({ staff, isLoading, search, emptyText, sorting, onSelect, canEdit }: IStaffTableProps) => (
  <DataTable
    columns={getColumns(search)}
    sorting={sorting}
    rows={staff}
    getRowKey={({ id }) => id}
    isLoading={isLoading}
    emptyText={emptyText}
    onRowClick={onSelect}
    isRowClickable={canEdit}
  />
);

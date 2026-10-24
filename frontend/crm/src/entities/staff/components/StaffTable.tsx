"use client";

import { STAFF_ROLE_LABELS } from "@/shared/config";
import { Badge, DataTable, type IDataTableColumn } from "@/shared/ui";
import { StaffStatus } from "@/entities/staff/components/StaffStatus";
import { STAFF_ROLE_TONES, STAFF_TEXT } from "@/entities/staff/constants/staff.constant";
import type { IStaffMember } from "@/entities/staff/interfaces/staff.interface";

interface IStaffTableProps {
  staff: IStaffMember[] | undefined;
  isLoading: boolean;
  onSelect: (member: IStaffMember) => void;
  canEdit: (member: IStaffMember) => boolean;
}

const COLUMNS: readonly IDataTableColumn<IStaffMember>[] = [
  {
    key: "member",
    header: STAFF_TEXT.member,
    render: ({ fullName, login }) => (
      <div>
        <p className="font-medium text-ink">{fullName}</p>
        <p className="text-xs text-gray-400">{login}</p>
      </div>
    ),
  },
  { key: "role", header: STAFF_TEXT.role, render: ({ role }) => <Badge tone={STAFF_ROLE_TONES[role]}>{STAFF_ROLE_LABELS[role]}</Badge> },
  { key: "cinemas", header: STAFF_TEXT.cinemas, render: ({ cinemas }) => cinemas.map(({ name }) => name).join(", ") },
  { key: "status", header: STAFF_TEXT.status, render: (member) => <StaffStatus {...member} /> },
];

export const StaffTable = ({ staff, isLoading, onSelect, canEdit }: IStaffTableProps) => (
  <DataTable
    columns={COLUMNS}
    rows={staff}
    getRowKey={({ id }) => id}
    isLoading={isLoading}
    emptyText={STAFF_TEXT.empty}
    onRowClick={onSelect}
    isRowClickable={canEdit}
  />
);

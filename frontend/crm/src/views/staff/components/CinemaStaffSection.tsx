"use client";

import { Modal } from "@luch/shared/ui";
import type { ICinemaSummary } from "@/shared/api";
import { useEntityModal, useListParams } from "@/shared/lib";
import { ListToolbar, PageHeader, Pagination } from "@/shared/ui";
import { type IStaffMember, STAFF_FILTERS, STAFF_SORT_FIELDS, STAFF_SORT_OPTIONS, STAFF_TEXT, StaffTable, useCinemaStaff } from "@/entities/staff";
import { canManageRole, getAssignableRoles, type IViewer } from "@/entities/viewer";
import { StaffForm } from "@/features/save-staff";
import { STAFF_PAGE_TEXT } from "@/views/staff/constants/staff-page.constant";

interface ICinemaStaffSectionProps {
  viewer: IViewer;
  cinema: ICinemaSummary;
}

const STAFF_LIST_FILTERS = [STAFF_FILTERS.role, STAFF_FILTERS.status];

export const CinemaStaffSection = ({ viewer, cinema }: ICinemaStaffSectionProps) => {
  const list = useListParams(Object.values(STAFF_SORT_FIELDS));
  const { data, isPending } = useCinemaStaff(cinema.id, {
    ...list.request,
    role: list.getFilter(STAFF_FILTERS.role),
    status: list.getFilter(STAFF_FILTERS.status),
  });
  const modal = useEntityModal<IStaffMember>();
  const roles = getAssignableRoles(viewer);
  const canEdit = (member: IStaffMember) => member.id !== viewer.id && canManageRole(viewer, member.role);

  return (
    <>
      <PageHeader title={STAFF_PAGE_TEXT.title} add={roles.length > 0 ? { label: STAFF_PAGE_TEXT.add, onClick: modal.openCreate } : undefined} />
      <ListToolbar
        list={list}
        placeholder={STAFF_TEXT.searchPlaceholder}
        total={data?.total}
        filters={STAFF_LIST_FILTERS}
        sortOptions={STAFF_SORT_OPTIONS}
      />
      <StaffTable
        staff={data?.items}
        isLoading={isPending}
        search={list.search}
        emptyText={list.getEmptyText(STAFF_TEXT.empty, STAFF_LIST_FILTERS)}
        sorting={list.sorting}
        onSelect={modal.openEdit}
        canEdit={canEdit}
      />
      <Pagination page={list.page} pageSize={list.pageSize} total={data?.total ?? 0} onChange={list.setPage} />
      <Modal size="lg" isOpen={modal.isOpen} title={modal.entity ? STAFF_PAGE_TEXT.editTitle : STAFF_PAGE_TEXT.createTitle} onClose={modal.close}>
        <StaffForm member={modal.entity} roles={roles} cinemas={viewer.cinemas} currentCinemaId={cinema.id} onDone={modal.close} />
      </Modal>
    </>
  );
};

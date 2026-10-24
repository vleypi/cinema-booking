"use client";

import { Button, Icon, Modal } from "@luch/shared/ui";
import type { ICinemaSummary } from "@/shared/api";
import { useEntityModal } from "@/shared/lib";
import { PageHeader } from "@/shared/ui";
import { type IStaffMember, StaffTable, useCinemaStaff } from "@/entities/staff";
import { canManageRole, getAssignableRoles, type IViewer } from "@/entities/viewer";
import { StaffForm } from "@/features/save-staff";
import { STAFF_PAGE_TEXT } from "@/views/staff/constants/staff-page.constant";

interface ICinemaStaffSectionProps {
  viewer: IViewer;
  cinema: ICinemaSummary;
}

export const CinemaStaffSection = ({ viewer, cinema }: ICinemaStaffSectionProps) => {
  const { data: staff, isPending } = useCinemaStaff(cinema.id);
  const modal = useEntityModal<IStaffMember>();
  const roles = getAssignableRoles(viewer);
  const canEdit = (member: IStaffMember) => member.id !== viewer.id && canManageRole(viewer, member.role);

  return (
    <>
      <PageHeader
        title={STAFF_PAGE_TEXT.title}
        description={`${STAFF_PAGE_TEXT.description}: ${cinema.name}`}
        actions={
          roles.length > 0 && (
            <Button onClick={modal.openCreate}>
              <Icon name="plus" className="size-4" />
              {STAFF_PAGE_TEXT.add}
            </Button>
          )
        }
      />
      <StaffTable staff={staff} isLoading={isPending} onSelect={modal.openEdit} canEdit={canEdit} />
      <Modal isOpen={modal.isOpen} title={modal.entity ? STAFF_PAGE_TEXT.editTitle : STAFF_PAGE_TEXT.createTitle} onClose={modal.close}>
        <StaffForm member={modal.entity} roles={roles} cinemas={viewer.cinemas} currentCinemaId={cinema.id} onDone={modal.close} />
      </Modal>
    </>
  );
};

import { Badge } from "@/shared/ui";
import { STAFF_TEXT } from "@/entities/staff/constants/staff.constant";
import type { IStaffMember } from "@/entities/staff/interfaces/staff.interface";

type StaffStatusProps = Pick<IStaffMember, "isBlocked" | "mustChangePassword">;

export const StaffStatus = ({ isBlocked, mustChangePassword }: StaffStatusProps) => {
  if (isBlocked) return <Badge tone="danger">{STAFF_TEXT.blocked}</Badge>;
  if (mustChangePassword) return <Badge tone="warning">{STAFF_TEXT.temporaryPassword}</Badge>;

  return <Badge tone="success">{STAFF_TEXT.active}</Badge>;
};

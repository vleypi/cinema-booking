import type { ICinemaSummary } from "@/shared/api";
import type { StaffRole } from "@/shared/config";
import type { ICreateStaffPayload, IStaffMember, IUpdateStaffPayload } from "@/entities/staff";
import type { StaffFormValues } from "@/features/save-staff/schemas/staff-form.schema";

export const toStaffFormValues = (member: IStaffMember | null, cinemas: ICinemaSummary[], defaultRole: StaffRole, currentCinemaId: string): StaffFormValues => {
  if (!member) return { login: "", password: "", fullName: "", role: defaultRole, cinemaIds: [currentCinemaId], isBlocked: false };

  const availableIds = new Set(cinemas.map(({ id }) => id));
  return {
    login: member.login,
    password: "",
    fullName: member.fullName,
    role: member.role,
    cinemaIds: member.cinemas.map(({ id }) => id).filter((id) => availableIds.has(id)),
    isBlocked: member.isBlocked,
  };
};

export const toCreatePayload = ({ login, password, fullName, role, cinemaIds }: StaffFormValues): ICreateStaffPayload => ({
  login,
  password,
  fullName,
  role,
  cinemaIds,
});

export const toUpdatePayload = ({ password, fullName, role, cinemaIds, isBlocked }: StaffFormValues): IUpdateStaffPayload => ({
  fullName,
  role,
  cinemaIds,
  isBlocked,
  ...(password && { password }),
});

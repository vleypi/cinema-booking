import type { ICinemaSummary, IListRequest } from "@/shared/api";
import type { StaffRole } from "@/shared/config";
import type { StaffSortField, StaffStatusFilter } from "@/entities/staff/constants/staff.constant";

export interface IStaffMember {
  id: string;
  login: string;
  fullName: string;
  role: StaffRole;
  isBlocked: boolean;
  mustChangePassword: boolean;
  cinemas: ICinemaSummary[];
}

export interface ICreateStaffPayload {
  login: string;
  password: string;
  fullName: string;
  role: StaffRole;
  cinemaIds: string[];
}

export interface IUpdateStaffPayload {
  fullName: string;
  role: StaffRole;
  cinemaIds: string[];
  isBlocked: boolean;
  password?: string;
}

export interface IStaffListRequest extends IListRequest<StaffSortField> {
  role?: StaffRole;
  status?: StaffStatusFilter;
}

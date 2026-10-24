import type { ICinemaSummary } from "@/shared/api";
import type { StaffRole } from "@/shared/config";

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

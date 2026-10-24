import type { ICinemaSummary } from "@/shared/api";
import type { Permission, StaffRole } from "@/shared/config";

export interface IViewer {
  id: string;
  login: string;
  fullName: string;
  role: StaffRole;
  mustChangePassword: boolean;
  permissions: Permission[];
  cinemas: ICinemaSummary[];
}

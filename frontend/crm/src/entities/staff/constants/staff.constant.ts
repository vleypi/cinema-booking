import type { BadgeTone } from "@/shared/ui";
import type { StaffRole } from "@/shared/config";

export const STAFF_SORT_FIELDS = {
  fullName: "fullName",
  role: "role",
  status: "status",
} as const;

export type StaffSortField = (typeof STAFF_SORT_FIELDS)[keyof typeof STAFF_SORT_FIELDS];

export const STAFF_TEXT = {
  member: "Сотрудник",
  role: "Роль",
  cinemas: "Кинотеатры",
  status: "Статус",
  active: "Работает",
  blocked: "Заблокирован",
  temporaryPassword: "Временный пароль",
  empty: "В этом кинотеатре пока нет сотрудников",
  searchPlaceholder: "ФИО или логин",
} as const;

export const STAFF_ROLE_TONES: Record<StaffRole, BadgeTone> = {
  SUPER_ADMIN: "danger",
  ADMIN: "brand",
  MANAGER: "success",
  CASHIER: "warning",
  CONTROLLER: "neutral",
};

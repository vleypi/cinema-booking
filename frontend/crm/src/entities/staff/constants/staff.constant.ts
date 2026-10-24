import type { BadgeTone } from "@/shared/ui";
import type { StaffRole } from "@/shared/config";

export const STAFF_TEXT = {
  member: "Сотрудник",
  role: "Роль",
  cinemas: "Кинотеатры",
  status: "Статус",
  active: "Работает",
  blocked: "Заблокирован",
  temporaryPassword: "Временный пароль",
  empty: "В этом кинотеатре пока нет сотрудников",
} as const;

export const STAFF_ROLE_TONES: Record<StaffRole, BadgeTone> = {
  SUPER_ADMIN: "danger",
  ADMIN: "brand",
  MANAGER: "success",
  CASHIER: "warning",
  CONTROLLER: "neutral",
};

import { type Permission, PERMISSIONS } from "@/shared/config/permission.constant";

export const STAFF_ROLES = {
  superAdmin: "SUPER_ADMIN",
  admin: "ADMIN",
  manager: "MANAGER",
  cashier: "CASHIER",
  controller: "CONTROLLER",
} as const;

export type StaffRole = (typeof STAFF_ROLES)[keyof typeof STAFF_ROLES];

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  SUPER_ADMIN: "Суперадминистратор",
  ADMIN: "Администратор",
  MANAGER: "Менеджер",
  CASHIER: "Кассир",
  CONTROLLER: "Контролер",
};

export const ROLE_MANAGE_PERMISSION: Record<StaffRole, Permission | null> = {
  SUPER_ADMIN: null,
  ADMIN: PERMISSIONS.manageAdmins,
  MANAGER: PERMISSIONS.manageStaff,
  CASHIER: PERMISSIONS.manageStaff,
  CONTROLLER: PERMISSIONS.manageStaff,
};

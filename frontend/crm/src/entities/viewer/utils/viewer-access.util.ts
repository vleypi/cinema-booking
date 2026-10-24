import { type INavItem, NAV_ITEMS, type Permission, ROLE_MANAGE_PERMISSION, STAFF_ROLES, type StaffRole } from "@/shared/config";
import type { IViewer } from "@/entities/viewer/interfaces/viewer.interface";

export const hasPermission = (viewer: IViewer | undefined, permission: Permission): boolean => Boolean(viewer?.permissions.includes(permission));

export const canManageRole = (viewer: IViewer | undefined, role: StaffRole): boolean => {
  const permission = ROLE_MANAGE_PERMISSION[role];
  return permission !== null && hasPermission(viewer, permission);
};

export const getAssignableRoles = (viewer: IViewer | undefined): StaffRole[] =>
  Object.values(STAFF_ROLES).filter((role) => canManageRole(viewer, role));

export const getAvailableNavItems = (viewer: IViewer | undefined): INavItem[] => NAV_ITEMS.filter(({ permission }) => hasPermission(viewer, permission));

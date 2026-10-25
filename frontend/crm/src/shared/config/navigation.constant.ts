import type { IconName } from "@luch/shared/ui";
import { type Permission, PERMISSIONS } from "@/shared/config/permission.constant";
import { ROUTES } from "@/shared/config/routes.constant";

export interface INavItem {
  href: string;
  label: string;
  icon: IconName;
  permission: Permission;
}

export const NAV_ITEMS: readonly INavItem[] = [
  { href: ROUTES.cinemas, label: "Кинотеатры", icon: "building", permission: PERMISSIONS.manageCinemas },
  { href: ROUTES.staff, label: "Сотрудники", icon: "users", permission: PERMISSIONS.manageStaff },
  { href: ROUTES.halls, label: "Залы", icon: "seats", permission: PERMISSIONS.manageHalls },
  { href: ROUTES.prices, label: "Цены", icon: "tag", permission: PERMISSIONS.manageHalls },
];

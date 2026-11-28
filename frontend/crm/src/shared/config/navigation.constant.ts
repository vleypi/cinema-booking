import type { IconName } from "@luch/shared/ui";
import { type Permission, PERMISSIONS } from "@/shared/config/permission.constant";
import { ROUTES } from "@/shared/config/routes.constant";

export interface INavItem {
  href: string;
  label: string;
  icon: IconName;
  permission: Permission | readonly Permission[];
}

export const NAV_ITEMS: readonly INavItem[] = [
  { href: ROUTES.boxOffice, label: "Касса", icon: "ticket", permission: [PERMISSIONS.sellTickets, PERMISSIONS.searchOrders] },
  { href: ROUTES.staff, label: "Сотрудники", icon: "users", permission: PERMISSIONS.manageStaff },
  { href: ROUTES.halls, label: "Залы", icon: "seats", permission: PERMISSIONS.manageHalls },
  { href: ROUTES.prices, label: "Цены", icon: "tag", permission: PERMISSIONS.manageHalls },
  { href: ROUTES.schedule, label: "Расписание", icon: "calendar", permission: PERMISSIONS.manageSchedule },
  { href: ROUTES.films, label: "Фильмы", icon: "film", permission: PERMISSIONS.manageFilms },
];

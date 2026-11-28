import { SORT_ORDERS, STAFF_ROLE_LABELS, STAFF_ROLES, type StaffRole } from "@/shared/config";
import { type IListFilter, toSortValue } from "@/shared/lib";
import type { BadgeTone } from "@/shared/ui";

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

export const STAFF_STATUS_FILTERS = {
  active: "active",
  temporaryPassword: "temporaryPassword",
  blocked: "blocked",
} as const;

export type StaffStatusFilter = (typeof STAFF_STATUS_FILTERS)[keyof typeof STAFF_STATUS_FILTERS];

export const STAFF_FILTERS = {
  role: {
    param: "role",
    allLabel: "Все роли",
    options: Object.values(STAFF_ROLES).map((role) => ({ value: role, label: STAFF_ROLE_LABELS[role] })),
  } satisfies IListFilter<StaffRole>,
  status: {
    param: "status",
    allLabel: "Любой статус",
    options: [
      { value: STAFF_STATUS_FILTERS.active, label: STAFF_TEXT.active },
      { value: STAFF_STATUS_FILTERS.temporaryPassword, label: STAFF_TEXT.temporaryPassword },
      { value: STAFF_STATUS_FILTERS.blocked, label: STAFF_TEXT.blocked },
    ],
  } satisfies IListFilter<StaffStatusFilter>,
};

export const STAFF_SORT_OPTIONS = [
  { value: "", label: "По ФИО, А–Я" },
  { value: toSortValue(STAFF_SORT_FIELDS.fullName, SORT_ORDERS.desc), label: "По ФИО, Я–А" },
  { value: toSortValue(STAFF_SORT_FIELDS.role, SORT_ORDERS.asc), label: "По роли" },
  { value: toSortValue(STAFF_SORT_FIELDS.status, SORT_ORDERS.asc), label: "По статусу" },
];

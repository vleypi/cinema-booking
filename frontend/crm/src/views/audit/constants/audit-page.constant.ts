export const AUDIT_ENTITY_OPTIONS = [
  { value: "", label: "Все объекты" },
  { value: "Session", label: "Сеансы" },
  { value: "Order", label: "Заказы" },
  { value: "Refund", label: "Возвраты" },
  { value: "Hall", label: "Залы" },
  { value: "StaffUser", label: "Сотрудники" },
  { value: "Film", label: "Фильмы" },
] as const;

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  SESSION_CANCELLED: "Отмена сеанса",
};

export const AUDIT_PAGE_TEXT = {
  title: "Журнал аудита",
  entityLabel: "Тип объекта",
  fromLabel: "С даты",
  toLabel: "По дату",
  resetFilters: "Сбросить фильтры",
  emptyTitle: "Записи аудита не найдены",
  emptyDescription: "По выбранным фильтрам нет зафиксированных действий сотрудников.",
  colTime: "Время",
  colStaff: "Сотрудник",
  colAction: "Действие",
  colEntity: "Объект",
  colDetails: "Изменения",
  showDetails: "Показать",
  hideDetails: "Скрыть",
  beforeLabel: "До",
  afterLabel: "После",
} as const;

export const SCHEDULE_DATE_PARAM = "date";

export const SCHEDULE_PAGE_TEXT = {
  title: "Расписание",
  add: "Добавить сеанс",
  createTitle: "Новый сеанс",
  previousDay: "Предыдущий день",
  nextDay: "Следующий день",
  today: "Сегодня",
  day: "День",
  sessionTitle: "Сеанс",
  addToHall: "Добавить сеанс в зал",
  until: "до",
  noHallsTitle: "В кинотеатре нет залов",
  noHallsDescription: "Сеансы ставятся в работающие залы со схемой мест",
} as const;

export const TIMELINE = {
  defaultStartHour: 9,
  defaultEndHour: 24,
  snapMinutes: 15,
  defaultCreateTime: "18:00",
} as const;

export const SESSION_BLOCK_COLORS = ["bg-brand text-white", "bg-mint text-forest", "bg-lime text-forest", "bg-sand text-forest"] as const;

export const CANCELLED_SESSION_CLASS_NAME = "bg-gray-200 text-gray-500 line-through";

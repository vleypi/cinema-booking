export const ALL_OPTION = "all";

export const DAY_KEY_STEPS: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };

export const FILTER_SCHEDULE_TEXT = {
  day: "День",
  film: "Фильм",
  hall: "Зал",
  allFilms: "Все фильмы",
  allHalls: "Все залы",
  emptyFiltered: "С такими фильтрами сеансов нет.",
  emptyDay: "На этот день сеансов нет.",
  reset: "Показать все сеансы ближайшего дня",
} as const;

export const SCHEDULE_TEXT = {
  title: "Расписание сеансов",
  loading: "Расписание загружается…",
  buy: "Купить",
  buyLabel: (filmTitle: string, time: string) => `Купить билет: ${filmTitle}, ${time}`,
} as const;

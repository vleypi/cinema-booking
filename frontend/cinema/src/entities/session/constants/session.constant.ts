export const cinemaSessionsPath = (cinemaId: string) => `/catalog/cinemas/${cinemaId}/sessions`;

export const SCHEDULE_DAYS_COUNT = 7;

export const RELATIVE_DAY_TITLES = ["Сегодня", "Завтра"] as const;

export const SESSION_TEXT = {
  priceFrom: (price: string) => `от ${price}`,
  slotLabel: (time: string, hall: string, price: string) => `${time}, зал «${hall}», от ${price}`,
} as const;

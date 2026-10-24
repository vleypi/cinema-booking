export const SESSION_MESSAGES = {
  notFound: 'Сеанс не найден',
  filmUnavailable: 'Фильм не найден или снят с проката',
  hallUnavailable: 'Зал не найден или закрыт для новых сеансов',
  hallWithoutLayout: 'У зала еще нет схемы мест',
  inPast: 'Нельзя поставить сеанс в прошлом',
  outsideOpeningHours: (opensAt: string, closesAt: string) => `Сеанс должен начаться и закончиться в часы работы кинотеатра с ${opensAt} до ${closesAt}`,
  hallBusy: (title: string, startsAt: string, endsAt: string, breakMinutes: number) =>
    `Зал занят сеансом «${title}» с ${startsAt} до ${endsAt}. Между сеансами нужен перерыв ${breakMinutes} мин`,
} as const;

export const ORDER_CONFIRMATION_TEXT = {
  eyebrow: "Возврат после оплаты",
  title: (number: string) => `Заказ ${number}`,
  description:
    "После подтверждения оплаты от ЮKassa билеты в формате PDF с QR-кодами придут на указанную почту в течение минуты. Вы также можете открыть их в личном кабинете.",
  cabinetButton: "Открыть личный кабинет",
  homeButton: "Вернуться к афише",
} as const;

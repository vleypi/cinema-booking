export const CANCEL_SESSION_TEXT = {
  buttonLabel: "Отменить сеанс",
  modalTitle: "Отмена сеанса",
  loadingPreview: "Загрузка информации о проданных билетах...",
  previewSummary: (tickets: number, orders: number, amount: string) =>
    `Будет оформлен автоматический возврат по ${orders} заказам (${tickets} билетов) на общую сумму ${amount}.`,
  previewNoTickets: "На этот сеанс нет активных билетов. После отмены сеанс исчезнет из продаж.",
  reasonLabel: "Причина отмены",
  reasonPlaceholder: "Например, техническая неисправность проектора",
  reasonRequired: "Укажите причину отмены",
  reasonTooLong: "Не длиннее 300 символов",
  confirmLabel: "Подтвердить отмену",
  submittingLabel: "Отмена сеанса...",
  cancelLabel: "Закрыть",
} as const;

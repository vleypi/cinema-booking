export const SAVE_STAFF_TEXT = {
  fullName: "ФИО",
  login: "Логин",
  loginHint: "Логин нельзя изменить после создания",
  role: "Роль",
  password: "Временный пароль",
  passwordHint: "Сообщите его сотруднику, при первом входе он задаст свой",
  newPassword: "Новый временный пароль",
  newPasswordHint: "Оставьте пустым, чтобы не менять пароль",
  cinemas: "Кинотеатры",
  cinemasRequired: "Выберите хотя бы один кинотеатр",
  isBlocked: "Заблокировать",
  isBlockedHint: "Сотрудник сразу потеряет доступ, включая открытые сеансы работы",
  required: "Заполните поле",
  tooLong: "Слишком длинное значение",
  create: "Добавить сотрудника",
  save: "Сохранить",
  cancel: "Отмена",
} as const;

export const FULL_NAME_MAX_LENGTH = 150;

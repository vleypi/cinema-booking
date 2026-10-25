export const SESSION_FORMATS = ["2D", "3D"] as const;

export type SessionFormat = (typeof SESSION_FORMATS)[number];

export const SESSION_STATUSES = {
  scheduled: "SCHEDULED",
  cancelled: "CANCELLED",
} as const;

export type SessionStatus = (typeof SESSION_STATUSES)[keyof typeof SESSION_STATUSES];

export const SESSION_TEXT = {
  cancelled: "Отменен",
  until: "до",
  priceFrom: "базовая",
} as const;

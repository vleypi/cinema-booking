export const PERMISSIONS = {
  manageCinemas: "cinemas.manage",
  manageAdmins: "admins.manage",
  manageStaff: "staff.manage",
  manageHalls: "halls.manage",
  manageFilms: "films.manage",
  manageSchedule: "schedule.manage",
  cancelSessions: "sessions.cancel",
  sellTickets: "tickets.sell",
  refundTickets: "tickets.refund",
  searchOrders: "orders.search",
  scanTickets: "tickets.scan",
  viewReports: "reports.view",
  viewAuditLog: "audit.view",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

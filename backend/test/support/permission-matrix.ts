import { Permission } from '@/modules/auth/permissions.js';
import { StaffRole } from '@/modules/staff/staff-role.enum.js';

const { SuperAdmin, Admin, Manager, Cashier, Controller } = StaffRole;

export const PERMISSION_MATRIX: Record<Permission, StaffRole[]> = {
  [Permission.ManageCinemas]: [SuperAdmin],
  [Permission.ManageAdmins]: [SuperAdmin],
  [Permission.ManageStaff]: [SuperAdmin, Admin],
  [Permission.ManageHalls]: [SuperAdmin, Admin],
  [Permission.ManageFilms]: [SuperAdmin, Admin, Manager],
  [Permission.ManageSchedule]: [SuperAdmin, Admin, Manager],
  [Permission.CancelSessions]: [SuperAdmin, Admin, Manager],
  [Permission.SellTickets]: [SuperAdmin, Admin, Manager, Cashier],
  [Permission.RefundTickets]: [SuperAdmin, Admin, Manager, Cashier],
  [Permission.SearchOrders]: [SuperAdmin, Admin, Manager, Cashier, Controller],
  [Permission.ScanTickets]: [SuperAdmin, Admin, Manager, Cashier, Controller],
  [Permission.ViewReports]: [SuperAdmin, Admin, Manager],
  [Permission.ViewAuditLog]: [SuperAdmin, Admin],
};

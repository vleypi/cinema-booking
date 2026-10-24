import type { StaffUser } from '@/modules/staff/entities/staff-user.entity.js';
import { StaffRole } from '@/modules/staff/staff-role.enum.js';

export enum Permission {
  ManageCinemas = 'cinemas.manage',
  ManageAdmins = 'admins.manage',
  ManageStaff = 'staff.manage',
  ManageHalls = 'halls.manage',
  ManageFilms = 'films.manage',
  ManageSchedule = 'schedule.manage',
  CancelSessions = 'sessions.cancel',
  SellTickets = 'tickets.sell',
  RefundTickets = 'tickets.refund',
  SearchOrders = 'orders.search',
  ScanTickets = 'tickets.scan',
  ViewReports = 'reports.view',
  ViewAuditLog = 'audit.view',
}

const CONTROLLER = [Permission.SearchOrders, Permission.ScanTickets];
const CASHIER = [...CONTROLLER, Permission.SellTickets, Permission.RefundTickets];
const MANAGER = [...CASHIER, Permission.ManageFilms, Permission.ManageSchedule, Permission.CancelSessions, Permission.ViewReports];
const ADMIN = [...MANAGER, Permission.ManageStaff, Permission.ManageHalls, Permission.ViewAuditLog];

export const ROLE_PERMISSIONS: Record<StaffRole, Permission[]> = {
  [StaffRole.SuperAdmin]: Object.values(Permission),
  [StaffRole.Admin]: ADMIN,
  [StaffRole.Manager]: MANAGER,
  [StaffRole.Cashier]: CASHIER,
  [StaffRole.Controller]: CONTROLLER,
};

export const canAccessCinema = ({ role, cinemas }: StaffUser, cinemaId: string): boolean =>
  role === StaffRole.SuperAdmin || cinemas.some((cinema) => cinema.id === cinemaId);

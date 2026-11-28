export interface IAuditLog {
  id: string;
  staffUserId: string;
  staffFullName: string;
  cinemaId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  createdAt: string;
}

export interface IAuditLogFilter {
  entityType: string;
  from: string;
  to: string;
}

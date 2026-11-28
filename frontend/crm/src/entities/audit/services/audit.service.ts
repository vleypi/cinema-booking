import { apiClient } from "@/shared/api";
import type { IAuditLog, IAuditLogFilter } from "@/entities/audit/interfaces/audit.interface";

class AuditService {
  async list(cinemaId: string, filter: IAuditLogFilter): Promise<IAuditLog[]> {
    const { data } = await apiClient.get<IAuditLog[]>(`/cinemas/${cinemaId}/audit-logs`, {
      params: {
        ...(filter.entityType && { entityType: filter.entityType }),
        ...(filter.from && { from: filter.from }),
        ...(filter.to && { to: filter.to }),
      },
    });
    return data;
  }
}

export const auditService = new AuditService();

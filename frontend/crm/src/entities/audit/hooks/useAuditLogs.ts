"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import type { IAuditLogFilter } from "@/entities/audit/interfaces/audit.interface";
import { auditService } from "@/entities/audit/services/audit.service";

export const useAuditLogs = (cinemaId: string, filter: IAuditLogFilter) =>
  useQuery({
    queryKey: QUERY_KEYS.auditLogs(cinemaId, filter.entityType, filter.from, filter.to),
    queryFn: () => auditService.list(cinemaId, filter),
    enabled: Boolean(cinemaId),
  });

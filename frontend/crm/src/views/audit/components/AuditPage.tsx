"use client";

import { PERMISSIONS } from "@/shared/config";
import { RequireCurrentCinema, RequirePermission } from "@/entities/viewer";
import { AuditSection } from "@/views/audit/components/AuditSection";

export const AuditPage = () => (
  <RequirePermission permission={PERMISSIONS.viewAuditLog}>
    <RequireCurrentCinema>{(cinema) => <AuditSection key={cinema.id} cinema={cinema} />}</RequireCurrentCinema>
  </RequirePermission>
);

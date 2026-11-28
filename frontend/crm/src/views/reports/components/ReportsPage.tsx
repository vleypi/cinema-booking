"use client";

import { PERMISSIONS } from "@/shared/config";
import { RequireCurrentCinema, RequirePermission } from "@/entities/viewer";
import { ReportsSection } from "@/views/reports/components/ReportsSection";

export const ReportsPage = () => (
  <RequirePermission permission={PERMISSIONS.viewReports}>
    <RequireCurrentCinema>{(cinema) => <ReportsSection key={cinema.id} cinema={cinema} />}</RequireCurrentCinema>
  </RequirePermission>
);

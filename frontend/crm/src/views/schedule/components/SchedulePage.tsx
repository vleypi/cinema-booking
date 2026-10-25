"use client";

import { PERMISSIONS } from "@/shared/config";
import { RequireCurrentCinema, RequirePermission } from "@/entities/viewer";
import { CinemaScheduleSection } from "@/views/schedule/components/CinemaScheduleSection";

export const SchedulePage = () => (
  <RequirePermission permission={PERMISSIONS.manageSchedule}>
    <RequireCurrentCinema>{(cinema) => <CinemaScheduleSection key={cinema.id} cinema={cinema} />}</RequireCurrentCinema>
  </RequirePermission>
);

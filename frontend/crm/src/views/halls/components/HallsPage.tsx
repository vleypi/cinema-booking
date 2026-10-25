"use client";

import { PERMISSIONS } from "@/shared/config";
import { RequireCurrentCinema, RequirePermission } from "@/entities/viewer";
import { CinemaHallsSection } from "@/views/halls/components/CinemaHallsSection";

export const HallsPage = () => (
  <RequirePermission permission={PERMISSIONS.manageHalls}>
    <RequireCurrentCinema>{(cinema) => <CinemaHallsSection key={cinema.id} cinema={cinema} />}</RequireCurrentCinema>
  </RequirePermission>
);

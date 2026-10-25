"use client";

import { RequireCurrentCinema, useViewer } from "@/entities/viewer";
import { CinemaStaffSection } from "@/views/staff/components/CinemaStaffSection";

export const StaffSection = () => {
  const { data: viewer } = useViewer();

  if (!viewer) return null;

  return <RequireCurrentCinema>{(cinema) => <CinemaStaffSection key={cinema.id} viewer={viewer} cinema={cinema} />}</RequireCurrentCinema>;
};

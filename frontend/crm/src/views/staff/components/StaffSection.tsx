"use client";

import { EmptyState } from "@/shared/ui";
import { useCurrentCinema, useViewer } from "@/entities/viewer";
import { CinemaStaffSection } from "@/views/staff/components/CinemaStaffSection";
import { STAFF_PAGE_TEXT } from "@/views/staff/constants/staff-page.constant";

export const StaffSection = () => {
  const { data: viewer } = useViewer();
  const { cinema } = useCurrentCinema();

  if (!viewer) return null;
  if (!cinema) return <EmptyState icon="building" title={STAFF_PAGE_TEXT.noCinemaTitle} description={STAFF_PAGE_TEXT.noCinemaDescription} />;

  return <CinemaStaffSection key={cinema.id} viewer={viewer} cinema={cinema} />;
};

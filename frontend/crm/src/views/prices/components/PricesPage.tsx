"use client";

import { PERMISSIONS } from "@/shared/config";
import { RequireCurrentCinema, RequirePermission } from "@/entities/viewer";
import { CinemaPricesSection } from "@/views/prices/components/CinemaPricesSection";

export const PricesPage = () => (
  <RequirePermission permission={PERMISSIONS.manageHalls}>
    <RequireCurrentCinema>{(cinema) => <CinemaPricesSection key={cinema.id} cinema={cinema} />}</RequireCurrentCinema>
  </RequirePermission>
);

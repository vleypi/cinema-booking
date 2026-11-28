"use client";

import { PERMISSIONS } from "@/shared/config";
import { RequireCurrentCinema, RequirePermission } from "@/entities/viewer";
import { BoxOfficeSection } from "@/views/box-office/components/BoxOfficeSection";

const BOX_OFFICE_PERMISSIONS = [PERMISSIONS.sellTickets, PERMISSIONS.searchOrders] as const;

export const BoxOfficePage = () => (
  <RequirePermission permission={BOX_OFFICE_PERMISSIONS}>
    <RequireCurrentCinema>{(cinema) => <BoxOfficeSection key={cinema.id} cinema={cinema} />}</RequireCurrentCinema>
  </RequirePermission>
);

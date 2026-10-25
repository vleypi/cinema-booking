"use client";

import { PERMISSIONS } from "@/shared/config";
import { RequireCurrentCinema, RequirePermission } from "@/entities/viewer";
import { HallSection } from "@/views/hall/components/HallSection";

interface IHallPageProps {
  hallId: string;
}

export const HallPage = ({ hallId }: IHallPageProps) => (
  <RequirePermission permission={PERMISSIONS.manageHalls}>
    <RequireCurrentCinema>{(cinema) => <HallSection cinema={cinema} hallId={hallId} />}</RequireCurrentCinema>
  </RequirePermission>
);

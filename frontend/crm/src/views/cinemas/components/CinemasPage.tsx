"use client";

import { PERMISSIONS } from "@/shared/config";
import { RequirePermission } from "@/entities/viewer";
import { CinemasSection } from "@/views/cinemas/components/CinemasSection";

export const CinemasPage = () => (
  <RequirePermission permission={PERMISSIONS.manageCinemas}>
    <CinemasSection />
  </RequirePermission>
);

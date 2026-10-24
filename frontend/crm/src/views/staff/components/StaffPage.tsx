"use client";

import { PERMISSIONS } from "@/shared/config";
import { RequirePermission } from "@/entities/viewer";
import { StaffSection } from "@/views/staff/components/StaffSection";

export const StaffPage = () => (
  <RequirePermission permission={PERMISSIONS.manageStaff}>
    <StaffSection />
  </RequirePermission>
);

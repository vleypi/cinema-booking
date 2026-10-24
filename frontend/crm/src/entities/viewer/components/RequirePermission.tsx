"use client";

import type { ReactNode } from "react";
import type { Permission } from "@/shared/config";
import { EmptyState } from "@/shared/ui";
import { VIEWER_TEXT } from "@/entities/viewer/constants/viewer.constant";
import { useViewer } from "@/entities/viewer/hooks/useViewer";
import { hasPermission } from "@/entities/viewer/utils/viewer-access.util";

interface IRequirePermissionProps {
  permission: Permission;
  children: ReactNode;
}

export const RequirePermission = ({ permission, children }: IRequirePermissionProps) => {
  const { data: viewer, isPending } = useViewer();

  if (isPending) return null;
  if (!hasPermission(viewer, permission)) {
    return <EmptyState icon="lock" title={VIEWER_TEXT.forbiddenTitle} description={VIEWER_TEXT.forbiddenDescription} />;
  }

  return children;
};

"use client";

import { useId } from "react";
import { STAFF_ROLE_LABELS } from "@/shared/config";
import { DitherAvatar, HeaderPopover } from "@/shared/ui";
import { useViewer } from "@/entities/viewer";
import { LogoutButton } from "@/features/logout";
import { APP_HEADER_TEXT } from "@/widgets/app-header/constants/app-header.constant";

export const ViewerMenu = () => {
  const { data: viewer } = useViewer();
  const menuId = useId();

  if (!viewer) return <span className="size-9 shrink-0 animate-pulse rounded-full bg-gray-200" />;

  return (
    <>
      <button type="button" popoverTarget={menuId} aria-label={APP_HEADER_TEXT.profileMenu} className="shrink-0 rounded-full transition hover:opacity-80">
        <DitherAvatar />
      </button>
      <HeaderPopover id={menuId} className="right-4 w-64 p-3 md:right-6">
        <div className="flex items-center gap-3 px-2 py-1">
          <DitherAvatar size="sm" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-ink">{viewer.fullName}</span>
            <span className="block truncate text-xs text-gray-500">{STAFF_ROLE_LABELS[viewer.role]}</span>
          </span>
        </div>
        <div className="my-2 h-px bg-gray-100" />
        <LogoutButton />
      </HeaderPopover>
    </>
  );
};

"use client";

import { useId } from "react";
import { STAFF_ROLE_LABELS } from "@/shared/config";
import { useViewer, ViewerAvatar } from "@/entities/viewer";
import { LogoutButton } from "@/features/logout";
import { APP_HEADER_TEXT } from "@/widgets/app-header/constants/app-header.constant";

export const ViewerMenu = () => {
  const { data: viewer } = useViewer();
  const menuId = useId();

  if (!viewer) return <span className="size-9 shrink-0 animate-pulse rounded-xl bg-gray-200" />;

  return (
    <>
      <button type="button" popoverTarget={menuId} aria-label={APP_HEADER_TEXT.profileMenu} className="shrink-0 rounded-xl transition hover:opacity-80">
        <ViewerAvatar viewer={viewer} />
      </button>
      <div
        id={menuId}
        popover="auto"
        className="fixed inset-auto top-header right-4 m-0 mt-2 w-64 -translate-y-1 rounded-2xl border border-gray-100 bg-white p-3 opacity-0 shadow-lg transition-all transition-discrete duration-150 ease-out-expo open:translate-y-0 open:opacity-100 starting:open:-translate-y-1 starting:open:opacity-0 md:right-6"
      >
        <div className="flex items-center gap-3 px-2 py-1">
          <ViewerAvatar viewer={viewer} size="sm" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-ink">{viewer.fullName}</span>
            <span className="block truncate text-xs text-gray-400">{STAFF_ROLE_LABELS[viewer.role]}</span>
          </span>
        </div>
        <div className="my-2 h-px bg-gray-100" />
        <LogoutButton />
      </div>
    </>
  );
};

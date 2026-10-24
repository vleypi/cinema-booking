"use client";

import { Icon } from "@luch/shared/ui";
import { Logo, useSidebar } from "@/shared/ui";
import { CinemaSwitcher } from "@/features/select-cinema";
import { ViewerMenu } from "@/widgets/app-header/components/ViewerMenu";
import { APP_HEADER_TEXT } from "@/widgets/app-header/constants/app-header.constant";

export const AppHeader = () => {
  const { toggle } = useSidebar();

  return (
    <header className="flex h-header shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={APP_HEADER_TEXT.toggleMenu}
          className="rounded-lg p-2 text-gray-700 transition hover:bg-gray-100"
        >
          <Icon name="menu" />
        </button>
        <Logo />
      </div>
      <div className="flex min-w-0 items-center gap-3">
        <CinemaSwitcher />
        <ViewerMenu />
      </div>
    </header>
  );
};

"use client";

import { SidebarShell } from "@/shared/ui";
import { getAvailableNavItems, useViewer } from "@/entities/viewer";
import { SidebarLink } from "@/widgets/sidebar/components/SidebarLink";
import { SIDEBAR_NAV_TEXT } from "@/widgets/sidebar/constants/sidebar.constant";

export const Sidebar = () => {
  const { data: viewer } = useViewer();

  return (
    <SidebarShell>
      <nav aria-label={SIDEBAR_NAV_TEXT.navigation} className="flex flex-col gap-1">
        {getAvailableNavItems(viewer).map((item) => (
          <SidebarLink key={item.href} item={item} />
        ))}
      </nav>
    </SidebarShell>
  );
};

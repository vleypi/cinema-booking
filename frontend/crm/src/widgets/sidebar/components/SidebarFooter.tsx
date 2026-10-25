import { Icon } from "@luch/shared/ui";
import { SIDEBAR_NAV_TEXT } from "@/widgets/sidebar/constants/sidebar.constant";

export const SidebarFooter = () => (
  <div className="mt-auto flex items-center gap-2.5 px-2 pt-4">
    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-linear-to-br from-brand to-ink text-white">
      <Icon name="film" className="size-3.5" />
    </span>
    <span className="min-w-0 transition-opacity duration-200 md:group-data-[expanded=false]:opacity-0">
      <span className="block truncate text-sm font-bold text-ink">{SIDEBAR_NAV_TEXT.footerTitle}</span>
      <span className="block truncate text-xs text-gray-500">{SIDEBAR_NAV_TEXT.footerSubtitle}</span>
    </span>
  </div>
);

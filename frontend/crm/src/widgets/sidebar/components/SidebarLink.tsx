"use client";

import { joinClassNames } from "@luch/shared/lib";
import { Icon } from "@luch/shared/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { INavItem } from "@/shared/config";
import { useSidebar } from "@/shared/ui";

interface ISidebarLinkProps {
  item: INavItem;
}

export const SidebarLink = ({ item: { href, label, icon } }: ISidebarLinkProps) => {
  const pathname = usePathname();
  const { closeMobile } = useSidebar();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      title={label}
      onClick={closeMobile}
      aria-current={isActive ? "page" : undefined}
      className={joinClassNames(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
        isActive ? "bg-brand-soft text-brand" : "text-gray-700 hover:bg-gray-100",
      )}
    >
      <Icon name={icon} />
      <span className="truncate whitespace-nowrap transition-opacity duration-200 md:group-data-[expanded=false]:opacity-0">{label}</span>
    </Link>
  );
};

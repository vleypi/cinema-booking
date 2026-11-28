"use client";

import { joinClassNames } from "@luch/shared/lib";
import Link from "next/link";
import { ROUTES, SECTION_IDS, SITE_TEXT } from "@/shared/config";
import { BrandMark, CONTAINER_CLASS_NAME, ScrollButton } from "@/shared/ui";
import { CinemaSwitcher } from "@/features/select-cinema";
import { EdgeBlur } from "@/widgets/site-header/components/EdgeBlur";
import { useHideOnScroll } from "@/widgets/site-header/hooks/useHideOnScroll";

export const SiteHeader = () => {
  const isHidden = useHideOnScroll(false);

  return (
    <>
      <EdgeBlur />
      <header
        data-hidden={isHidden || undefined}
        className="fixed inset-x-0 top-0 z-50 h-nav px-gutter transition-transform duration-500 ease-out-expo data-hidden:-translate-y-[110%]"
      >
        <div className={joinClassNames(CONTAINER_CLASS_NAME, "flex h-full items-center justify-between gap-4")}>
          <div className="flex min-w-0 items-center gap-4">
            <Link href={ROUTES.home} aria-label={SITE_TEXT.homeLabel} className="inline-flex items-center gap-2.5">
              <BrandMark className="size-6.5" />
              <span className="font-display text-2xl leading-none font-semibold tracking-[0.06em] uppercase">{SITE_TEXT.brand}</span>
            </Link>
            <CinemaSwitcher />
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href={ROUTES.cabinet}
              prefetch={false}
              className="inline-flex min-h-11 items-center px-3 text-[0.9rem] font-medium text-paper/76 transition-colors hover:text-paper"
            >
              {SITE_TEXT.cabinet}
            </Link>
            <ScrollButton sectionId={SECTION_IDS.schedule} size="small" className="shrink-0">
              {SITE_TEXT.buyTicket}
            </ScrollButton>
          </div>
        </div>
      </header>
    </>
  );
};

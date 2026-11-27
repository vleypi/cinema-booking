import type { ReactNode } from "react";
import { SITE_TEXT } from "@/shared/config";
import { CurrentCinemaProvider } from "@/entities/cinema";
import { SiteFooter } from "@/widgets/site-footer";
import { SiteHeader } from "@/widgets/site-header";

interface ISiteLayoutProps {
  initialCinemaId: string | null;
  children: ReactNode;
}

const MAIN_ID = "main";

export const SiteLayout = ({ initialCinemaId, children }: ISiteLayoutProps) => (
  <CurrentCinemaProvider initialCinemaId={initialCinemaId}>
    <a
      href={`#${MAIN_ID}`}
      className="fixed -top-16 left-4 z-100 bg-paper px-4 py-2.5 text-ink transition-[top] duration-300 ease-out-expo focus:top-4"
    >
      {SITE_TEXT.skipToContent}
    </a>
    <SiteHeader />
    <main id={MAIN_ID}>{children}</main>
    <SiteFooter />
  </CurrentCinemaProvider>
);

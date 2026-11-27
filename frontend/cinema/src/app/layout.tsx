import { QueryProvider } from "@luch/shared/query";
import type { Metadata, Viewport } from "next";
import { Golos_Text, JetBrains_Mono, Oswald } from "next/font/google";
import { cookies } from "next/headers";
import { COOKIE_KEYS, SITE_TEXT, SITE_THEME_COLOR } from "@/shared/config";
import { SiteLayout } from "@/views/site-layout";
import "./globals.css";

const golos = Golos_Text({ variable: "--font-golos", subsets: ["latin", "cyrillic"] });
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin", "cyrillic"] });
const jetBrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: { default: SITE_TEXT.title, template: "%s · Луч" },
  description: SITE_TEXT.description,
};

export const viewport: Viewport = {
  themeColor: SITE_THEME_COLOR,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();

  return (
    <html lang="ru" className={`${golos.variable} ${oswald.variable} ${jetBrainsMono.variable}`}>
      <body>
        <QueryProvider>
          <SiteLayout initialCinemaId={cookieStore.get(COOKIE_KEYS.cinemaId)?.value ?? null}>{children}</SiteLayout>
        </QueryProvider>
      </body>
    </html>
  );
}

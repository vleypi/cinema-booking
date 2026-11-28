import { QueryProvider } from "@luch/shared/query";
import type { Metadata } from "next";
import { Onest, Open_Sans } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({ variable: "--font-open-sans", subsets: ["latin", "cyrillic"] });
const onest = Onest({ variable: "--font-onest", subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: { default: "Луч · Персонал", template: "%s · Луч" },
  description: "Приложение персонала сети кинотеатров «Луч»",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${openSans.variable} ${onest.variable}`}>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

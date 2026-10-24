import { QueryProvider } from "@luch/shared/query";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: { default: "Луч · Персонал", template: "%s · Луч" },
  description: "Приложение персонала сети кинотеатров «Луч»",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={inter.variable}>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

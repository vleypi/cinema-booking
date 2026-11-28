import type { Metadata } from "next";
import { ReportsPage } from "@/views/reports";

export const metadata: Metadata = { title: "Отчёты" };

export default function Page() {
  return <ReportsPage />;
}

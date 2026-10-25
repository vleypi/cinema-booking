import type { Metadata } from "next";
import { SchedulePage } from "@/views/schedule";

export const metadata: Metadata = { title: "Расписание" };

export default function Page() {
  return <SchedulePage />;
}

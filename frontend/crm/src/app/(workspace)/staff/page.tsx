import type { Metadata } from "next";
import { StaffPage } from "@/views/staff";

export const metadata: Metadata = { title: "Сотрудники" };

export default function Page() {
  return <StaffPage />;
}

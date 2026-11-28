import type { Metadata } from "next";
import { AuditPage } from "@/views/audit";

export const metadata: Metadata = { title: "Журнал аудита" };

export default function Page() {
  return <AuditPage />;
}

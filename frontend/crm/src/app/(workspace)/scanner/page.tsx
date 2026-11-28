import type { Metadata } from "next";
import { ScannerPage } from "@/views/scanner";

export const metadata: Metadata = { title: "Сканер билетов" };

export default function Page() {
  return <ScannerPage />;
}

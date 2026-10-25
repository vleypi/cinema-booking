import type { Metadata } from "next";
import { HallsPage } from "@/views/halls";

export const metadata: Metadata = { title: "Залы" };

export default function Page() {
  return <HallsPage />;
}

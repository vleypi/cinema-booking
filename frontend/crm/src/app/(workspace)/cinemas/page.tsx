import type { Metadata } from "next";
import { CinemasPage } from "@/views/cinemas";

export const metadata: Metadata = { title: "Кинотеатры" };

export default function Page() {
  return <CinemasPage />;
}

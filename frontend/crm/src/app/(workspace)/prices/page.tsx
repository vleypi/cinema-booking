import type { Metadata } from "next";
import { PricesPage } from "@/views/prices";

export const metadata: Metadata = { title: "Цены" };

export default function Page() {
  return <PricesPage />;
}

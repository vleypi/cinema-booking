import type { Metadata } from "next";
import { BoxOfficePage } from "@/views/box-office";

export const metadata: Metadata = { title: "Касса" };

export default function Page() {
  return <BoxOfficePage />;
}

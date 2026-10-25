import type { Metadata } from "next";
import { FilmsPage } from "@/views/films";

export const metadata: Metadata = { title: "Фильмы" };

export default function Page() {
  return <FilmsPage />;
}

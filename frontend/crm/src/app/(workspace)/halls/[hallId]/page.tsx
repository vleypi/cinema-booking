import type { Metadata } from "next";
import { HallPage } from "@/views/hall";

export const metadata: Metadata = { title: "Зал" };

export default async function Page({ params }: PageProps<"/halls/[hallId]">) {
  const { hallId } = await params;

  return <HallPage hallId={hallId} />;
}

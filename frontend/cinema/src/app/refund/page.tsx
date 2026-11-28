import type { Metadata } from "next";
import { RefundByTokenView } from "@/views/refund";

export const metadata: Metadata = {
  title: "Возврат билетов",
};

interface IRefundPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function Page({ searchParams }: IRefundPageProps) {
  const { token = "" } = await searchParams;
  return <RefundByTokenView token={token} />;
}

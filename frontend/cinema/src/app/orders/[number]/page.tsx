import { OrderConfirmationView } from "@/views/order-confirmation";

export default async function Page({ params }: PageProps<"/orders/[number]">) {
  const { number } = await params;

  return <OrderConfirmationView orderNumber={number} />;
}

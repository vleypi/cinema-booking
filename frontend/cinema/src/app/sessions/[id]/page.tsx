import { SessionBookingView } from "@/views/session-booking";

export default async function Page({ params }: PageProps<"/sessions/[id]">) {
  const { id } = await params;

  return <SessionBookingView sessionId={id} />;
}

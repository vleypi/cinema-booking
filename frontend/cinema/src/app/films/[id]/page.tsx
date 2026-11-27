import { FilmView } from "@/views/film";

export default async function Page({ params }: PageProps<"/films/[id]">) {
  const { id } = await params;

  return <FilmView filmId={id} />;
}

"use client";

import { SECTION_IDS } from "@/shared/config";
import { Reveal, Section } from "@/shared/ui";
import { useCurrentCinema } from "@/entities/cinema";
import { useCinemaFilms } from "@/entities/film";
import { PosterCard } from "@/widgets/afisha/components/PosterCard";
import { AFISHA_TEXT } from "@/widgets/afisha/constants/afisha.constant";

export const Afisha = () => {
  const { cinema } = useCurrentCinema();
  const { data: films = [], isPending } = useCinemaFilms(cinema?.id);

  return (
    <Section id={SECTION_IDS.afisha} title={AFISHA_TEXT.title}>
      {!isPending && films.length === 0 ? (
        <p className="py-8 text-paper/64">{AFISHA_TEXT.empty}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {films.map((film, index) => (
            <li key={film.id} className="h-full">
              <Reveal order={index} className="h-full">
                <PosterCard film={film} />
              </Reveal>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
};

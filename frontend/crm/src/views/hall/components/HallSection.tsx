"use client";

import { Icon } from "@luch/shared/ui";
import Link from "next/link";
import type { ICinemaSummary } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { EmptyState } from "@/shared/ui";
import { useCinemaHalls } from "@/entities/hall";
import { HallDetails } from "@/views/hall/components/HallDetails";
import { HALL_PAGE_TEXT } from "@/views/hall/constants/hall-page.constant";

interface IHallSectionProps {
  cinema: ICinemaSummary;
  hallId: string;
}

export const HallSection = ({ cinema, hallId }: IHallSectionProps) => {
  const { data: halls, isPending } = useCinemaHalls(cinema.id);
  const hall = halls?.find(({ id }) => id === hallId);

  return (
    <>
      <Link href={ROUTES.halls} className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 transition hover:text-ink">
        <Icon name="chevronLeft" className="size-4" />
        {HALL_PAGE_TEXT.backToHalls}
      </Link>
      {isPending && <div className="h-96 animate-pulse rounded-xl bg-gray-100" />}
      {!isPending && !hall && <EmptyState icon="seats" title={HALL_PAGE_TEXT.notFoundTitle} description={HALL_PAGE_TEXT.notFoundDescription} />}
      {hall && <HallDetails hall={hall} />}
    </>
  );
};

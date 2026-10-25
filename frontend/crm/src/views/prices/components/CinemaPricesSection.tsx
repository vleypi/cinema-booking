"use client";

import { joinClassNames } from "@luch/shared/lib";
import Link from "next/link";
import type { ICinemaSummary } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { CARD_CLASS_NAME, PageHeader, SectionHeader } from "@/shared/ui";
import { useCinemaTimeBands } from "@/entities/time-band";
import { TimeBandsForm } from "@/features/edit-time-bands";
import { PRICES_PAGE_TEXT } from "@/views/prices/constants/prices-page.constant";

interface ICinemaPricesSectionProps {
  cinema: ICinemaSummary;
}

export const CinemaPricesSection = ({ cinema }: ICinemaPricesSectionProps) => {
  const { data: timeBands, isPending } = useCinemaTimeBands(cinema.id);

  return (
    <>
      <PageHeader title={PRICES_PAGE_TEXT.title} description={`${PRICES_PAGE_TEXT.description}: ${cinema.name}`} />
      <div className={joinClassNames(CARD_CLASS_NAME, "mb-8 px-5 py-4 text-sm")}>
        <p className="font-semibold text-ink">{PRICES_PAGE_TEXT.formulaTitle}</p>
        <p className="mt-1 text-ink">{PRICES_PAGE_TEXT.formula}</p>
        <p className="mt-1 text-gray-600">
          {PRICES_PAGE_TEXT.formulaHint}{" "}
          <Link href={ROUTES.halls} className="text-brand hover:underline">
            {PRICES_PAGE_TEXT.hallsLink}
          </Link>
        </p>
      </div>
      <SectionHeader title={PRICES_PAGE_TEXT.timeBandsTitle} description={PRICES_PAGE_TEXT.timeBandsDescription} />
      {isPending || !timeBands ? (
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      ) : (
        <TimeBandsForm cinemaId={cinema.id} timeBands={timeBands} />
      )}
    </>
  );
};

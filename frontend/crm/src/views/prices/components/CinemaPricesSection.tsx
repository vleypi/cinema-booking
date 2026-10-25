"use client";

import Link from "next/link";
import type { ICinemaSummary } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { PageHeader, SectionHeader } from "@/shared/ui";
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
      <div className="mb-8 rounded-xl bg-brand-soft px-5 py-4 text-sm">
        <p className="font-semibold text-ink">{PRICES_PAGE_TEXT.formulaTitle}</p>
        <p className="mt-1 text-ink">{PRICES_PAGE_TEXT.formula}</p>
        <Link href={ROUTES.halls} className="mt-1 block text-brand hover:underline">
          {PRICES_PAGE_TEXT.formulaHint}
        </Link>
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

"use client";

import { Modal } from "@luch/shared/ui";
import type { ICinemaSummary } from "@/shared/api";
import { useEntityModal, useListParams } from "@/shared/lib";
import { ListToolbar, PageHeader } from "@/shared/ui";
import {
  filterTimeBands,
  type ITimeBand,
  TIME_BAND_SORT_FIELDS,
  TIME_BAND_SORT_OPTIONS,
  TIME_BAND_TEXT,
  TimeBandTable,
  useCinemaTimeBands,
} from "@/entities/time-band";
import { TIME_BAND_LIMITS, TimeBandForm } from "@/features/save-time-band";
import { PRICES_PAGE_TEXT } from "@/views/prices/constants/prices-page.constant";

interface ICinemaPricesSectionProps {
  cinema: ICinemaSummary;
}

export const CinemaPricesSection = ({ cinema }: ICinemaPricesSectionProps) => {
  const { data: timeBands, isPending } = useCinemaTimeBands(cinema.id);
  const modal = useEntityModal<ITimeBand>();
  const list = useListParams(Object.values(TIME_BAND_SORT_FIELDS));
  const shownTimeBands = timeBands && filterTimeBands(timeBands, list.request);

  return (
    <>
      <PageHeader
        title={PRICES_PAGE_TEXT.title}
        add={{ label: PRICES_PAGE_TEXT.add, onClick: modal.openCreate, disabled: (timeBands?.length ?? 0) >= TIME_BAND_LIMITS.maxBands }}
      />
      {/*
      <ListToolbar
        list={list}
        placeholder={TIME_BAND_TEXT.searchPlaceholder}
        total={shownTimeBands?.length}
        sortOptions={TIME_BAND_SORT_OPTIONS}
      />
      */}
      <TimeBandTable
        timeBands={shownTimeBands}
        isLoading={isPending}
        search={list.search}
        emptyText={list.getEmptyText(TIME_BAND_TEXT.empty)}
        sorting={list.sorting}
        onSelect={modal.openEdit}
      />
      <Modal isOpen={modal.isOpen} title={modal.entity ? PRICES_PAGE_TEXT.editTitle : PRICES_PAGE_TEXT.createTitle} onClose={modal.close}>
        <TimeBandForm cinemaId={cinema.id} timeBands={timeBands ?? []} timeBand={modal.entity} onDone={modal.close} />
      </Modal>
    </>
  );
};

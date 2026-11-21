"use client";

import { Modal } from "@luch/shared/ui";
import { useRouter } from "next/navigation";
import type { ICinemaSummary } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { useEntityModal, useListParams } from "@/shared/lib";
import { ListToolbar, PageHeader } from "@/shared/ui";
import { HALL_FILTERS, HALL_SORT_FIELDS, HALL_SORT_OPTIONS, HALL_TEXT, HallTable, type IHall, useCinemaHalls } from "@/entities/hall";
import { HallForm } from "@/features/save-hall";
import { HALLS_PAGE_TEXT } from "@/views/halls/constants/halls-page.constant";

interface ICinemaHallsSectionProps {
  cinema: ICinemaSummary;
}

const HALL_LIST_FILTERS = [HALL_FILTERS.isActive, HALL_FILTERS.useTimeBands];

export const CinemaHallsSection = ({ cinema }: ICinemaHallsSectionProps) => {
  const router = useRouter();
  const list = useListParams(Object.values(HALL_SORT_FIELDS));
  const { data: halls, isPending } = useCinemaHalls(cinema.id, {
    search: list.request.search,
    sort: list.request.sort,
    order: list.request.order,
    isActive: list.getFilter(HALL_FILTERS.isActive),
    useTimeBands: list.getFilter(HALL_FILTERS.useTimeBands),
  });
  const modal = useEntityModal<IHall>();

  return (
    <>
      <PageHeader title={HALLS_PAGE_TEXT.title} add={{ label: HALLS_PAGE_TEXT.add, onClick: modal.openCreate }} />
      {/*
      <ListToolbar
        list={list}
        placeholder={HALL_TEXT.searchPlaceholder}
        total={halls?.length}
        filters={HALL_LIST_FILTERS}
        sortOptions={HALL_SORT_OPTIONS}
      />
      */}
      <HallTable
        halls={halls}
        isLoading={isPending}
        search={list.search}
        emptyText={list.getEmptyText(HALL_TEXT.empty, HALL_LIST_FILTERS)}
        sorting={list.sorting}
        onSelect={({ id }) => router.push(ROUTES.hall(id))}
      />
      <Modal size="lg" isOpen={modal.isOpen} title={HALLS_PAGE_TEXT.createTitle} onClose={modal.close}>
        <HallForm cinemaId={cinema.id} hall={null} onDone={modal.close} />
      </Modal>
    </>
  );
};

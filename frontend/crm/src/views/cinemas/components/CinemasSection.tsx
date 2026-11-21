"use client";

import { Modal } from "@luch/shared/ui";
import { useEntityModal, useListParams } from "@/shared/lib";
import { ListToolbar, PageHeader, Pagination } from "@/shared/ui";
import { CINEMA_FILTERS, CINEMA_SORT_FIELDS, CINEMA_SORT_OPTIONS, CINEMA_TEXT, CinemaTable, type ICinema, useCinemas } from "@/entities/cinema";
import { CinemaForm } from "@/features/save-cinema";
import { CINEMAS_PAGE_TEXT } from "@/views/cinemas/constants/cinemas-page.constant";

const CINEMA_LIST_FILTERS = [CINEMA_FILTERS.isPublished];

export const CinemasSection = () => {
  const list = useListParams(Object.values(CINEMA_SORT_FIELDS));
  const { data, isPending } = useCinemas({ ...list.request, isPublished: list.getFilter(CINEMA_FILTERS.isPublished) });
  const modal = useEntityModal<ICinema>();

  return (
    <>
      <PageHeader title={CINEMAS_PAGE_TEXT.title} add={{ label: CINEMAS_PAGE_TEXT.add, onClick: modal.openCreate }} />
      {/*
      <ListToolbar
        list={list}
        placeholder={CINEMA_TEXT.searchPlaceholder}
        total={data?.total}
        filters={CINEMA_LIST_FILTERS}
        sortOptions={CINEMA_SORT_OPTIONS}
      />
      */}
      <CinemaTable
        cinemas={data?.items}
        isLoading={isPending}
        search={list.search}
        emptyText={list.getEmptyText(CINEMA_TEXT.empty, CINEMA_LIST_FILTERS)}
        sorting={list.sorting}
        onSelect={modal.openEdit}
      />
      <Pagination page={list.page} pageSize={list.pageSize} total={data?.total ?? 0} onChange={list.setPage} />
      <Modal size="lg" isOpen={modal.isOpen} title={modal.entity ? CINEMAS_PAGE_TEXT.editTitle : CINEMAS_PAGE_TEXT.createTitle} onClose={modal.close}>
        <CinemaForm cinema={modal.entity} onDone={modal.close} />
      </Modal>
    </>
  );
};

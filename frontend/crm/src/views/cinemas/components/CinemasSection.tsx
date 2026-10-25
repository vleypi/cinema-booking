"use client";

import { Button, Icon, Modal } from "@luch/shared/ui";
import { useEntityModal, useListParams } from "@/shared/lib";
import { ListToolbar, PageHeader, Pagination } from "@/shared/ui";
import { CINEMA_SORT_FIELDS, CINEMA_TEXT, CinemaTable, type ICinema, useCinemas } from "@/entities/cinema";
import { CinemaForm } from "@/features/save-cinema";
import { CINEMAS_PAGE_TEXT } from "@/views/cinemas/constants/cinemas-page.constant";

export const CinemasSection = () => {
  const list = useListParams(Object.values(CINEMA_SORT_FIELDS));
  const { data, isPending } = useCinemas(list.request);
  const modal = useEntityModal<ICinema>();

  return (
    <>
      <PageHeader
        title={CINEMAS_PAGE_TEXT.title}
        description={CINEMAS_PAGE_TEXT.description}
        actions={
          <Button onClick={modal.openCreate}>
            <Icon name="plus" className="size-4" />
            {CINEMAS_PAGE_TEXT.add}
          </Button>
        }
      />
      <ListToolbar search={list.search} placeholder={CINEMA_TEXT.searchPlaceholder} total={data?.total} onSearch={list.setSearch} />
      <CinemaTable
        cinemas={data?.items}
        isLoading={isPending}
        search={list.search}
        emptyText={list.getEmptyText(CINEMA_TEXT.empty)}
        sorting={list.sorting}
        onSelect={modal.openEdit}
      />
      <Pagination page={list.page} pageSize={list.pageSize} total={data?.total ?? 0} onChange={list.setPage} />
      <Modal isOpen={modal.isOpen} title={modal.entity ? CINEMAS_PAGE_TEXT.editTitle : CINEMAS_PAGE_TEXT.createTitle} onClose={modal.close}>
        <CinemaForm cinema={modal.entity} onDone={modal.close} />
      </Modal>
    </>
  );
};

"use client";

import { Modal } from "@luch/shared/ui";
import { useEntityModal, useListParams } from "@/shared/lib";
import { EmptyState, ListToolbar, PageHeader, Pagination } from "@/shared/ui";
import { FILM_FILTERS, FILM_SORT_FIELDS, FILM_SORT_OPTIONS, FILM_TEXT, FilmCard, type IFilm, useFilms } from "@/entities/film";
import { FilmForm } from "@/features/save-film";
import { FILMS_PAGE_SIZE, FILMS_PAGE_TEXT } from "@/views/films/constants/films-page.constant";

const SKELETON_KEYS = ["first", "second", "third", "fourth", "fifth", "sixth"] as const;
const FILM_SORT_FIELD_LIST = Object.values(FILM_SORT_FIELDS);

const FILM_LIST_FILTERS = [FILM_FILTERS.status, FILM_FILTERS.isPremiere];

export const FilmsCatalog = () => {
  const list = useListParams(FILM_SORT_FIELD_LIST, FILMS_PAGE_SIZE);
  const status = list.getFilter(FILM_FILTERS.status);
  const { data, isPending } = useFilms({ ...list.request, status: status && [status], isPremiere: list.getFilter(FILM_FILTERS.isPremiere) });
  const modal = useEntityModal<IFilm>();

  return (
    <>
      <PageHeader title={FILMS_PAGE_TEXT.title} add={{ label: FILMS_PAGE_TEXT.add, onClick: modal.openCreate }} />
      <ListToolbar
        list={list}
        placeholder={FILM_TEXT.searchPlaceholder}
        total={data?.total}
        filters={FILM_LIST_FILTERS}
        sortOptions={FILM_SORT_OPTIONS}
      />
      {!isPending && data?.total === 0 && (
        <EmptyState icon="film" title={list.getEmptyText(FILM_TEXT.empty, FILM_LIST_FILTERS)} description={FILMS_PAGE_TEXT.description} />
      )}
      <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {isPending && SKELETON_KEYS.map((key) => <div key={key} className="aspect-2/3 animate-pulse rounded-lg bg-gray-100" />)}
        {data?.items.map((film) => <FilmCard key={film.id} film={film} search={list.search} onSelect={modal.openEdit} />)}
      </div>
      <Pagination page={list.page} pageSize={list.pageSize} total={data?.total ?? 0} onChange={list.setPage} />
      <Modal size="lg" isOpen={modal.isOpen} title={modal.entity ? FILMS_PAGE_TEXT.editTitle : FILMS_PAGE_TEXT.createTitle} onClose={modal.close}>
        <FilmForm film={modal.entity} onDone={modal.close} />
      </Modal>
    </>
  );
};

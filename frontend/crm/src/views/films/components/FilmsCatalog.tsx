"use client";

import { Button, Icon, Modal, SelectControl } from "@luch/shared/ui";
import { LIST_TEXT, SORT_ORDERS } from "@/shared/config";
import { useEntityModal, useListParams } from "@/shared/lib";
import { EmptyState, ListToolbar, PageHeader, Pagination } from "@/shared/ui";
import { FILM_SORT_FIELDS, FILM_TEXT, FilmCard, type FilmSortField, type IFilm, useFilms } from "@/entities/film";
import { FilmForm } from "@/features/save-film";
import {
  FILM_SORT_LABEL,
  FILM_SORT_OPTIONS,
  FILMS_PAGE_SIZE,
  FILMS_PAGE_TEXT,
  SORT_VALUE_SEPARATOR,
} from "@/views/films/constants/films-page.constant";

const SKELETON_KEYS = ["first", "second", "third", "fourth", "fifth", "sixth"] as const;
const FILM_SORT_FIELD_LIST = Object.values(FILM_SORT_FIELDS);

export const FilmsCatalog = () => {
  const list = useListParams(FILM_SORT_FIELD_LIST, FILMS_PAGE_SIZE);
  const { data, isPending } = useFilms(list.request);
  const modal = useEntityModal<IFilm>();
  const sortValue = list.sort ? [list.sort, list.order].join(SORT_VALUE_SEPARATOR) : "";

  const changeSort = (value: string) => {
    const [field, order] = value.split(SORT_VALUE_SEPARATOR);
    list.setSort(FILM_SORT_FIELD_LIST.find((sortField): sortField is FilmSortField => sortField === field), order === SORT_ORDERS.desc ? SORT_ORDERS.desc : SORT_ORDERS.asc);
  };

  return (
    <>
      <PageHeader
        title={FILMS_PAGE_TEXT.title}
        description={FILMS_PAGE_TEXT.description}
        actions={
          <Button onClick={modal.openCreate}>
            <Icon name="plus" className="size-4" />
            {FILMS_PAGE_TEXT.add}
          </Button>
        }
      />
      <ListToolbar search={list.search} placeholder={FILM_TEXT.searchPlaceholder} total={data?.total} onSearch={list.setSearch}>
        <SelectControl aria-label={FILM_SORT_LABEL} options={FILM_SORT_OPTIONS} value={sortValue} onChange={(event) => changeSort(event.target.value)} className="w-auto" />
      </ListToolbar>
      {!isPending && data?.total === 0 && (
        <EmptyState icon="film" title={list.search ? LIST_TEXT.notFound : FILM_TEXT.empty} description={FILMS_PAGE_TEXT.description} />
      )}
      <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {isPending && SKELETON_KEYS.map((key) => <div key={key} className="aspect-2/3 animate-pulse rounded-lg bg-gray-100" />)}
        {data?.items.map((film) => <FilmCard key={film.id} film={film} search={list.search} onSelect={modal.openEdit} />)}
      </div>
      <Pagination page={list.page} pageSize={list.pageSize} total={data?.total ?? 0} onChange={list.setPage} />
      <Modal isOpen={modal.isOpen} title={modal.entity ? FILMS_PAGE_TEXT.editTitle : FILMS_PAGE_TEXT.createTitle} onClose={modal.close}>
        <FilmForm film={modal.entity} onDone={modal.close} />
      </Modal>
    </>
  );
};

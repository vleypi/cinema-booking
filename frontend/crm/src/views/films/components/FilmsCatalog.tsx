"use client";

import { Button, Icon, Modal } from "@luch/shared/ui";
import { useEntityModal } from "@/shared/lib";
import { EmptyState, PageHeader } from "@/shared/ui";
import { FILM_TEXT, FilmCard, type IFilm, useFilms } from "@/entities/film";
import { FilmForm } from "@/features/save-film";
import { FILMS_PAGE_TEXT } from "@/views/films/constants/films-page.constant";

const SKELETON_KEYS = ["first", "second", "third", "fourth", "fifth", "sixth"] as const;

export const FilmsCatalog = () => {
  const { data: films, isPending } = useFilms();
  const modal = useEntityModal<IFilm>();

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
      {!isPending && films?.length === 0 && <EmptyState icon="film" title={FILM_TEXT.empty} description={FILMS_PAGE_TEXT.description} />}
      <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {isPending && SKELETON_KEYS.map((key) => <div key={key} className="aspect-2/3 animate-pulse rounded-lg bg-gray-100" />)}
        {films?.map((film) => <FilmCard key={film.id} film={film} onSelect={modal.openEdit} />)}
      </div>
      <Modal isOpen={modal.isOpen} title={modal.entity ? FILMS_PAGE_TEXT.editTitle : FILMS_PAGE_TEXT.createTitle} onClose={modal.close}>
        <FilmForm film={modal.entity} onDone={modal.close} />
      </Modal>
    </>
  );
};

"use client";

import { Button, Icon, Modal } from "@luch/shared/ui";
import { useEntityModal } from "@/shared/lib";
import { PageHeader } from "@/shared/ui";
import { CinemaTable, type ICinema, useCinemas } from "@/entities/cinema";
import { CinemaForm } from "@/features/save-cinema";
import { CINEMAS_PAGE_TEXT } from "@/views/cinemas/constants/cinemas-page.constant";

export const CinemasSection = () => {
  const { data: cinemas, isPending } = useCinemas();
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
      <CinemaTable cinemas={cinemas} isLoading={isPending} onSelect={modal.openEdit} />
      <Modal isOpen={modal.isOpen} title={modal.entity ? CINEMAS_PAGE_TEXT.editTitle : CINEMAS_PAGE_TEXT.createTitle} onClose={modal.close}>
        <CinemaForm cinema={modal.entity} onDone={modal.close} />
      </Modal>
    </>
  );
};

"use client";

import { Button, Icon, Modal } from "@luch/shared/ui";
import { useRouter } from "next/navigation";
import type { ICinemaSummary } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { useEntityModal } from "@/shared/lib";
import { PageHeader } from "@/shared/ui";
import { HallTable, type IHall, useCinemaHalls } from "@/entities/hall";
import { HallForm } from "@/features/save-hall";
import { HALLS_PAGE_TEXT } from "@/views/halls/constants/halls-page.constant";

interface ICinemaHallsSectionProps {
  cinema: ICinemaSummary;
}

export const CinemaHallsSection = ({ cinema }: ICinemaHallsSectionProps) => {
  const router = useRouter();
  const { data: halls, isPending } = useCinemaHalls(cinema.id);
  const modal = useEntityModal<IHall>();

  return (
    <>
      <PageHeader
        title={HALLS_PAGE_TEXT.title}
        description={`${HALLS_PAGE_TEXT.description}: ${cinema.name}`}
        actions={
          <Button onClick={modal.openCreate}>
            <Icon name="plus" className="size-4" />
            {HALLS_PAGE_TEXT.add}
          </Button>
        }
      />
      <HallTable halls={halls} isLoading={isPending} onSelect={({ id }) => router.push(ROUTES.hall(id))} />
      <Modal isOpen={modal.isOpen} title={HALLS_PAGE_TEXT.createTitle} onClose={modal.close}>
        <HallForm cinemaId={cinema.id} hall={null} onDone={modal.close} />
      </Modal>
    </>
  );
};

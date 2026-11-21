"use client";

import { Button, Icon, Modal } from "@luch/shared/ui";
import { useState } from "react";
import { useEntityModal } from "@/shared/lib";
import { PageHeader } from "@/shared/ui";
import type { IHall, IPriceZone } from "@/entities/hall";
import { HallLayoutEditor } from "@/features/edit-hall-layout";
import { HallForm } from "@/features/save-hall";
import { PriceZoneForm } from "@/features/save-price-zone";
import { HALL_PAGE_TEXT } from "@/views/hall/constants/hall-page.constant";
import { describeHall } from "@/views/hall/utils/hall-summary.util";

interface IHallDetailsProps {
  hall: IHall;
}

export const HallDetails = ({ hall }: IHallDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const priceZoneModal = useEntityModal<IPriceZone>();

  return (
    <>
      <PageHeader
        title={hall.name}
        description={describeHall(hall)}
        actions={
          <Button variant="secondary" onClick={() => setIsEditing(true)}>
            <Icon name="pencil" className="size-4" />
            {HALL_PAGE_TEXT.edit}
          </Button>
        }
      />
      <HallLayoutEditor hall={hall} onAddPriceZone={priceZoneModal.openCreate} onEditPriceZone={priceZoneModal.openEdit} />
      <Modal size="lg" isOpen={isEditing} title={HALL_PAGE_TEXT.editTitle} onClose={() => setIsEditing(false)}>
        <HallForm cinemaId={hall.cinemaId} hall={hall} onDone={() => setIsEditing(false)} />
      </Modal>
      <Modal
        isOpen={priceZoneModal.isOpen}
        title={priceZoneModal.entity ? HALL_PAGE_TEXT.editPriceZoneTitle : HALL_PAGE_TEXT.createPriceZoneTitle}
        onClose={priceZoneModal.close}
      >
        <PriceZoneForm cinemaId={hall.cinemaId} hallId={hall.id} priceZone={priceZoneModal.entity} onDone={priceZoneModal.close} />
      </Modal>
    </>
  );
};

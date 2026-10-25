"use client";

import { Button, Icon, Modal } from "@luch/shared/ui";
import { useState } from "react";
import { PageHeader, SectionHeader } from "@/shared/ui";
import type { IHall } from "@/entities/hall";
import { EDIT_LAYOUT_TEXT, HallLayoutEditor } from "@/features/edit-hall-layout";
import { HallForm } from "@/features/save-hall";
import { PriceZonesPanel } from "@/views/hall/components/PriceZonesPanel";
import { HALL_PAGE_TEXT } from "@/views/hall/constants/hall-page.constant";
import { describeHall } from "@/views/hall/utils/hall-summary.util";

interface IHallDetailsProps {
  hall: IHall;
}

export const HallDetails = ({ hall }: IHallDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex flex-col gap-10">
      <div>
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
        <PriceZonesPanel hall={hall} />
      </div>
      <section>
        <SectionHeader title={EDIT_LAYOUT_TEXT.title} description={EDIT_LAYOUT_TEXT.description} />
        <HallLayoutEditor hall={hall} />
      </section>
      <Modal isOpen={isEditing} title={HALL_PAGE_TEXT.editTitle} onClose={() => setIsEditing(false)}>
        <HallForm cinemaId={hall.cinemaId} hall={hall} onDone={() => setIsEditing(false)} />
      </Modal>
    </div>
  );
};

"use client";

import { Button, Icon, Modal } from "@luch/shared/ui";
import { useEntityModal } from "@/shared/lib";
import { SectionHeader } from "@/shared/ui";
import { type IHall, type IPriceZone, PriceZoneLabel } from "@/entities/hall";
import { PriceZoneForm } from "@/features/save-price-zone";
import { HALL_PAGE_TEXT } from "@/views/hall/constants/hall-page.constant";

interface IPriceZonesPanelProps {
  hall: IHall;
}

export const PriceZonesPanel = ({ hall }: IPriceZonesPanelProps) => {
  const modal = useEntityModal<IPriceZone>();

  return (
    <section>
      <SectionHeader
        title={HALL_PAGE_TEXT.priceZonesTitle}
        description={HALL_PAGE_TEXT.priceZonesDescription}
        actions={
          <Button variant="secondary" onClick={modal.openCreate}>
            <Icon name="plus" className="size-4" />
            {HALL_PAGE_TEXT.addPriceZone}
          </Button>
        }
      />
      {hall.priceZones.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {hall.priceZones.map((priceZone) => (
            <li key={priceZone.id}>
              <button
                type="button"
                onClick={() => modal.openEdit(priceZone)}
                aria-label={`${HALL_PAGE_TEXT.editPriceZone} ${priceZone.name}`}
                className="inline-flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 text-sm transition hover:border-gray-300 hover:bg-gray-50"
              >
                <PriceZoneLabel priceZone={priceZone} priceZones={hall.priceZones} />
                <Icon name="pencil" className="size-3.5 text-gray-400" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Modal isOpen={modal.isOpen} title={modal.entity ? HALL_PAGE_TEXT.editPriceZoneTitle : HALL_PAGE_TEXT.createPriceZoneTitle} onClose={modal.close}>
        <PriceZoneForm cinemaId={hall.cinemaId} hallId={hall.id} priceZone={modal.entity} onDone={modal.close} />
      </Modal>
    </section>
  );
};

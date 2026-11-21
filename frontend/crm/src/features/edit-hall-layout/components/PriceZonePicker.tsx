import { joinClassNames } from "@luch/shared/lib";
import { Icon } from "@luch/shared/ui";
import { formatMultiplier } from "@/shared/lib";
import { getPriceZoneColor, type IPriceZone } from "@/entities/hall";
import { EDIT_LAYOUT_TEXT } from "@/features/edit-hall-layout/constants/edit-hall-layout.constant";

interface IPriceZonePickerProps {
  priceZones: readonly IPriceZone[];
  priceZoneId: string;
  onChange: (priceZoneId: string) => void;
  onAdd: () => void;
  onEdit: (priceZone: IPriceZone) => void;
}

const ICON_BUTTON_CLASS_NAME = "grid size-9 place-items-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-ink";

export const PriceZonePicker = ({ priceZones, priceZoneId, onChange, onAdd, onEdit }: IPriceZonePickerProps) => (
  <div role="group" aria-label={EDIT_LAYOUT_TEXT.priceZones} className="flex flex-wrap items-center gap-1">
    {priceZones.map((priceZone) => {
      const isActive = priceZone.id === priceZoneId;

      return (
        <div
          key={priceZone.id}
          className={joinClassNames("flex items-center rounded-lg transition", isActive ? "bg-brand-soft" : "hover:bg-gray-50")}
        >
          <button
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(priceZone.id)}
            className="inline-flex h-9 items-center gap-2 pr-1 pl-3 text-sm font-medium whitespace-nowrap text-ink"
          >
            <span className={joinClassNames("size-3 rounded-full", getPriceZoneColor(priceZones, priceZone.id))} />
            {priceZone.name}
            <span className="font-normal text-gray-500">{formatMultiplier(priceZone.multiplier)}</span>
          </button>
          <button
            type="button"
            aria-label={`${EDIT_LAYOUT_TEXT.editPriceZone} ${priceZone.name}`}
            onClick={() => onEdit(priceZone)}
            className={joinClassNames(ICON_BUTTON_CLASS_NAME, "size-8", isActive ? "visible" : "invisible")}
          >
            <Icon name="pencil" className="size-3.5" />
          </button>
        </div>
      );
    })}
    <button type="button" aria-label={EDIT_LAYOUT_TEXT.addPriceZone} title={EDIT_LAYOUT_TEXT.addPriceZone} onClick={onAdd} className={ICON_BUTTON_CLASS_NAME}>
      <Icon name="plus" className="size-4" />
    </button>
  </div>
);

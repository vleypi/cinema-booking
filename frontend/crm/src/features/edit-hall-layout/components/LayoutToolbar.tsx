"use client";

import { Button } from "@luch/shared/ui";
import { getPriceZoneColor, type IPriceZone } from "@/entities/hall";
import { BrushPreview } from "@/features/edit-hall-layout/components/BrushPreview";
import { PriceZonePicker } from "@/features/edit-hall-layout/components/PriceZonePicker";
import { SizeStepper } from "@/features/edit-hall-layout/components/SizeStepper";
import { ToolButton } from "@/features/edit-hall-layout/components/ToolButton";
import { BRUSH_OPTIONS, EDIT_LAYOUT_TEXT, LAYOUT_LIMITS } from "@/features/edit-hall-layout/constants/edit-hall-layout.constant";
import type { Brush, ILayoutDraft } from "@/features/edit-hall-layout/interfaces/layout-draft.interface";

interface ILayoutToolbarProps {
  draft: ILayoutDraft;
  brush: Brush;
  priceZones: readonly IPriceZone[];
  priceZoneId: string;
  onBrushChange: (brush: Brush) => void;
  onPriceZoneChange: (priceZoneId: string) => void;
  onAddPriceZone: () => void;
  onEditPriceZone: (priceZone: IPriceZone) => void;
  onResize: (columns: number, rows: number) => void;
  onFillEmpty: () => void;
  onClear: () => void;
}

export const LayoutToolbar = ({
  draft,
  brush,
  priceZones,
  priceZoneId,
  onBrushChange,
  onPriceZoneChange,
  onAddPriceZone,
  onEditPriceZone,
  onResize,
  onFillEmpty,
  onClear,
}: ILayoutToolbarProps) => {
  const zoneColor = getPriceZoneColor(priceZones, priceZoneId);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div role="group" aria-label={EDIT_LAYOUT_TEXT.tools} className="flex flex-wrap gap-0.5 rounded-xl bg-gray-100 p-1">
          {BRUSH_OPTIONS.map(({ value, label }) => (
            <ToolButton key={value} isActive={brush === value} onClick={() => onBrushChange(value)}>
              <BrushPreview brush={value} zoneColor={zoneColor} />
              {label}
            </ToolButton>
          ))}
        </div>
        <PriceZonePicker
          priceZones={priceZones}
          priceZoneId={priceZoneId}
          onChange={onPriceZoneChange}
          onAdd={onAddPriceZone}
          onEdit={onEditPriceZone}
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <SizeStepper label={EDIT_LAYOUT_TEXT.rows} value={draft.rows} max={LAYOUT_LIMITS.maxRows} onChange={(rows) => onResize(draft.columns, rows)} />
        <SizeStepper
          label={EDIT_LAYOUT_TEXT.columns}
          value={draft.columns}
          max={LAYOUT_LIMITS.maxColumns}
          onChange={(columns) => onResize(columns, draft.rows)}
        />
        <div className="flex gap-1 sm:ml-auto">
          <Button variant="ghost" className="px-3" onClick={onFillEmpty}>
            {EDIT_LAYOUT_TEXT.fillEmpty}
          </Button>
          <Button variant="ghost" className="px-3" onClick={onClear}>
            {EDIT_LAYOUT_TEXT.clear}
          </Button>
        </div>
      </div>
    </div>
  );
};

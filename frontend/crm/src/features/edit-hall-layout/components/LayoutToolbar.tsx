"use client";

import { joinClassNames } from "@luch/shared/lib";
import { Button } from "@luch/shared/ui";
import { CARD_CLASS_NAME } from "@/shared/ui";
import { getPriceZoneColor, type IPriceZone } from "@/entities/hall";
import { SizeSlider } from "@/features/edit-hall-layout/components/SizeSlider";
import { ToolButton } from "@/features/edit-hall-layout/components/ToolButton";
import { ToolGroup } from "@/features/edit-hall-layout/components/ToolGroup";
import { BRUSH_OPTIONS, EDIT_LAYOUT_TEXT, LAYOUT_LIMITS } from "@/features/edit-hall-layout/constants/edit-hall-layout.constant";
import type { Brush, ILayoutDraft } from "@/features/edit-hall-layout/interfaces/layout-draft.interface";

interface ILayoutToolbarProps {
  draft: ILayoutDraft;
  brush: Brush;
  priceZones: readonly IPriceZone[];
  priceZoneId: string;
  onBrushChange: (brush: Brush) => void;
  onPriceZoneChange: (priceZoneId: string) => void;
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
  onResize,
  onFillEmpty,
  onClear,
}: ILayoutToolbarProps) => (
  <div className={joinClassNames(CARD_CLASS_NAME, "flex flex-col gap-5 p-4")}>
    <div className="flex flex-wrap gap-6">
      <SizeSlider label={EDIT_LAYOUT_TEXT.rows} value={draft.rows} max={LAYOUT_LIMITS.maxRows} onChange={(rows) => onResize(draft.columns, rows)} />
      <SizeSlider
        label={EDIT_LAYOUT_TEXT.columns}
        value={draft.columns}
        max={LAYOUT_LIMITS.maxColumns}
        onChange={(columns) => onResize(columns, draft.rows)}
      />
    </div>
    <div className="flex flex-wrap items-end gap-x-8 gap-y-5">
      <ToolGroup label={EDIT_LAYOUT_TEXT.brush}>
        {BRUSH_OPTIONS.map(({ value, label }) => (
          <ToolButton key={value} isActive={brush === value} onClick={() => onBrushChange(value)}>
            {label}
          </ToolButton>
        ))}
      </ToolGroup>
      <ToolGroup label={EDIT_LAYOUT_TEXT.priceZone}>
        {priceZones.map(({ id, name }) => (
          <ToolButton key={id} isActive={priceZoneId === id} onClick={() => onPriceZoneChange(id)}>
            <span className={joinClassNames("size-2.5 rounded-full", getPriceZoneColor(priceZones, id))} />
            {name}
          </ToolButton>
        ))}
      </ToolGroup>
      <div className="flex gap-2 lg:ml-auto">
        <Button variant="secondary" className="px-3 py-1.5" onClick={onFillEmpty}>
          {EDIT_LAYOUT_TEXT.fillEmpty}
        </Button>
        <Button variant="ghost" className="px-3 py-1.5" onClick={onClear}>
          {EDIT_LAYOUT_TEXT.clear}
        </Button>
      </div>
    </div>
  </div>
);

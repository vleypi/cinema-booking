"use client";

import { Button, FormError } from "@luch/shared/ui";
import type { IHall, IHallLayout, IHallLayoutPayload } from "@/entities/hall";
import { LayoutGrid } from "@/features/edit-hall-layout/components/LayoutGrid";
import { LayoutLegend } from "@/features/edit-hall-layout/components/LayoutLegend";
import { LayoutToolbar } from "@/features/edit-hall-layout/components/LayoutToolbar";
import { EDIT_LAYOUT_TEXT } from "@/features/edit-hall-layout/constants/edit-hall-layout.constant";
import { useLayoutBrush } from "@/features/edit-hall-layout/hooks/useLayoutBrush";
import { useLayoutDraft } from "@/features/edit-hall-layout/hooks/useLayoutDraft";

interface ILayoutEditorBodyProps {
  hall: IHall;
  layout: IHallLayout | null;
  isSaving: boolean;
  isSaved: boolean;
  saveError: string | undefined;
  onSave: (payload: IHallLayoutPayload) => void;
}

export const LayoutEditorBody = ({ hall, layout, isSaving, isSaved, saveError, onSave }: ILayoutEditorBodyProps) => {
  const { brush, setBrush, priceZoneId, setPriceZoneId } = useLayoutBrush(hall.priceZones);
  const { draft, seats, payload, isDirty, paint, resize, fillEmpty, clear, reset } = useLayoutDraft(layout, priceZoneId);
  const isEmpty = seats.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <LayoutToolbar
        draft={draft}
        brush={brush}
        priceZones={hall.priceZones}
        priceZoneId={priceZoneId}
        onBrushChange={setBrush}
        onPriceZoneChange={setPriceZoneId}
        onResize={resize}
        onFillEmpty={() => fillEmpty(priceZoneId)}
        onClear={clear}
      />
      <LayoutGrid draft={draft} seats={seats} priceZones={hall.priceZones} onPaint={(key) => paint(key, brush, priceZoneId)} />
      <LayoutLegend seats={seats} rows={payload.rows} />
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4">
        <div className="text-sm">
          <p className="font-medium text-ink">{layout ? `${EDIT_LAYOUT_TEXT.version} ${layout.version}` : EDIT_LAYOUT_TEXT.noLayout}</p>
          <p className="text-gray-500">{isEmpty ? EDIT_LAYOUT_TEXT.emptyLayout : EDIT_LAYOUT_TEXT.versionHint}</p>
        </div>
        <div className="flex items-center gap-2">
          {isSaved && !isDirty && <span className="text-sm font-medium text-green-700">{EDIT_LAYOUT_TEXT.saved}</span>}
          {layout && isDirty && (
            <Button variant="ghost" onClick={reset} disabled={isSaving}>
              {EDIT_LAYOUT_TEXT.reset}
            </Button>
          )}
          <Button isLoading={isSaving} disabled={!isDirty || isEmpty} onClick={() => onSave(payload)}>
            {EDIT_LAYOUT_TEXT.save}
          </Button>
        </div>
      </div>
      <FormError message={saveError} />
    </div>
  );
};

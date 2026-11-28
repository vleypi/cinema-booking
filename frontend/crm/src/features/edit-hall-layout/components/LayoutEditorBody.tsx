"use client";

import type { IHall, IHallLayout, IHallLayoutPayload, IPriceZone } from "@/entities/hall";
import { LayoutFooter } from "@/features/edit-hall-layout/components/LayoutFooter";
import { LayoutGrid } from "@/features/edit-hall-layout/components/LayoutGrid";
import { LayoutToolbar } from "@/features/edit-hall-layout/components/LayoutToolbar";
import { useLayoutBrush } from "@/features/edit-hall-layout/hooks/useLayoutBrush";
import { useLayoutDraft } from "@/features/edit-hall-layout/hooks/useLayoutDraft";

interface ILayoutEditorBodyProps {
  hall: IHall;
  layout: IHallLayout | null;
  isSaving: boolean;
  isSaved: boolean;
  saveError: string | undefined;
  onSave: (payload: IHallLayoutPayload) => void;
  onAddPriceZone: () => void;
  onEditPriceZone: (priceZone: IPriceZone) => void;
}

export const LayoutEditorBody = ({ hall, layout, isSaving, isSaved, saveError, onSave, onAddPriceZone, onEditPriceZone }: ILayoutEditorBodyProps) => {
  const { brush, setBrush, priceZoneId, setPriceZoneId } = useLayoutBrush(hall.priceZones);
  const { draft, seats, payload, isDirty, paint, resize, fillEmpty, clear, reset } = useLayoutDraft(layout, priceZoneId);

  return (
    <div className="flex flex-col gap-4">
      <LayoutToolbar
        draft={draft}
        brush={brush}
        priceZones={hall.priceZones}
        priceZoneId={priceZoneId}
        onBrushChange={setBrush}
        onPriceZoneChange={setPriceZoneId}
        onAddPriceZone={onAddPriceZone}
        onEditPriceZone={onEditPriceZone}
        onResize={resize}
        onFillEmpty={() => fillEmpty(priceZoneId)}
        onClear={clear}
      />
      <LayoutGrid draft={draft} seats={seats} priceZones={hall.priceZones} onPaint={(key) => paint(key, brush, priceZoneId)} />
      <LayoutFooter
        seatsCount={seats.length}
        rowsCount={payload.rows}
        version={layout?.version}
        isDirty={isDirty}
        isSaving={isSaving}
        isSaved={isSaved}
        canReset={layout !== null}
        saveError={saveError}
        onReset={reset}
        onSave={() => onSave(payload)}
      />
    </div>
  );
};

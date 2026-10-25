"use client";

import { toApiError } from "@luch/shared/api";
import { EmptyState } from "@/shared/ui";
import { type IHall, useHallLayout } from "@/entities/hall";
import { LayoutEditorBody } from "@/features/edit-hall-layout/components/LayoutEditorBody";
import { EDIT_LAYOUT_TEXT } from "@/features/edit-hall-layout/constants/edit-hall-layout.constant";
import { useSaveLayout } from "@/features/edit-hall-layout/hooks/useSaveLayout";

interface IHallLayoutEditorProps {
  hall: IHall;
}

const NEW_LAYOUT_KEY = "new";

export const HallLayoutEditor = ({ hall }: IHallLayoutEditorProps) => {
  const { data: layout, isPending } = useHallLayout(hall.id);
  const { mutate: save, isPending: isSaving, isSuccess, error } = useSaveLayout(hall.id);

  if (hall.priceZones.length === 0) {
    return <EmptyState icon="tag" title={EDIT_LAYOUT_TEXT.noZonesTitle} description={EDIT_LAYOUT_TEXT.noZonesDescription} />;
  }
  if (isPending) return <div className="h-96 animate-pulse rounded-xl bg-gray-100" />;

  return (
    <LayoutEditorBody
      key={layout?.id ?? NEW_LAYOUT_KEY}
      hall={hall}
      layout={layout ?? null}
      isSaving={isSaving}
      isSaved={isSuccess}
      saveError={error ? toApiError(error).message : undefined}
      onSave={(payload) => save(payload)}
    />
  );
};

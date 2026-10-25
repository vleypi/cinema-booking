"use client";

import { useMemo, useState } from "react";
import type { IHallLayout } from "@/entities/hall";
import type { Brush } from "@/features/edit-hall-layout/interfaces/layout-draft.interface";
import { createDraft, fillEmptyCells, numberSeats, paintDraft, toLayoutPayload } from "@/features/edit-hall-layout/utils/layout-draft.util";

export const useLayoutDraft = (layout: IHallLayout | null, defaultPriceZoneId: string) => {
  const [savedDraft] = useState(() => createDraft(layout, defaultPriceZoneId));
  const [savedSnapshot] = useState(() => JSON.stringify(toLayoutPayload(numberSeats(savedDraft))));
  const [draft, setDraft] = useState(savedDraft);
  const seats = useMemo(() => numberSeats(draft), [draft]);
  const payload = useMemo(() => toLayoutPayload(seats), [seats]);

  return {
    draft,
    seats,
    payload,
    isDirty: !layout || JSON.stringify(payload) !== savedSnapshot,
    paint: (key: string, brush: Brush, priceZoneId: string) => setDraft((current) => paintDraft(current, key, brush, priceZoneId)),
    resize: (columns: number, rows: number) => setDraft((current) => ({ ...current, columns, rows })),
    fillEmpty: (priceZoneId: string) => setDraft((current) => fillEmptyCells(current, priceZoneId)),
    clear: () => setDraft((current) => ({ ...current, cells: {} })),
    reset: () => setDraft(savedDraft),
  };
};

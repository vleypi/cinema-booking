"use client";

import { useState } from "react";
import { type IPriceZone, SEAT_TYPES } from "@/entities/hall";
import type { Brush } from "@/features/edit-hall-layout/interfaces/layout-draft.interface";

export const useLayoutBrush = (priceZones: readonly IPriceZone[]) => {
  const [brush, setBrush] = useState<Brush>(SEAT_TYPES.standard);
  const [selectedPriceZoneId, setSelectedPriceZoneId] = useState(priceZones[0]?.id);
  const priceZoneId = priceZones.some(({ id }) => id === selectedPriceZoneId) ? selectedPriceZoneId : priceZones[0]?.id;

  return { brush, setBrush, priceZoneId: priceZoneId ?? "", setPriceZoneId: setSelectedPriceZoneId };
};

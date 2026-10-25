"use client";

import { type PointerEvent, useRef } from "react";

export const CELL_KEY_ATTRIBUTE = "data-cell-key";

const PRIMARY_BUTTON = 0;

const findCellKey = (clientX: number, clientY: number): string | null =>
  document.elementFromPoint(clientX, clientY)?.closest(`[${CELL_KEY_ATTRIBUTE}]`)?.getAttribute(CELL_KEY_ATTRIBUTE) ?? null;

export const usePaintGesture = (onPaint: (key: string) => void) => {
  const isPaintingRef = useRef(false);

  const paintAt = ({ clientX, clientY }: PointerEvent<HTMLElement>) => {
    const key = findCellKey(clientX, clientY);
    if (key) onPaint(key);
  };

  const stop = () => {
    isPaintingRef.current = false;
  };

  return {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      if (event.button !== PRIMARY_BUTTON) return;
      isPaintingRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      paintAt(event);
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (isPaintingRef.current) paintAt(event);
    },
    onPointerUp: stop,
    onPointerCancel: stop,
  };
};

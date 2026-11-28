"use client";

import { Icon } from "@luch/shared/ui";
import { useEffect, useId, useRef, useState } from "react";
import { useCurrentCinema } from "@/entities/cinema";
import { SELECT_CINEMA_TEXT, SINGLE_CINEMA_COUNT } from "@/features/select-cinema/constants/select-cinema.constant";

export const CinemaSwitcher = () => {
  const { cinema, cinemas, select } = useCurrentCinema();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!cinema || cinemas.length <= SINGLE_CINEMA_COUNT) return null;

  return (
    <div ref={containerRef} className="relative min-w-0">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={SELECT_CINEMA_TEXT.label}
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex min-h-11 max-w-full items-center gap-1 text-[0.95rem] text-paper/64 transition-colors duration-300 hover:text-paper"
      >
        <span className="truncate">{cinema.name}</span>
        <Icon name="chevronDown" className="size-3.5 shrink-0" />
      </button>
      {isOpen && (
        <ul
          id={menuId}
          className="absolute top-full left-0 z-50 mt-1 min-w-60 rounded-frame border border-paper/13 bg-ink/95 py-1 text-paper backdrop-blur-md"
        >
          {cinemas.map(({ id, name, address }) => (
            <li key={id}>
              <button
                type="button"
                aria-current={id === cinema.id}
                onClick={() => {
                  select(id);
                  setIsOpen(false);
                }}
                className="grid min-h-11 w-full px-3.5 py-2 text-left text-sm text-paper/64 transition-colors hover:bg-paper/6 hover:text-paper aria-[current=true]:text-paper"
              >
                <span>{name}</span>
                <span className="text-xs text-paper/38">{address}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

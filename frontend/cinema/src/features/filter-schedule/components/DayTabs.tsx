"use client";

import type { KeyboardEvent } from "react";
import type { IScheduleDay } from "@/entities/session";
import { DAY_KEY_STEPS, FILTER_SCHEDULE_TEXT } from "@/features/filter-schedule/constants/filter-schedule.constant";

interface IDayTabsProps {
  days: readonly IScheduleDay[];
  selected: string;
  onSelect: (date: string) => void;
}

export const DayTabs = ({ days, selected, onSelect }: IDayTabsProps) => {
  const moveSelection = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = DAY_KEY_STEPS[event.key];
    if (!step) return;
    event.preventDefault();
    const index = days.findIndex(({ date }) => date === selected);
    const next = days[(index + step + days.length) % days.length];
    onSelect(next.date);
    event.currentTarget.querySelector<HTMLButtonElement>(`[data-date="${next.date}"]`)?.focus();
  };

  return (
    <div role="tablist" aria-label={FILTER_SCHEDULE_TEXT.day} onKeyDown={moveSelection} className="flex max-w-full gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
      {days.map(({ date, title, caption }) => {
        const isSelected = date === selected;

        return (
          <button
            key={date}
            type="button"
            role="tab"
            data-date={date}
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onSelect(date)}
            className="group flex min-w-18 flex-none flex-col items-center rounded-2xl border border-paper/13 px-3.5 py-2 leading-tight transition-colors duration-300 hover:border-paper/38 aria-selected:border-paper aria-selected:bg-paper aria-selected:text-ink"
          >
            <small className="font-mono text-[0.7rem] tracking-[0.06em] text-paper/38 uppercase transition-colors group-aria-selected:text-ink/60">{title}</small>
            <b className="font-display text-lg font-medium tracking-[-0.02em]">{caption}</b>
          </button>
        );
      })}
    </div>
  );
};

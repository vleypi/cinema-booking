"use client";

import { Button, Icon } from "@luch/shared/ui";
import { formatDayTitle } from "@/shared/lib";
import { SCHEDULE_PAGE_TEXT } from "@/views/schedule/constants/schedule-page.constant";

interface IDayPickerProps {
  date: string;
  isToday: boolean;
  onChange: (date: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

const NAVIGATION_BUTTON_CLASS_NAME = "grid size-9 place-items-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50";

export const DayPicker = ({ date, isToday, onChange, onPrevious, onNext, onToday }: IDayPickerProps) => (
  <div className="mb-6 flex flex-wrap items-center gap-3">
    <div className="flex items-center gap-1.5">
      <button type="button" onClick={onPrevious} aria-label={SCHEDULE_PAGE_TEXT.previousDay} className={NAVIGATION_BUTTON_CLASS_NAME}>
        <Icon name="chevronLeft" className="size-4" />
      </button>
      <input
        type="date"
        value={date}
        aria-label={SCHEDULE_PAGE_TEXT.day}
        onChange={(event) => event.target.value && onChange(event.target.value)}
        className="h-9 rounded-lg border border-gray-200 px-3 text-sm text-ink focus:border-brand focus:ring-2 focus:ring-brand/15 focus:outline-none"
      />
      <button type="button" onClick={onNext} aria-label={SCHEDULE_PAGE_TEXT.nextDay} className={NAVIGATION_BUTTON_CLASS_NAME}>
        <Icon name="chevronRight" className="size-4" />
      </button>
    </div>
    {!isToday && (
      <Button variant="ghost" className="px-3 py-1.5" onClick={onToday}>
        {SCHEDULE_PAGE_TEXT.today}
      </Button>
    )}
    <p className="text-base font-semibold text-ink first-letter:uppercase">{formatDayTitle(date)}</p>
  </div>
);

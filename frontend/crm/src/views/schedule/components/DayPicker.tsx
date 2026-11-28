"use client";

import { joinClassNames } from "@luch/shared/lib";
import { Button, Icon } from "@luch/shared/ui";
import { formatDayTitle } from "@/shared/lib";
import { TOOLBAR_CONTROL_CLASS_NAME } from "@/shared/ui";
import { SCHEDULE_PAGE_TEXT } from "@/views/schedule/constants/schedule-page.constant";

interface IDayPickerProps {
  date: string;
  isToday: boolean;
  onChange: (date: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

const NAVIGATION_BUTTON_CLASS_NAME = joinClassNames(TOOLBAR_CONTROL_CLASS_NAME, "grid w-8 place-items-center text-gray-600");

export const DayPicker = ({ date, isToday, onChange, onPrevious, onNext, onToday }: IDayPickerProps) => (
  <div className="mb-6 flex flex-wrap items-center gap-3">
    <div className="flex items-center gap-2">
      <button type="button" onClick={onPrevious} aria-label={SCHEDULE_PAGE_TEXT.previousDay} className={NAVIGATION_BUTTON_CLASS_NAME}>
        <Icon name="chevronLeft" className="size-4" />
      </button>
      <input
        type="date"
        value={date}
        aria-label={SCHEDULE_PAGE_TEXT.day}
        onChange={(event) => event.target.value && onChange(event.target.value)}
        className={joinClassNames(TOOLBAR_CONTROL_CLASS_NAME, "px-3")}
      />
      <button type="button" onClick={onNext} aria-label={SCHEDULE_PAGE_TEXT.nextDay} className={NAVIGATION_BUTTON_CLASS_NAME}>
        <Icon name="chevronRight" className="size-4" />
      </button>
    </div>
    <p className="text-base font-semibold text-ink first-letter:uppercase">{formatDayTitle(date)}</p>
    {!isToday && (
      <Button variant="ghost" className="px-3 py-1.5" onClick={onToday}>
        {SCHEDULE_PAGE_TEXT.today}
      </Button>
    )}
  </div>
);

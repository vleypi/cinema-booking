"use client";

import { useState } from "react";
import { getTodayInTimeZone, shiftDate } from "@/shared/lib";

export const useScheduleDay = (timeZone: string) => {
  const [today] = useState(() => getTodayInTimeZone(timeZone));
  const [date, setDate] = useState(today);

  return {
    date,
    isToday: date === today,
    setDate,
    showPrevious: () => setDate((current) => shiftDate(current, -1)),
    showNext: () => setDate((current) => shiftDate(current, 1)),
    showToday: () => setDate(today),
  };
};

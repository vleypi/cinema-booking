"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useEffectEvent, useState } from "react";
import { getTodayInTimeZone, isCalendarDate, replaceSearchParams, shiftDate } from "@/shared/lib";
import { SCHEDULE_DATE_PARAM } from "@/views/schedule/constants/schedule-page.constant";

export const useScheduleDay = (timeZone: string) => {
  const searchParams = useSearchParams();
  const [today] = useState(() => getTodayInTimeZone(timeZone));
  const dateParam = searchParams.get(SCHEDULE_DATE_PARAM);
  const date = isCalendarDate(dateParam) ? dateParam : today;

  const setDate = (nextDate: string) => replaceSearchParams({ [SCHEDULE_DATE_PARAM]: nextDate });
  const showTodayInAddress = useEffectEvent(() => setDate(today));

  useEffect(() => {
    if (!isCalendarDate(dateParam)) showTodayInAddress();
  }, [dateParam]);

  return {
    date,
    today,
    isToday: date === today,
    setDate,
    showPrevious: () => setDate(shiftDate(date, -1)),
    showNext: () => setDate(shiftDate(date, 1)),
    showToday: () => setDate(today),
  };
};

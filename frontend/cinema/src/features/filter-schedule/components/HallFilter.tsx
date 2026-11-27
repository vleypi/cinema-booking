"use client";

import { ScheduleSelect } from "@/features/filter-schedule/components/ScheduleSelect";
import { FILTER_SCHEDULE_TEXT } from "@/features/filter-schedule/constants/filter-schedule.constant";
import type { IFilterOption } from "@/features/filter-schedule/interfaces/filter-schedule.interface";

interface IHallFilterProps {
  options: readonly IFilterOption[];
  value: string;
  onChange: (hallId: string) => void;
}

export const HallFilter = ({ options, value, onChange }: IHallFilterProps) => (
  <ScheduleSelect label={FILTER_SCHEDULE_TEXT.hall} allLabel={FILTER_SCHEDULE_TEXT.allHalls} options={options} value={value} onChange={onChange} />
);

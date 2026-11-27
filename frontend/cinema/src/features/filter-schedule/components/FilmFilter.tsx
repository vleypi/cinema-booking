"use client";

import { ScheduleSelect } from "@/features/filter-schedule/components/ScheduleSelect";
import { FILTER_SCHEDULE_TEXT } from "@/features/filter-schedule/constants/filter-schedule.constant";
import type { IFilterOption } from "@/features/filter-schedule/interfaces/filter-schedule.interface";

interface IFilmFilterProps {
  options: readonly IFilterOption[];
  value: string;
  onChange: (filmId: string) => void;
}

export const FilmFilter = ({ options, value, onChange }: IFilmFilterProps) => (
  <ScheduleSelect label={FILTER_SCHEDULE_TEXT.film} allLabel={FILTER_SCHEDULE_TEXT.allFilms} options={options} value={value} onChange={onChange} />
);

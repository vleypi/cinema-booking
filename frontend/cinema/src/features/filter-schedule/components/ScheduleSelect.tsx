"use client";

import { Icon } from "@luch/shared/ui";
import { ALL_OPTION } from "@/features/filter-schedule/constants/filter-schedule.constant";
import type { IFilterOption } from "@/features/filter-schedule/interfaces/filter-schedule.interface";

interface IScheduleSelectProps {
  label: string;
  allLabel: string;
  options: readonly IFilterOption[];
  value: string;
  onChange: (value: string) => void;
}

export const ScheduleSelect = ({ label, allLabel, options, value, onChange }: IScheduleSelectProps) => (
  <label className="relative flex min-h-11 items-center gap-2.5 rounded-full border border-paper/13 pl-4 transition-colors hover:border-paper/28">
    <span className="font-mono text-[0.72rem] tracking-[0.06em] text-paper/38 uppercase">{label}</span>
    <select
      value={value}
      aria-label={label}
      onChange={(event) => onChange(event.target.value)}
      className="max-w-44 cursor-pointer appearance-none truncate bg-transparent py-2.5 pr-9 font-medium text-paper"
    >
      <option value={ALL_OPTION} className="bg-ink-2">
        {allLabel}
      </option>
      {options.map(({ id, label: optionLabel }) => (
        <option key={id} value={id} className="bg-ink-2">
          {optionLabel}
        </option>
      ))}
    </select>
    <Icon name="chevronDown" className="pointer-events-none absolute top-1/2 right-3.5 size-3 -translate-y-1/2 text-paper/64" />
  </label>
);

"use client";

import { joinClassNames } from "@luch/shared/lib";
import { CheckboxField, LABEL_CLASS_NAME } from "@luch/shared/ui";
import type { ICinemaSummary } from "@/shared/api";
import { SAVE_STAFF_TEXT } from "@/features/save-staff/constants/save-staff.constant";

interface ICinemaChecklistProps {
  cinemas: ICinemaSummary[];
  value: string[];
  onChange: (cinemaIds: string[]) => void;
  error?: string;
}

export const CinemaChecklist = ({ cinemas, value, onChange, error }: ICinemaChecklistProps) => {
  const toggle = (cinemaId: string, isChecked: boolean) =>
    onChange(isChecked ? [...value, cinemaId] : value.filter((id) => id !== cinemaId));

  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className={joinClassNames("mb-1.5", LABEL_CLASS_NAME)}>{SAVE_STAFF_TEXT.cinemas}</legend>
      <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 px-2 py-1">
        {cinemas.map(({ id, name }) => (
          <CheckboxField key={id} label={name} checked={value.includes(id)} onChange={(event) => toggle(id, event.target.checked)} />
        ))}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </fieldset>
  );
};

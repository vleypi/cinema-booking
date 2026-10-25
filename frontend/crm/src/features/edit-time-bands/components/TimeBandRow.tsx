"use client";

import { joinClassNames } from "@luch/shared/lib";
import { Icon, LABEL_CLASS_NAME, TextField } from "@luch/shared/ui";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { MULTIPLIER_LIMITS } from "@/shared/config";
import { CARD_CLASS_NAME } from "@/shared/ui";
import { EDIT_TIME_BANDS_TEXT } from "@/features/edit-time-bands/constants/edit-time-bands.constant";
import type { TimeBandsFormValues } from "@/features/edit-time-bands/schemas/time-bands-form.schema";

type TimeBandValues = TimeBandsFormValues["bands"][number];

interface ITimeBandRowProps {
  index: number;
  register: UseFormRegister<TimeBandsFormValues>;
  errors: FieldErrors<TimeBandValues> | undefined;
  endsAt: string;
  canRemove: boolean;
  onRemove: () => void;
}

export const TimeBandRow = ({ index, register, errors, endsAt, canRemove, onRemove }: ITimeBandRowProps) => (
  <div className={joinClassNames(CARD_CLASS_NAME, "grid items-start gap-3 p-4 sm:grid-cols-[1fr_8rem_6rem_8rem_auto]")}>
    <TextField label={EDIT_TIME_BANDS_TEXT.name} error={errors?.name?.message} {...register(`bands.${index}.name`)} />
    <TextField label={EDIT_TIME_BANDS_TEXT.startsAt} type="time" error={errors?.startsAt?.message} {...register(`bands.${index}.startsAt`)} />
    <div className="flex flex-col gap-1.5">
      <span className={LABEL_CLASS_NAME}>{EDIT_TIME_BANDS_TEXT.endsAt}</span>
      <span className="py-2 text-sm text-gray-500 tabular-nums">{endsAt}</span>
    </div>
    <TextField
      label={EDIT_TIME_BANDS_TEXT.multiplier}
      type="number"
      min={MULTIPLIER_LIMITS.step}
      max={MULTIPLIER_LIMITS.max}
      step={MULTIPLIER_LIMITS.step}
      error={errors?.multiplier?.message}
      {...register(`bands.${index}.multiplier`, { valueAsNumber: true })}
    />
    <button
      type="button"
      onClick={onRemove}
      disabled={!canRemove}
      aria-label={EDIT_TIME_BANDS_TEXT.remove}
      className="grid size-9 place-items-center self-end rounded-lg text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-30 sm:mb-0.5"
    >
      <Icon name="trash" className="size-4" />
    </button>
  </div>
);

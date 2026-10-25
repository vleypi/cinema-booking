"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { applyServerErrors } from "@luch/shared/lib";
import { Button, FormError, Icon } from "@luch/shared/ui";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import type { ITimeBand } from "@/entities/time-band";
import { TimeBandRow } from "@/features/edit-time-bands/components/TimeBandRow";
import { EDIT_TIME_BANDS_TEXT, NEW_TIME_BAND, TIME_BAND_LIMITS } from "@/features/edit-time-bands/constants/edit-time-bands.constant";
import { useSaveTimeBands } from "@/features/edit-time-bands/hooks/useSaveTimeBands";
import { timeBandsFormSchema, type TimeBandsFormValues } from "@/features/edit-time-bands/schemas/time-bands-form.schema";
import { findBandEnd, toTimeBandsFormValues } from "@/features/edit-time-bands/utils/time-bands-form.util";

interface ITimeBandsFormProps {
  cinemaId: string;
  timeBands: readonly ITimeBand[];
}

export const TimeBandsForm = ({ cinemaId, timeBands }: ITimeBandsFormProps) => {
  const { mutate: save, isPending, isSuccess } = useSaveTimeBands(cinemaId);
  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isDirty },
  } = useForm<TimeBandsFormValues>({ resolver: zodResolver(timeBandsFormSchema), defaultValues: toTimeBandsFormValues(timeBands) });
  const { fields, append, remove } = useFieldArray({ control, name: "bands" });
  const starts = useWatch({ control, name: "bands" }).map(({ startsAt }) => startsAt);
  const bandsError = errors.bands?.message ?? errors.bands?.root?.message;

  const onSubmit = (values: TimeBandsFormValues) =>
    save(values, { onSuccess: (saved) => reset(toTimeBandsFormValues(saved)), onError: (error) => applyServerErrors(error, setError) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-3">
        {fields.map((field, index) => (
          <TimeBandRow
            key={field.id}
            index={index}
            register={register}
            errors={errors.bands?.[index]}
            endsAt={findBandEnd(starts, starts[index] ?? "")}
            canRemove={fields.length > 1}
            onRemove={() => remove(index)}
          />
        ))}
      </div>
      <FormError message={bandsError ?? errors.root?.server?.message} />
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" onClick={() => append({ ...NEW_TIME_BAND })} disabled={fields.length >= TIME_BAND_LIMITS.maxBands}>
          <Icon name="plus" className="size-4" />
          {EDIT_TIME_BANDS_TEXT.add}
        </Button>
        <div className="ml-auto flex items-center gap-2">
          {isSuccess && !isDirty && <span className="text-sm font-medium text-green-700">{EDIT_TIME_BANDS_TEXT.saved}</span>}
          {isDirty && (
            <Button variant="ghost" onClick={() => reset()} disabled={isPending}>
              {EDIT_TIME_BANDS_TEXT.reset}
            </Button>
          )}
          <Button type="submit" isLoading={isPending} disabled={!isDirty}>
            {EDIT_TIME_BANDS_TEXT.save}
          </Button>
        </div>
      </div>
    </form>
  );
};

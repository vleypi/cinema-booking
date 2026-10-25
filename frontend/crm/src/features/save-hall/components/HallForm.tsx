"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { applyServerErrors } from "@luch/shared/lib";
import { Button, CheckboxField, FormError, ModalFooter, TextField } from "@luch/shared/ui";
import { useForm } from "react-hook-form";
import type { IHall } from "@/entities/hall";
import { NEW_HALL_VALUES, SAVE_HALL_TEXT } from "@/features/save-hall/constants/save-hall.constant";
import { useSaveHall } from "@/features/save-hall/hooks/useSaveHall";
import { hallFormSchema, type HallFormValues } from "@/features/save-hall/schemas/hall-form.schema";
import { toHallFormValues } from "@/features/save-hall/utils/hall-form.util";

interface IHallFormProps {
  cinemaId: string;
  hall: IHall | null;
  onDone: () => void;
}

export const HallForm = ({ cinemaId, hall, onDone }: IHallFormProps) => {
  const { mutate: save, isPending } = useSaveHall(cinemaId, hall?.id ?? null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<HallFormValues>({ resolver: zodResolver(hallFormSchema), defaultValues: hall ? toHallFormValues(hall) : NEW_HALL_VALUES });

  const onSubmit = (values: HallFormValues) => save(values, { onSuccess: onDone, onError: (error) => applyServerErrors(error, setError) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <TextField label={SAVE_HALL_TEXT.name} error={errors.name?.message} {...register("name")} />
      <TextField label={SAVE_HALL_TEXT.format} hint={SAVE_HALL_TEXT.formatHint} error={errors.format?.message} {...register("format")} />
      <TextField
        label={SAVE_HALL_TEXT.basePrice}
        type="number"
        min={0}
        step={10}
        hint={SAVE_HALL_TEXT.basePriceHint}
        error={errors.basePrice?.message}
        {...register("basePrice", { valueAsNumber: true })}
      />
      <CheckboxField label={SAVE_HALL_TEXT.useTimeBands} description={SAVE_HALL_TEXT.useTimeBandsHint} {...register("useTimeBands")} />
      {hall && <CheckboxField label={SAVE_HALL_TEXT.isActive} description={SAVE_HALL_TEXT.isActiveHint} {...register("isActive")} />}
      <FormError message={errors.root?.server?.message} />
      <ModalFooter>
        <Button variant="secondary" onClick={onDone} disabled={isPending}>
          {SAVE_HALL_TEXT.cancel}
        </Button>
        <Button type="submit" isLoading={isPending}>
          {hall ? SAVE_HALL_TEXT.save : SAVE_HALL_TEXT.create}
        </Button>
      </ModalFooter>
    </form>
  );
};

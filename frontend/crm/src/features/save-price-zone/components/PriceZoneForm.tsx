"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { applyServerErrors } from "@luch/shared/lib";
import { Button, FormError, Icon, ModalFooter, TextField } from "@luch/shared/ui";
import { useForm } from "react-hook-form";
import { MULTIPLIER_LIMITS } from "@/shared/config";
import type { IPriceZone } from "@/entities/hall";
import { NEW_PRICE_ZONE_VALUES, SAVE_PRICE_ZONE_TEXT } from "@/features/save-price-zone/constants/save-price-zone.constant";
import { useRemovePriceZone } from "@/features/save-price-zone/hooks/useRemovePriceZone";
import { useSavePriceZone } from "@/features/save-price-zone/hooks/useSavePriceZone";
import { priceZoneFormSchema, type PriceZoneFormValues } from "@/features/save-price-zone/schemas/price-zone-form.schema";

interface IPriceZoneFormProps {
  cinemaId: string;
  hallId: string;
  priceZone: IPriceZone | null;
  onDone: () => void;
}

export const PriceZoneForm = ({ cinemaId, hallId, priceZone, onDone }: IPriceZoneFormProps) => {
  const { mutate: save, isPending: isSaving } = useSavePriceZone(cinemaId, hallId, priceZone?.id ?? null);
  const { mutate: remove, isPending: isRemoving } = useRemovePriceZone(cinemaId);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<PriceZoneFormValues>({
    resolver: zodResolver(priceZoneFormSchema),
    defaultValues: priceZone ? { name: priceZone.name, multiplier: priceZone.multiplier } : NEW_PRICE_ZONE_VALUES,
  });
  const isBusy = isSaving || isRemoving;

  const onSubmit = (values: PriceZoneFormValues) => save(values, { onSuccess: onDone, onError: (error) => applyServerErrors(error, setError) });
  const onRemove = (priceZoneId: string) => remove(priceZoneId, { onSuccess: onDone, onError: (error) => applyServerErrors(error, setError) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <TextField label={SAVE_PRICE_ZONE_TEXT.name} hint={SAVE_PRICE_ZONE_TEXT.nameHint} error={errors.name?.message} {...register("name")} />
      <TextField
        label={SAVE_PRICE_ZONE_TEXT.multiplier}
        type="number"
        min={MULTIPLIER_LIMITS.step}
        max={MULTIPLIER_LIMITS.max}
        step={MULTIPLIER_LIMITS.step}
        hint={SAVE_PRICE_ZONE_TEXT.multiplierHint}
        error={errors.multiplier?.message}
        {...register("multiplier", { valueAsNumber: true })}
      />
      <FormError message={errors.root?.server?.message} />
      <ModalFooter>
        {priceZone && (
          <Button variant="danger" className="px-3" isLoading={isRemoving} disabled={isSaving} onClick={() => onRemove(priceZone.id)}>
            <Icon name="trash" className="size-4" />
            {SAVE_PRICE_ZONE_TEXT.remove}
          </Button>
        )}
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" onClick={onDone} disabled={isBusy}>
            {SAVE_PRICE_ZONE_TEXT.cancel}
          </Button>
          <Button type="submit" isLoading={isSaving} disabled={isRemoving}>
            {priceZone ? SAVE_PRICE_ZONE_TEXT.save : SAVE_PRICE_ZONE_TEXT.create}
          </Button>
        </div>
      </ModalFooter>
    </form>
  );
};

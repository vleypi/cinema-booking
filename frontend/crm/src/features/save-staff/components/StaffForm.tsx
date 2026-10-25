"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { applyServerErrors } from "@luch/shared/lib";
import { Button, CheckboxField, FormError, SelectField, TextField } from "@luch/shared/ui";
import { Controller, useForm } from "react-hook-form";
import type { ICinemaSummary } from "@/shared/api";
import { STAFF_ROLE_LABELS, type StaffRole } from "@/shared/config";
import type { IStaffMember } from "@/entities/staff";
import { CinemaChecklist } from "@/features/save-staff/components/CinemaChecklist";
import { SAVE_STAFF_TEXT } from "@/features/save-staff/constants/save-staff.constant";
import { useSaveStaff } from "@/features/save-staff/hooks/useSaveStaff";
import { createStaffFormSchema, type StaffFormValues } from "@/features/save-staff/schemas/staff-form.schema";
import { toStaffFormValues } from "@/features/save-staff/utils/staff-form.util";

interface IStaffFormProps {
  member: IStaffMember | null;
  roles: StaffRole[];
  cinemas: ICinemaSummary[];
  currentCinemaId: string;
  onDone: () => void;
}

export const StaffForm = ({ member, roles, cinemas, currentCinemaId, onDone }: IStaffFormProps) => {
  const isNew = member === null;
  const { mutate: save, isPending } = useSaveStaff(member?.id ?? null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(createStaffFormSchema(isNew)),
    defaultValues: toStaffFormValues(member, cinemas, roles[roles.length - 1], currentCinemaId),
  });
  const roleOptions = roles.map((role) => ({ value: role, label: STAFF_ROLE_LABELS[role] }));

  const onSubmit = (values: StaffFormValues) => save(values, { onSuccess: onDone, onError: (error) => applyServerErrors(error, setError) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <TextField label={SAVE_STAFF_TEXT.fullName} error={errors.fullName?.message} {...register("fullName")} />
      <TextField
        label={SAVE_STAFF_TEXT.login}
        readOnly={!isNew}
        hint={isNew ? undefined : SAVE_STAFF_TEXT.loginHint}
        autoComplete="off"
        error={errors.login?.message}
        {...register("login")}
      />
      <SelectField label={SAVE_STAFF_TEXT.role} options={roleOptions} error={errors.role?.message} {...register("role")} />
      <TextField
        label={isNew ? SAVE_STAFF_TEXT.password : SAVE_STAFF_TEXT.newPassword}
        hint={isNew ? SAVE_STAFF_TEXT.passwordHint : SAVE_STAFF_TEXT.newPasswordHint}
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <Controller
        control={control}
        name="cinemaIds"
        render={({ field, fieldState }) => <CinemaChecklist cinemas={cinemas} value={field.value} onChange={field.onChange} error={fieldState.error?.message} />}
      />
      {!isNew && <CheckboxField label={SAVE_STAFF_TEXT.isBlocked} description={SAVE_STAFF_TEXT.isBlockedHint} {...register("isBlocked")} />}
      <FormError message={errors.root?.server?.message} />
      <div className="mt-2 flex justify-end gap-2">
        <Button variant="secondary" onClick={onDone} disabled={isPending}>
          {SAVE_STAFF_TEXT.cancel}
        </Button>
        <Button type="submit" isLoading={isPending}>
          {isNew ? SAVE_STAFF_TEXT.create : SAVE_STAFF_TEXT.save}
        </Button>
      </div>
    </form>
  );
};

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { staffService } from "@/entities/staff";
import type { StaffFormValues } from "@/features/save-staff/schemas/staff-form.schema";
import { toCreatePayload, toUpdatePayload } from "@/features/save-staff/utils/staff-form.util";

export const useSaveStaff = (memberId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: StaffFormValues) =>
      memberId ? staffService.update(memberId, toUpdatePayload(values)) : staffService.create(toCreatePayload(values)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.staff }),
  });
};

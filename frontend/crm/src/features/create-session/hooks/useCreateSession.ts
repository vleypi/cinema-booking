"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { sessionService } from "@/entities/session";
import type { SessionFormValues } from "@/features/create-session/schemas/session-form.schema";
import { toSessionPayload } from "@/features/create-session/utils/session-form.util";

export const useCreateSession = (cinemaId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: SessionFormValues) => sessionService.create(cinemaId, toSessionPayload(values)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sessions }),
  });
};

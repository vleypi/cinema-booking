"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { sessionService } from "@/entities/session";

export const useRemoveSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => sessionService.remove(sessionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sessions }),
  });
};

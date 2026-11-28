"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { sessionService } from "@/entities/session";

export const useSessionCancelPreview = (sessionId: string | null) =>
  useQuery({
    queryKey: QUERY_KEYS.sessionCancelPreview(sessionId ?? ""),
    queryFn: () => sessionService.getCancelPreview(sessionId ?? ""),
    enabled: Boolean(sessionId),
  });

export const useCancelSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, reason }: { sessionId: string; reason: string }) =>
      sessionService.cancel(sessionId, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sessions });
      void queryClient.invalidateQueries({ queryKey: ["box-office"] });
      void queryClient.invalidateQueries({ queryKey: ["reports"] });
      void queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    },
  });
};

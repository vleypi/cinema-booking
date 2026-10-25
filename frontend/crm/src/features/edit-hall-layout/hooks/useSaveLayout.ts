"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { hallService, type IHallLayoutPayload } from "@/entities/hall";

export const useSaveLayout = (hallId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: IHallLayoutPayload) => hallService.createLayout(hallId, payload),
    onSuccess: (layout) => queryClient.setQueryData(QUERY_KEYS.hallLayout(hallId), layout),
  });
};

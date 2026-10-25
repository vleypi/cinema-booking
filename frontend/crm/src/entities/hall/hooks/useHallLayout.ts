"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { hallService } from "@/entities/hall/services/hall.service";

export const useHallLayout = (hallId: string) =>
  useQuery({ queryKey: QUERY_KEYS.hallLayout(hallId), queryFn: () => hallService.getCurrentLayout(hallId) });

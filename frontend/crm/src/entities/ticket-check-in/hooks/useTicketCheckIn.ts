"use client";

import { useMutation } from "@tanstack/react-query";
import type { ICheckInPayload } from "@/entities/ticket-check-in/interfaces/ticket-check-in.interface";
import { ticketCheckInService } from "@/entities/ticket-check-in/services/ticket-check-in.service";

export const useTicketCheckIn = (cinemaId: string) =>
  useMutation({
    mutationFn: (payload: ICheckInPayload) => ticketCheckInService.checkIn(cinemaId, payload),
  });

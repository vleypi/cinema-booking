import { z } from "zod";
import { SCAN_TICKET_TEXT } from "@/features/scan-ticket/constants/scan-ticket.constant";

export const manualCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, SCAN_TICKET_TEXT.manualRequired)
    .max(32, SCAN_TICKET_TEXT.manualTooLong)
    .transform((value) => value.toUpperCase()),
});

export type ManualCodeFormValues = z.infer<typeof manualCodeSchema>;

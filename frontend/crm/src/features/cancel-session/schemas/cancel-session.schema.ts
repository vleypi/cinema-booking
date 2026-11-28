import { z } from "zod";
import { CANCEL_SESSION_TEXT } from "@/features/cancel-session/constants/cancel-session.constant";

export const cancelSessionSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, CANCEL_SESSION_TEXT.reasonRequired)
    .max(300, CANCEL_SESSION_TEXT.reasonTooLong),
});

export type CancelSessionFormValues = z.infer<typeof cancelSessionSchema>;

import { z } from "zod";
import { BOOK_SEATS_TEXT } from "@/features/book-seats/constants/book-seats.constant";

export const createCheckoutSchema = (requiresAgeConfirmation: boolean) =>
  z.object({
    email: z.string().trim().email(BOOK_SEATS_TEXT.validationEmail),
    name: z.string().trim().max(120).optional(),
    phone: z.string().trim().max(32).optional(),
    privacyAccepted: z.boolean().refine((value) => value, { message: BOOK_SEATS_TEXT.validationPrivacy }),
    ageConfirmed: z.boolean().refine((value) => !requiresAgeConfirmation || value, {
      message: BOOK_SEATS_TEXT.validationAge,
    }),
  });

export type CheckoutFormValues = z.infer<ReturnType<typeof createCheckoutSchema>>;

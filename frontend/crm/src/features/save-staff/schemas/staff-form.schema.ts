import { z } from "zod";
import { STAFF_ROLES } from "@/shared/config";
import { loginSchema, passwordSchema } from "@/shared/lib";
import { FULL_NAME_MAX_LENGTH, SAVE_STAFF_TEXT } from "@/features/save-staff/constants/save-staff.constant";

export const createStaffFormSchema = (isNew: boolean) =>
  z.object({
    login: loginSchema,
    password: isNew ? passwordSchema : z.union([z.literal(""), passwordSchema]),
    fullName: z.string().trim().min(1, SAVE_STAFF_TEXT.required).max(FULL_NAME_MAX_LENGTH, SAVE_STAFF_TEXT.tooLong),
    role: z.enum(STAFF_ROLES),
    cinemaIds: z.array(z.string()).min(1, SAVE_STAFF_TEXT.cinemasRequired),
    isBlocked: z.boolean(),
  });

export type StaffFormValues = z.infer<ReturnType<typeof createStaffFormSchema>>;

import { z } from "zod";

export const updateUserProfileSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(80, "Name must not exceed 80 characters")
        .optional(),
    avatar: z
        .string()
        .url("Avatar must be a valid URL")
        .optional()
        .nullable(),
});

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;


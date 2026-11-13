import { z } from "zod";

export const createRevisionSchema = z.object({
    title: z
        .string()
        .trim()
        .min(2, "Title must be at least 2 characters")
        .max(200, "Title cannot exceed 200 characters"),
    scheduledAt: z.coerce.date(),
    notes: z
        .string()
        .trim()
        .max(3000)
        .optional(),
    document: z
        .string()
        .trim()
        .optional(),
    chapter: z
        .string()
        .trim()
        .optional(),
    concept: z
        .string()
        .trim()
        .optional(),
});

export const updateRevisionSchema = z.object({
    title: z.string().trim().min(2).max(200).optional(),
    notes: z.string().trim().max(3000).optional(),
    scheduledAt: z.coerce.date().optional(),
    status: z.enum(["pending", "in_progress", "completed"]).optional(),
});

export const revisionQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    status: z.enum(["pending", "in_progress", "completed"]).optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
});

export type CreateRevisionInput = z.infer<typeof createRevisionSchema>;
export type UpdateRevisionInput = z.infer<typeof updateRevisionSchema>;
export type RevisionQueryInput = z.infer<typeof revisionQuerySchema>;


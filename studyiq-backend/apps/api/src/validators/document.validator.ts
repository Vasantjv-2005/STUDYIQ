import { z } from "zod";

export const uploadDocumentBodySchema = z.object({
    title: z
        .string()
        .trim()
        .min(2, "Title must be at least 2 characters")
        .max(200, "Title must not exceed 200 characters")
        .optional(),
    description: z
        .string()
        .trim()
        .max(1000, "Description must not exceed 1000 characters")
        .optional(),
    subject: z
        .string()
        .trim()
        .max(100, "Subject must not exceed 100 characters")
        .optional(),
});

export const documentQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    status: z.enum(["uploaded", "processing", "completed", "failed"]).optional(),
    subject: z.string().trim().optional(),
    search: z.string().trim().optional(),
});

export type UploadDocumentBodyInput = z.infer<typeof uploadDocumentBodySchema>;
export type DocumentQueryInput = z.infer<typeof documentQuerySchema>;


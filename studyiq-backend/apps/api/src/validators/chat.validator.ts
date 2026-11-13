import { z } from "zod";

export const createChatSessionSchema = z.object({
    title: z
        .string()
        .trim()
        .max(200, "Title cannot exceed 200 characters")
        .optional()
        .default("New conversation"),
    documentId: z
        .string()
        .trim()
        .optional(),
});

export const sendChatMessageSchema = z.object({
    content: z
        .string()
        .trim()
        .min(1, "Message content is required")
        .max(30000, "Message content cannot exceed 30,000 characters"),
});

export const messageFeedbackSchema = z.object({
    feedback: z.enum(["helpful", "not_helpful"], {
        error: "Feedback must be either 'helpful' or 'not_helpful'",
    }),
});

export const chatSessionsQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    documentId: z.string().trim().optional(),
    isArchived: z.preprocess((val) => {
        if (typeof val === "string") return val.toLowerCase() === "true";
        return val;
    }, z.boolean().optional()),
});

export type CreateChatSessionInput = z.infer<typeof createChatSessionSchema>;
export type SendChatMessageInput = z.infer<typeof sendChatMessageSchema>;
export type MessageFeedbackInput = z.infer<typeof messageFeedbackSchema>;
export type ChatSessionsQueryInput = z.infer<typeof chatSessionsQuerySchema>;


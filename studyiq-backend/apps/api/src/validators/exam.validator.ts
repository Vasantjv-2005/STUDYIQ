import { z } from "zod";

export const extractedQuestionValidatorSchema = z.object({
    questionNumber: z
        .number()
        .int()
        .positive("Question number must be positive"),
    questionText: z
        .string()
        .trim()
        .min(1, "Question text cannot be empty")
        .max(10000, "Question text cannot exceed 10,000 characters"),
    marks: z
        .number()
        .min(0, "Marks must be non-negative")
        .optional(),
    topic: z
        .string()
        .trim()
        .max(200, "Topic cannot exceed 200 characters")
        .optional(),
    chapter: z
        .string()
        .trim()
        .optional(),
    pageNumber: z
        .number()
        .int()
        .positive()
        .optional(),
});

export const createQuestionPaperSchema = z.object({
    title: z
        .string()
        .trim()
        .min(2, "Title must be at least 2 characters")
        .max(200, "Title cannot exceed 200 characters"),
    subject: z
        .string()
        .trim()
        .min(1, "Subject is required")
        .max(150, "Subject cannot exceed 150 characters"),
    university: z
        .string()
        .trim()
        .max(200, "University cannot exceed 200 characters")
        .optional(),
    course: z
        .string()
        .trim()
        .max(150, "Course cannot exceed 150 characters")
        .optional(),
    semester: z
        .number()
        .int()
        .min(1)
        .max(20)
        .optional(),
    examYear: z
        .number()
        .int()
        .min(1900)
        .max(2100)
        .optional(),
    examType: z
        .string()
        .trim()
        .max(100)
        .optional(),
    totalMarks: z
        .number()
        .min(0)
        .optional(),
    durationMinutes: z
        .number()
        .int()
        .min(1)
        .optional(),
    document: z
        .string()
        .trim()
        .optional(),
    questions: z
        .array(extractedQuestionValidatorSchema)
        .default([]),
});

export const questionPaperQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    subject: z.string().trim().optional(),
    examYear: z.coerce.number().int().optional(),
    status: z.enum(["uploaded", "processing", "completed", "failed"]).optional(),
});

export type CreateQuestionPaperInput = z.infer<typeof createQuestionPaperSchema>;
export type QuestionPaperQueryInput = z.infer<typeof questionPaperQuerySchema>;


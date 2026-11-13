import { z } from "zod";

export const studyTaskValidatorSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, "Task title is required")
        .max(200, "Task title cannot exceed 200 characters"),
    description: z
        .string()
        .trim()
        .max(1000)
        .optional(),
    subject: z
        .string()
        .trim()
        .min(1, "Subject is required")
        .max(150),
    scheduledDate: z.coerce.date(),
    estimatedMinutes: z
        .number()
        .int()
        .positive("Estimated minutes must be positive"),
    completedMinutes: z
        .number()
        .int()
        .min(0)
        .default(0),
    status: z
        .enum(["pending", "in_progress", "completed"])
        .default("pending"),
});

export const createStudyPlanSchema = z.object({
    title: z
        .string()
        .trim()
        .min(2, "Plan title must be at least 2 characters")
        .max(200, "Plan title cannot exceed 200 characters"),
    description: z
        .string()
        .trim()
        .max(2000)
        .optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    subjects: z
        .array(z.string().trim().min(1))
        .default([]),
    tasks: z
        .array(studyTaskValidatorSchema)
        .default([]),
    status: z
        .enum(["active", "completed", "paused"])
        .default("active"),
}).refine((data) => data.startDate <= data.endDate, {
    message: "End date must be on or after the start date",
    path: ["endDate"],
});

export const updateStudyPlanSchema = z.object({
    title: z
        .string()
        .trim()
        .min(2)
        .max(200)
        .optional(),
    description: z
        .string()
        .trim()
        .max(2000)
        .optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    subjects: z.array(z.string().trim().min(1)).optional(),
    status: z.enum(["active", "completed", "paused"]).optional(),
});

export const addStudyTaskSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, "Task title is required")
        .max(200),
    description: z
        .string()
        .trim()
        .max(1000)
        .optional(),
    subject: z
        .string()
        .trim()
        .min(1, "Subject is required")
        .max(150),
    scheduledDate: z.coerce.date(),
    estimatedMinutes: z
        .number()
        .int()
        .positive("Estimated minutes must be positive"),
});

export const updateStudyTaskSchema = z.object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(1000).optional(),
    subject: z.string().trim().min(1).max(150).optional(),
    scheduledDate: z.coerce.date().optional(),
    estimatedMinutes: z.number().int().positive().optional(),
    completedMinutes: z.number().int().min(0).optional(),
    status: z.enum(["pending", "in_progress", "completed"]).optional(),
});

export const plannerQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    status: z.enum(["active", "completed", "paused"]).optional(),
});

export type CreateStudyPlanInput = z.infer<typeof createStudyPlanSchema>;
export type UpdateStudyPlanInput = z.infer<typeof updateStudyPlanSchema>;
export type AddStudyTaskInput = z.infer<typeof addStudyTaskSchema>;
export type UpdateStudyTaskInput = z.infer<typeof updateStudyTaskSchema>;
export type PlannerQueryInput = z.infer<typeof plannerQuerySchema>;


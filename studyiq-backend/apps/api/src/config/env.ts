import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),

    PORT: z.coerce
        .number()
        .int()
        .positive()
        .default(5000),

    MONGODB_URI: z
        .string()
        .min(1, "MONGODB_URI is required"),

    JWT_SECRET: z
        .string()
        .min(32, "JWT_SECRET must contain at least 32 characters"),

    JWT_EXPIRES_IN: z
        .string()
        .default("7d"),

    UPLOAD_DIR: z
        .string()
        .default("uploads"),

    MAX_FILE_SIZE_MB: z.coerce
        .number()
        .positive()
        .default(50),

    GEMINI_API_KEY: z
        .string()
        .optional(),

    OPENAI_API_KEY: z
        .string()
        .optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error("Invalid environment configuration:");

    for (const issue of parsedEnv.error.issues) {
        console.error(
            `- ${issue.path.join(".")}: ${issue.message}`
        );
    }

    throw new Error("Environment validation failed.");
}

export const env = parsedEnv.data;

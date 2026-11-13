import { env } from "../config/env.js";

/**
 * Generates vector embeddings for textbook text chunks.
 * Falls back safely when embedding API is not configured.
 */
export const generateEmbedding = async (
    text: string
): Promise<number[] | null> => {
    if (!env.GEMINI_API_KEY && !env.OPENAI_API_KEY) {
        return null;
    }

    if (env.GEMINI_API_KEY) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${env.GEMINI_API_KEY}`;
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "models/text-embedding-004",
                    content: { parts: [{ text }] },
                }),
            });

            if (!response.ok) return null;

            const data = (await response.json()) as {
                embedding?: { values?: number[] };
            };

            return data.embedding?.values || null;
        } catch {
            return null;
        }
    }

    return null;
};


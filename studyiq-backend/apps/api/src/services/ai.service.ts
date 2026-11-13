import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export interface GenerateChatResponseOptions {
    prompt: string;
    contextExcerpts: string[];
    conversationHistory: { role: "user" | "assistant"; content: string }[];
}

export const isAiServiceConfigured = (): boolean => {
    return Boolean(env.GEMINI_API_KEY || env.OPENAI_API_KEY);
};

export const generateTextbookChatResponse = async (
    options: GenerateChatResponseOptions
): Promise<string> => {
    if (!env.GEMINI_API_KEY && !env.OPENAI_API_KEY) {
        throw ApiError.serviceUnavailable(
            "AI service is not configured on this server. Please configure GEMINI_API_KEY in environment variables."
        );
    }

    if (env.GEMINI_API_KEY) {
        return generateGeminiResponse(options);
    }

    return generateOpenAiResponse(options);
};

const generateGeminiResponse = async (
    options: GenerateChatResponseOptions
): Promise<string> => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

    const systemInstruction = `You are STUDYIQ Academic Intelligence Assistant.
Your task is to help the student understand textbook material.
Ground your answers strictly on the provided textbook excerpts.
Never invent facts, chapters, or citations that are not in the context.
If the excerpts do not contain enough information, explain what is covered and state what is missing.`;

    const contextBlock = options.contextExcerpts.length > 0
        ? `TEXTBOOK CONTEXT EXCERPTS:\n${options.contextExcerpts.map((e, idx) => `[Source ${idx + 1}]:\n${e}`).join("\n\n")}\n\n`
        : "No specific textbook excerpts retrieved for this query.\n\n";

    const contents = [
        ...options.conversationHistory.slice(-6).map((msg) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
        })),
        {
            role: "user",
            parts: [{ text: `${contextBlock}STUDENT QUERY: ${options.prompt}` }],
        },
    ];

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: systemInstruction }],
                },
                contents,
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 2048,
                },
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text().catch(() => "");
            console.error("[Gemini API Error]", response.status, errorBody);
            throw ApiError.serviceUnavailable("Upstream AI service error while processing query.");
        }

        const data = (await response.json()) as {
            candidates?: Array<{
                content?: {
                    parts?: Array<{ text?: string }>;
                };
            }>;
        };

        const answerText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!answerText) {
            throw ApiError.serviceUnavailable("AI service returned an empty response.");
        }

        return answerText.trim();
    } catch (error: unknown) {
        if (error instanceof ApiError) throw error;
        throw ApiError.serviceUnavailable("Failed to connect to the AI intelligence provider.");
    }
};

const generateOpenAiResponse = async (
    options: GenerateChatResponseOptions
): Promise<string> => {
    const url = "https://api.openai.com/v1/chat/completions";

    const systemPrompt = `You are STUDYIQ Academic Intelligence Assistant.
Ground your answers strictly on the provided textbook excerpts.
Never fabricate answers or citations outside the provided context.`;

    const contextText = options.contextExcerpts.length > 0
        ? `TEXTBOOK CONTEXT EXCERPTS:\n${options.contextExcerpts.join("\n\n")}\n\n`
        : "";

    const messages = [
        { role: "system", content: systemPrompt },
        ...options.conversationHistory.slice(-6).map((msg) => ({
            role: msg.role,
            content: msg.content,
        })),
        {
            role: "user",
            content: `${contextText}STUDENT QUERY: ${options.prompt}`,
        },
    ];

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages,
                temperature: 0.3,
            }),
        });

        if (!response.ok) {
            throw ApiError.serviceUnavailable("Upstream OpenAI service returned an error.");
        }

        const data = (await response.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
        };

        const content = data.choices?.[0]?.message?.content;
        if (!content) {
            throw ApiError.serviceUnavailable("AI service returned an empty response.");
        }

        return content.trim();
    } catch (error: unknown) {
        if (error instanceof ApiError) throw error;
        throw ApiError.serviceUnavailable("Failed to reach OpenAI service.");
    }
};


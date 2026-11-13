import mongoose from "mongoose";

import ChatSession, { type IChatSession } from "../models/ChatSession.model.js";
import ChatMessage, { type IChatMessage } from "../models/ChatMessage.model.js";
import DocumentModel from "../models/Document.model.js";
import { ApiError } from "../utils/ApiError.js";
import { formatPaginatedResponse } from "../utils/pagination.js";
import { retrieveTextbookContext } from "./rag.service.js";
import { generateTextbookChatResponse } from "./ai.service.js";
import type {
    CreateChatSessionInput,
    SendChatMessageInput,
    ChatSessionsQueryInput,
} from "../validators/chat.validator.js";
import type { PaginatedResponseData } from "../types/api.types.js";

export interface ChatSessionResponse {
    id: string;
    userId: string;
    documentId?: string | null;
    title: string;
    isArchived: boolean;
    lastMessageAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface ChatMessageResponse {
    id: string;
    sessionId: string;
    userId: string;
    role: string;
    content: string;
    sources: unknown[];
    feedback?: string;
    createdAt: Date;
    updatedAt: Date;
}

const formatSession = (s: IChatSession): ChatSessionResponse => ({
    id: s._id.toString(),
    userId: s.user.toString(),
    documentId: s.document ? s.document.toString() : null,
    title: s.title,
    isArchived: s.isArchived,
    lastMessageAt: s.lastMessageAt,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
});

const formatMessage = (m: IChatMessage): ChatMessageResponse => ({
    id: m._id.toString(),
    sessionId: m.session.toString(),
    userId: m.user.toString(),
    role: m.role,
    content: m.content,
    sources: m.sources,
    feedback: m.feedback,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
});

export const createSession = async (
    userId: string,
    input: CreateChatSessionInput
): Promise<ChatSessionResponse> => {
    let docObjectId: mongoose.Types.ObjectId | undefined = undefined;

    if (input.documentId) {
        if (!mongoose.isValidObjectId(input.documentId)) {
            throw ApiError.badRequest("Invalid document ID format.");
        }

        const docExists = await DocumentModel.exists({
            _id: input.documentId,
            user: userId,
        });

        if (!docExists) {
            throw ApiError.notFound("Textbook document not found or access denied.");
        }

        docObjectId = new mongoose.Types.ObjectId(input.documentId);
    }

    const session = new ChatSession({
        user: new mongoose.Types.ObjectId(userId),
        document: docObjectId,
        title: input.title || "New conversation",
        isArchived: false,
    });

    await session.save();
    return formatSession(session);
};

export const getSessions = async (
    userId: string,
    query: ChatSessionsQueryInput
): Promise<PaginatedResponseData<ChatSessionResponse>> => {
    const filter: Record<string, unknown> = {
        user: new mongoose.Types.ObjectId(userId),
    };

    if (query.documentId) {
        if (!mongoose.isValidObjectId(query.documentId)) {
            throw ApiError.badRequest("Invalid document ID format.");
        }
        filter["document"] = new mongoose.Types.ObjectId(query.documentId);
    }

    if (query.isArchived !== undefined) {
        filter["isArchived"] = query.isArchived;
    }

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
        ChatSession.find(filter)
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(query.limit)
            .lean<IChatSession[]>()
            .exec(),
        ChatSession.countDocuments(filter).exec(),
    ]);

    return formatPaginatedResponse(items.map(formatSession), total, query.page, query.limit);
};

export const getSessionById = async (
    userId: string,
    sessionId: string
): Promise<ChatSessionResponse> => {
    if (!mongoose.isValidObjectId(sessionId)) {
        throw ApiError.badRequest("Invalid session ID format.");
    }

    const session = await ChatSession.findOne({
        _id: sessionId,
        user: userId,
    })
        .lean<IChatSession>()
        .exec();

    if (!session) {
        throw ApiError.notFound("Chat session not found or access denied.");
    }

    return formatSession(session);
};

export const getMessages = async (
    userId: string,
    sessionId: string
): Promise<ChatMessageResponse[]> => {
    if (!mongoose.isValidObjectId(sessionId)) {
        throw ApiError.badRequest("Invalid session ID format.");
    }

    const sessionExists = await ChatSession.exists({
        _id: sessionId,
        user: userId,
    });

    if (!sessionExists) {
        throw ApiError.notFound("Chat session not found or access denied.");
    }

    const messages = await ChatMessage.find({
        session: sessionId,
        user: userId,
    })
        .sort({ createdAt: 1 })
        .lean<IChatMessage[]>()
        .exec();

    return messages.map(formatMessage);
};

export const sendMessage = async (
    userId: string,
    sessionId: string,
    input: SendChatMessageInput
): Promise<{ userMessage: ChatMessageResponse; assistantMessage: ChatMessageResponse }> => {
    if (!mongoose.isValidObjectId(sessionId)) {
        throw ApiError.badRequest("Invalid session ID format.");
    }

    const session = await ChatSession.findOne({
        _id: sessionId,
        user: userId,
    });

    if (!session) {
        throw ApiError.notFound("Chat session not found or access denied.");
    }

    // Persist student's query message
    const userMessage = new ChatMessage({
        session: session._id,
        user: new mongoose.Types.ObjectId(userId),
        role: "user",
        content: input.content,
        sources: [],
    });
    await userMessage.save();

    // Ground context from textbook if session is bound to a document
    const { sources, contextExcerpts } = await retrieveTextbookContext(
        userId,
        session.document ? session.document.toString() : undefined,
        input.content
    );

    // Retrieve recent conversation history for coherence
    const recentMessages = await ChatMessage.find({
        session: session._id,
        user: userId,
    })
        .sort({ createdAt: -1 })
        .limit(6)
        .lean<IChatMessage[]>()
        .exec();

    const conversationHistory = recentMessages
        .reverse()
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
        }));

    // Generate response using grounded AI provider
    const assistantReply = await generateTextbookChatResponse({
        prompt: input.content,
        contextExcerpts,
        conversationHistory,
    });

    // Persist assistant message with actual cited sources
    const assistantMessage = new ChatMessage({
        session: session._id,
        user: new mongoose.Types.ObjectId(userId),
        role: "assistant",
        content: assistantReply,
        sources,
    });
    await assistantMessage.save();

    // Update session timestamp
    session.lastMessageAt = new Date();
    await session.save();

    return {
        userMessage: formatMessage(userMessage),
        assistantMessage: formatMessage(assistantMessage),
    };
};

export const archiveSession = async (
    userId: string,
    sessionId: string
): Promise<ChatSessionResponse> => {
    if (!mongoose.isValidObjectId(sessionId)) {
        throw ApiError.badRequest("Invalid session ID format.");
    }

    const session = await ChatSession.findOneAndUpdate(
        { _id: sessionId, user: userId },
        { isArchived: true },
        { new: true }
    );

    if (!session) {
        throw ApiError.notFound("Chat session not found or access denied.");
    }

    return formatSession(session);
};

export const deleteSession = async (
    userId: string,
    sessionId: string
): Promise<void> => {
    if (!mongoose.isValidObjectId(sessionId)) {
        throw ApiError.badRequest("Invalid session ID format.");
    }

    const session = await ChatSession.findOneAndDelete({
        _id: sessionId,
        user: userId,
    });

    if (!session) {
        throw ApiError.notFound("Chat session not found or access denied.");
    }

    await ChatMessage.deleteMany({ session: sessionId, user: userId });
};

export const submitFeedback = async (
    userId: string,
    messageId: string,
    feedback: "helpful" | "not_helpful"
): Promise<ChatMessageResponse> => {
    if (!mongoose.isValidObjectId(messageId)) {
        throw ApiError.badRequest("Invalid message ID format.");
    }

    const message = await ChatMessage.findOneAndUpdate(
        { _id: messageId, user: userId, role: "assistant" },
        { feedback },
        { new: true }
    );

    if (!message) {
        throw ApiError.notFound("Assistant chat message not found or access denied.");
    }

    return formatMessage(message);
};


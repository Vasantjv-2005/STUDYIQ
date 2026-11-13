import type { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { getRouteParam } from "../utils/params.js";
import {
    createChatSessionSchema,
    sendChatMessageSchema,
    messageFeedbackSchema,
    chatSessionsQuerySchema,
} from "../validators/chat.validator.js";
import * as chatService from "../services/chat.service.js";

/**
 * @desc   Create a new textbook chat session
 * @route  POST /api/chat/sessions
 * @access Private
 */
export const createChatSession = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const validatedInput = createChatSessionSchema.parse(req.body);
        const session = await chatService.createSession(
            req.user.id,
            validatedInput
        );

        ApiResponse.created(session, "Chat session created successfully.").send(res);
    }
);

/**
 * @desc   Get all chat sessions belonging to the authenticated user
 * @route  GET /api/chat/sessions
 * @access Private
 */
export const getChatSessions = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const validatedQuery = chatSessionsQuerySchema.parse(req.query);
        const result = await chatService.getSessions(
            req.user.id,
            validatedQuery
        );

        ApiResponse.ok(result, "Chat sessions retrieved successfully.").send(res);
    }
);

/**
 * @desc   Get details of a specific chat session
 * @route  GET /api/chat/sessions/:sessionId
 * @access Private
 */
export const getChatSessionById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const sessionId = getRouteParam(req.params["sessionId"], "sessionId");
        const session = await chatService.getSessionById(req.user.id, sessionId);

        ApiResponse.ok(session, "Chat session retrieved successfully.").send(res);
    }
);

/**
 * @desc   Get messages from a chat session
 * @route  GET /api/chat/sessions/:sessionId/messages
 * @access Private
 */
export const getChatMessages = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const sessionId = getRouteParam(req.params["sessionId"], "sessionId");
        const messages = await chatService.getMessages(req.user.id, sessionId);

        ApiResponse.ok(messages, "Messages retrieved successfully.").send(res);
    }
);

/**
 * @desc   Send a message and receive an AI-generated response
 * @route  POST /api/chat/sessions/:sessionId/messages
 * @access Private
 */
export const sendChatMessage = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const sessionId = getRouteParam(req.params["sessionId"], "sessionId");
        const validatedInput = sendChatMessageSchema.parse(req.body);

        const result = await chatService.sendMessage(
            req.user.id,
            sessionId,
            validatedInput
        );

        ApiResponse.created(result, "Response generated successfully.").send(res);
    }
);

/**
 * @desc   Archive a chat session
 * @route  PATCH /api/chat/sessions/:sessionId/archive
 * @access Private
 */
export const archiveChatSession = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const sessionId = getRouteParam(req.params["sessionId"], "sessionId");
        const session = await chatService.archiveSession(req.user.id, sessionId);

        ApiResponse.ok(session, "Chat session archived successfully.").send(res);
    }
);

/**
 * @desc   Delete a chat session and its messages
 * @route  DELETE /api/chat/sessions/:sessionId
 * @access Private
 */
export const deleteChatSession = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const sessionId = getRouteParam(req.params["sessionId"], "sessionId");
        await chatService.deleteSession(req.user.id, sessionId);

        ApiResponse.ok(
            { message: "Chat session deleted successfully." },
            "Chat session deleted successfully."
        ).send(res);
    }
);

/**
 * @desc   Submit feedback for an AI-generated message
 * @route  PATCH /api/chat/messages/:messageId/feedback
 * @access Private
 */
export const submitMessageFeedback = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const messageId = getRouteParam(req.params["messageId"], "messageId");
        const validatedInput = messageFeedbackSchema.parse(req.body);

        const updatedMessage = await chatService.submitFeedback(
            req.user.id,
            messageId,
            validatedInput.feedback
        );

        ApiResponse.ok(
            updatedMessage,
            "Feedback recorded successfully."
        ).send(res);
    }
);


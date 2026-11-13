
import { Router } from "express";

import {
    createChatSession,
    getChatSessions,
    getChatSessionById,
    sendChatMessage,
    getChatMessages,
    archiveChatSession,
    deleteChatSession,
    submitMessageFeedback,
} from "../controllers/chat.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * All chat routes require an authenticated user.
 */
router.use(authenticate);

/**
 * @route   POST /api/chat/sessions
 * @desc    Create a new textbook chat session
 * @access  Private
 */
router.post("/sessions", createChatSession);

/**
 * @route   GET /api/chat/sessions
 * @desc    Get all chat sessions belonging to the authenticated user
 * @access  Private
 */
router.get("/sessions", getChatSessions);

/**
 * @route   GET /api/chat/sessions/:sessionId
 * @desc    Get details of a specific chat session
 * @access  Private
 */
router.get("/sessions/:sessionId", getChatSessionById);

/**
 * @route   GET /api/chat/sessions/:sessionId/messages
 * @desc    Get messages from a chat session
 * @access  Private
 */
router.get("/sessions/:sessionId/messages", getChatMessages);

/**
 * @route   POST /api/chat/sessions/:sessionId/messages
 * @desc    Send a message and receive an AI-generated response
 * @access  Private
 */
router.post("/sessions/:sessionId/messages", sendChatMessage);

/**
 * @route   PATCH /api/chat/sessions/:sessionId/archive
 * @desc    Archive a chat session
 * @access  Private
 */
router.patch("/sessions/:sessionId/archive", archiveChatSession);

/**
 * @route   DELETE /api/chat/sessions/:sessionId
 * @desc    Delete a chat session and its associated messages
 * @access  Private
 */
router.delete("/sessions/:sessionId", deleteChatSession);

/**
 * @route   PATCH /api/chat/messages/:messageId/feedback
 * @desc    Submit feedback for an AI-generated message
 * @access  Private
 */
router.patch("/messages/:messageId/feedback", submitMessageFeedback);

export default router;

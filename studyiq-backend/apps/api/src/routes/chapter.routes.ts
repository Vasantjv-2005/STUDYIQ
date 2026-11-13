
import { Router } from "express";

import {
    getChaptersByDocument,
    getChapterById,
    getChapterContent,
} from "../controllers/chapter.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * All chapter routes require authentication.
 */
router.use(authenticate);

/**
 * @route   GET /api/chapters/document/:documentId
 * @desc    Get all chapters belonging to a document
 * @access  Private
 */
router.get("/document/:documentId", getChaptersByDocument);

/**
 * @route   GET /api/chapters/:chapterId/content
 * @desc    Get the full content of a chapter
 * @access  Private
 */
router.get("/:chapterId/content", getChapterContent);

/**
 * @route   GET /api/chapters/:chapterId
 * @desc    Get a specific chapter
 * @access  Private
 */
router.get("/:chapterId", getChapterById);

export default router;

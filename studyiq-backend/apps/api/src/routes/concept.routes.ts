
import { Router } from "express";

import {
    getConceptsByChapter,
    getConceptById,
    getConceptsByDocument,
    getRelatedConcepts,
} from "../controllers/concept.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * All concept routes require authentication.
 */
router.use(authenticate);

/**
 * @route   GET /api/concepts/document/:documentId
 * @desc    Get all concepts extracted from a document
 * @access  Private
 */
router.get("/document/:documentId", getConceptsByDocument);

/**
 * @route   GET /api/concepts/chapter/:chapterId
 * @desc    Get all concepts belonging to a chapter
 * @access  Private
 */
router.get("/chapter/:chapterId", getConceptsByChapter);

/**
 * @route   GET /api/concepts/:conceptId/related
 * @desc    Get concepts related to a specific concept
 * @access  Private
 */
router.get("/:conceptId/related", getRelatedConcepts);

/**
 * @route   GET /api/concepts/:conceptId
 * @desc    Get details of a specific concept
 * @access  Private
 */
router.get("/:conceptId", getConceptById);

export default router;

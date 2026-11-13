
import { Router } from "express";

import {
    createRevision,
    getRevisions,
    getRevisionById,
    updateRevision,
    completeRevision,
    deleteRevision,
} from "../controllers/revision.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * All revision routes require an authenticated user.
 */
router.use(authenticate);

/**
 * @route   POST /api/revisions
 * @desc    Create a new revision task
 * @access  Private
 */
router.post("/", createRevision);

/**
 * @route   GET /api/revisions
 * @desc    Get all revision tasks belonging to the authenticated user
 * @access  Private
 */
router.get("/", getRevisions);

/**
 * @route   GET /api/revisions/:revisionId
 * @desc    Get details of a specific revision task
 * @access  Private
 */
router.get("/:revisionId", getRevisionById);

/**
 * @route   PATCH /api/revisions/:revisionId
 * @desc    Update a revision task
 * @access  Private
 */
router.patch("/:revisionId", updateRevision);

/**
 * @route   PATCH /api/revisions/:revisionId/complete
 * @desc    Mark a revision task as completed
 * @access  Private
 */
router.patch("/:revisionId/complete", completeRevision);

/**
 * @route   DELETE /api/revisions/:revisionId
 * @desc    Delete a revision task
 * @access  Private
 */
router.delete("/:revisionId", deleteRevision);

export default router;

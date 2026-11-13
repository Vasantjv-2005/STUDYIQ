
import { Router } from "express";

import {
    getDashboardAnalytics,
    getStudyStatistics,
    getLearningProgress,
    getSubjectPerformance,
    getRevisionStatistics,
} from "../controllers/analytics.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * All analytics routes require an authenticated user.
 */
router.use(authenticate);

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get the student's overall learning dashboard
 * @access  Private
 */
router.get("/dashboard", getDashboardAnalytics);

/**
 * @route   GET /api/analytics/study
 * @desc    Get study duration and activity statistics
 * @access  Private
 */
router.get("/study", getStudyStatistics);

/**
 * @route   GET /api/analytics/progress
 * @desc    Get concept mastery and learning progress
 * @access  Private
 */
router.get("/progress", getLearningProgress);

/**
 * @route   GET /api/analytics/subjects
 * @desc    Get performance statistics grouped by subject
 * @access  Private
 */
router.get("/subjects", getSubjectPerformance);

/**
 * @route   GET /api/analytics/revisions
 * @desc    Get revision completion and scheduling statistics
 * @access  Private
 */
router.get("/revisions", getRevisionStatistics);

export default router;


import { Router } from "express";

import {
    createQuestionPaper,
    getQuestionPapers,
    getQuestionPaperById,
    analyzeQuestionPaper,
    getExamInsights,
    deleteQuestionPaper,
} from "../controllers/exam.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * All exam routes require an authenticated user.
 */
router.use(authenticate);

/**
 * @route   GET /api/exams/insights
 * @desc    Get exam insights based on the user's question papers
 * @access  Private
 */
router.get("/insights", getExamInsights);

/**
 * @route   POST /api/exams/papers
 * @desc    Create a question paper record
 * @access  Private
 */
router.post("/papers", createQuestionPaper);

/**
 * @route   GET /api/exams/papers
 * @desc    Get all question papers belonging to the authenticated user
 * @access  Private
 */
router.get("/papers", getQuestionPapers);

/**
 * @route   POST /api/exams/papers/:paperId/analyze
 * @desc    Analyze a question paper and extract exam insights
 * @access  Private
 */
router.post("/papers/:paperId/analyze", analyzeQuestionPaper);

/**
 * @route   GET /api/exams/papers/:paperId
 * @desc    Get details of a specific question paper
 * @access  Private
 */
router.get("/papers/:paperId", getQuestionPaperById);

/**
 * @route   DELETE /api/exams/papers/:paperId
 * @desc    Delete a question paper record
 * @access  Private
 */
router.delete("/papers/:paperId", deleteQuestionPaper);

export default router;

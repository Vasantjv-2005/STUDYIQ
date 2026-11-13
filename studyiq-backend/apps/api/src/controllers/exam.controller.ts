import type { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { getRouteParam } from "../utils/params.js";
import {
    createQuestionPaperSchema,
    questionPaperQuerySchema,
} from "../validators/exam.validator.js";
import * as examService from "../services/exam.service.js";

/**
 * @desc   Create a question paper record
 * @route  POST /api/exams/papers
 * @access Private
 */
export const createQuestionPaper = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const validatedInput = createQuestionPaperSchema.parse(req.body);
        const paper = await examService.createPaper(
            req.user.id,
            validatedInput
        );

        ApiResponse.created(paper, "Question paper created successfully.").send(res);
    }
);

/**
 * @desc   Get all question papers belonging to the authenticated user
 * @route  GET /api/exams/papers
 * @access Private
 */
export const getQuestionPapers = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const validatedQuery = questionPaperQuerySchema.parse(req.query);
        const result = await examService.getPapers(
            req.user.id,
            validatedQuery
        );

        ApiResponse.ok(result, "Question papers retrieved successfully.").send(res);
    }
);

/**
 * @desc   Get details of a specific question paper
 * @route  GET /api/exams/papers/:paperId
 * @access Private
 */
export const getQuestionPaperById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const paperId = getRouteParam(req.params["paperId"], "paperId");
        const paper = await examService.getPaperById(req.user.id, paperId);

        ApiResponse.ok(paper, "Question paper retrieved successfully.").send(res);
    }
);

/**
 * @desc   Analyze a question paper and extract topic weightage insights
 * @route  POST /api/exams/papers/:paperId/analyze
 * @access Private
 */
export const analyzeQuestionPaper = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const paperId = getRouteParam(req.params["paperId"], "paperId");
        const analysis = await examService.analyzePaper(req.user.id, paperId);

        ApiResponse.ok(analysis, "Question paper analyzed successfully.").send(res);
    }
);

/**
 * @desc   Get exam insights across all student question papers
 * @route  GET /api/exams/insights
 * @access Private
 */
export const getExamInsights = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const insights = await examService.getExamInsights(req.user.id);
        ApiResponse.ok(insights, "Exam insights retrieved successfully.").send(res);
    }
);

/**
 * @desc   Delete a question paper record
 * @route  DELETE /api/exams/papers/:paperId
 * @access Private
 */
export const deleteQuestionPaper = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const paperId = getRouteParam(req.params["paperId"], "paperId");
        await examService.deletePaper(req.user.id, paperId);

        ApiResponse.ok(
            { message: "Question paper deleted successfully." },
            "Question paper deleted successfully."
        ).send(res);
    }
);

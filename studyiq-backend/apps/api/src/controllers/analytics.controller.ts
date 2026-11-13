import type { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import * as analyticsService from "../services/analytics.service.js";

/**
 * @desc   Get the student's overall learning dashboard
 * @route  GET /api/analytics/dashboard
 * @access Private
 */
export const getDashboardAnalytics = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const data = await analyticsService.getDashboardAnalytics(req.user.id);
        ApiResponse.ok(data, "Dashboard analytics retrieved successfully.").send(res);
    }
);

/**
 * @desc   Get study duration and activity statistics
 * @route  GET /api/analytics/study
 * @access Private
 */
export const getStudyStatistics = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const data = await analyticsService.getStudyStatistics(req.user.id);
        ApiResponse.ok(data, "Study statistics retrieved successfully.").send(res);
    }
);

/**
 * @desc   Get concept mastery and learning progress
 * @route  GET /api/analytics/progress
 * @access Private
 */
export const getLearningProgress = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const data = await analyticsService.getLearningProgress(req.user.id);
        ApiResponse.ok(data, "Learning progress retrieved successfully.").send(res);
    }
);

/**
 * @desc   Get performance statistics grouped by subject
 * @route  GET /api/analytics/subjects
 * @access Private
 */
export const getSubjectPerformance = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const data = await analyticsService.getSubjectPerformance(req.user.id);
        ApiResponse.ok(data, "Subject performance retrieved successfully.").send(res);
    }
);

/**
 * @desc   Get revision completion and scheduling statistics
 * @route  GET /api/analytics/revisions
 * @access Private
 */
export const getRevisionStatistics = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const data = await analyticsService.getRevisionStatistics(req.user.id);
        ApiResponse.ok(data, "Revision statistics retrieved successfully.").send(res);
    }
);


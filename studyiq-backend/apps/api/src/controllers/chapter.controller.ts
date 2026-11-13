import type { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { getRouteParam } from "../utils/params.js";
import * as chapterService from "../services/chapter.service.js";

/**
 * @desc   Get all chapters belonging to a document
 * @route  GET /api/chapters/document/:documentId
 * @access Private
 */
export const getChaptersByDocument = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const documentId = getRouteParam(req.params["documentId"], "documentId");
        const chapters = await chapterService.getChaptersByDocument(
            req.user.id,
            documentId
        );

        ApiResponse.ok(chapters, "Chapters retrieved successfully.").send(res);
    }
);

/**
 * @desc   Get a specific chapter by ID
 * @route  GET /api/chapters/:chapterId
 * @access Private
 */
export const getChapterById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const chapterId = getRouteParam(req.params["chapterId"], "chapterId");
        const chapter = await chapterService.getChapterById(
            req.user.id,
            chapterId
        );

        ApiResponse.ok(chapter, "Chapter retrieved successfully.").send(res);
    }
);

/**
 * @desc   Get the full text content of a chapter
 * @route  GET /api/chapters/:chapterId/content
 * @access Private
 */
export const getChapterContent = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const chapterId = getRouteParam(req.params["chapterId"], "chapterId");
        const content = await chapterService.getChapterContent(
            req.user.id,
            chapterId
        );

        ApiResponse.ok(content, "Chapter content retrieved successfully.").send(res);
    }
);

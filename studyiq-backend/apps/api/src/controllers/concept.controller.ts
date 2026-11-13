import type { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { getRouteParam } from "../utils/params.js";
import * as conceptService from "../services/concept.service.js";

/**
 * @desc   Get all concepts extracted from a document
 * @route  GET /api/concepts/document/:documentId
 * @access Private
 */
export const getConceptsByDocument = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const documentId = getRouteParam(req.params["documentId"], "documentId");
        const difficulty = typeof req.query["difficulty"] === "string" ? req.query["difficulty"] : undefined;
        const search = typeof req.query["search"] === "string" ? req.query["search"] : undefined;

        const concepts = await conceptService.getConceptsByDocument(
            req.user.id,
            documentId,
            { difficulty, search }
        );

        ApiResponse.ok(concepts, "Concepts retrieved successfully.").send(res);
    }
);

/**
 * @desc   Get all concepts belonging to a chapter
 * @route  GET /api/concepts/chapter/:chapterId
 * @access Private
 */
export const getConceptsByChapter = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const chapterId = getRouteParam(req.params["chapterId"], "chapterId");
        const concepts = await conceptService.getConceptsByChapter(
            req.user.id,
            chapterId
        );

        ApiResponse.ok(concepts, "Concepts retrieved successfully.").send(res);
    }
);

/**
 * @desc   Get details of a specific concept
 * @route  GET /api/concepts/:conceptId
 * @access Private
 */
export const getConceptById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const conceptId = getRouteParam(req.params["conceptId"], "conceptId");
        const concept = await conceptService.getConceptById(
            req.user.id,
            conceptId
        );

        ApiResponse.ok(concept, "Concept retrieved successfully.").send(res);
    }
);

/**
 * @desc   Get concepts related to a specific concept
 * @route  GET /api/concepts/:conceptId/related
 * @access Private
 */
export const getRelatedConcepts = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const conceptId = getRouteParam(req.params["conceptId"], "conceptId");
        const relatedConcepts = await conceptService.getRelatedConcepts(
            req.user.id,
            conceptId
        );

        ApiResponse.ok(relatedConcepts, "Related concepts retrieved successfully.").send(res);
    }
);

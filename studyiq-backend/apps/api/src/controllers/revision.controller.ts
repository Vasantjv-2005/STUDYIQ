import type { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { getRouteParam } from "../utils/params.js";
import {
    createRevisionSchema,
    updateRevisionSchema,
    revisionQuerySchema,
} from "../validators/revision.validator.js";
import * as revisionService from "../services/revision.service.js";

/**
 * @desc   Create a new revision task
 * @route  POST /api/revisions
 * @access Private
 */
export const createRevision = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const validatedInput = createRevisionSchema.parse(req.body);
        const revision = await revisionService.createRevision(
            req.user.id,
            validatedInput
        );

        ApiResponse.created(revision, "Revision task created successfully.").send(res);
    }
);

/**
 * @desc   Get all revision tasks belonging to the authenticated user
 * @route  GET /api/revisions
 * @access Private
 */
export const getRevisions = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const validatedQuery = revisionQuerySchema.parse(req.query);
        const result = await revisionService.getRevisions(
            req.user.id,
            validatedQuery
        );

        ApiResponse.ok(result, "Revision tasks retrieved successfully.").send(res);
    }
);

/**
 * @desc   Get details of a specific revision task
 * @route  GET /api/revisions/:revisionId
 * @access Private
 */
export const getRevisionById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const revisionId = getRouteParam(req.params["revisionId"], "revisionId");
        const revision = await revisionService.getRevisionById(
            req.user.id,
            revisionId
        );

        ApiResponse.ok(revision, "Revision task retrieved successfully.").send(res);
    }
);

/**
 * @desc   Update a revision task
 * @route  PATCH /api/revisions/:revisionId
 * @access Private
 */
export const updateRevision = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const revisionId = getRouteParam(req.params["revisionId"], "revisionId");
        const validatedInput = updateRevisionSchema.parse(req.body);

        const revision = await revisionService.updateRevision(
            req.user.id,
            revisionId,
            validatedInput
        );

        ApiResponse.ok(revision, "Revision task updated successfully.").send(res);
    }
);

/**
 * @desc   Mark a revision task as completed
 * @route  PATCH /api/revisions/:revisionId/complete
 * @access Private
 */
export const completeRevision = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const revisionId = getRouteParam(req.params["revisionId"], "revisionId");
        const revision = await revisionService.completeRevision(
            req.user.id,
            revisionId
        );

        ApiResponse.ok(revision, "Revision task completed successfully.").send(res);
    }
);

/**
 * @desc   Delete a revision task
 * @route  DELETE /api/revisions/:revisionId
 * @access Private
 */
export const deleteRevision = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const revisionId = getRouteParam(req.params["revisionId"], "revisionId");
        await revisionService.deleteRevision(req.user.id, revisionId);

        ApiResponse.ok(
            { message: "Revision task deleted successfully." },
            "Revision task deleted successfully."
        ).send(res);
    }
);


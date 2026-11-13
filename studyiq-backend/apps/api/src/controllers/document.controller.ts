import type { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { getRouteParam } from "../utils/params.js";
import {
    uploadDocumentBodySchema,
    documentQuerySchema,
} from "../validators/document.validator.js";
import * as documentService from "../services/document.service.js";

/**
 * @desc   Upload a textbook PDF document
 * @route  POST /api/documents
 * @access Private
 */
export const uploadDocument = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        if (!req.file) {
            throw ApiError.badRequest("Please attach a PDF document.");
        }

        const validatedInput = uploadDocumentBodySchema.parse(req.body);
        const result = await documentService.createDocument(
            req.user.id,
            req.file,
            validatedInput
        );

        ApiResponse.created(result, "Document uploaded successfully.").send(res);
    }
);

/**
 * @desc   Get all documents belonging to the authenticated user
 * @route  GET /api/documents
 * @access Private
 */
export const getDocuments = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const validatedQuery = documentQuerySchema.parse(req.query);
        const result = await documentService.getDocuments(
            req.user.id,
            validatedQuery
        );

        ApiResponse.ok(result, "Documents retrieved successfully.").send(res);
    }
);

/**
 * @desc   Get a specific document by ID
 * @route  GET /api/documents/:documentId
 * @access Private
 */
export const getDocumentById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const documentId = getRouteParam(req.params["documentId"], "documentId");
        const result = await documentService.getDocumentById(
            req.user.id,
            documentId
        );

        ApiResponse.ok(result, "Document retrieved successfully.").send(res);
    }
);

/**
 * @desc   Get document processing status
 * @route  GET /api/documents/:documentId/status
 * @access Private
 */
export const getDocumentProcessingStatus = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const documentId = getRouteParam(req.params["documentId"], "documentId");
        const result = await documentService.getDocumentProcessingStatus(
            req.user.id,
            documentId
        );

        ApiResponse.ok(result, "Document status retrieved successfully.").send(res);
    }
);

/**
 * @desc   Delete a document and related resources
 * @route  DELETE /api/documents/:documentId
 * @access Private
 */
export const deleteDocument = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const documentId = getRouteParam(req.params["documentId"], "documentId");
        await documentService.deleteDocument(req.user.id, documentId);

        ApiResponse.ok(
            { message: "Document deleted successfully." },
            "Document deleted successfully."
        ).send(res);
    }
);

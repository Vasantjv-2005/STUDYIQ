
import { Router } from "express";

import {
    uploadDocument,
    getDocuments,
    getDocumentById,
    getDocumentProcessingStatus,
    deleteDocument,
} from "../controllers/document.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { uploadDocumentFile } from "../middlewares/upload.middleware.js";

const router = Router();

/**
 * All document routes require an authenticated user.
 */
router.use(authenticate);

/**
 * @route   POST /api/documents
 * @desc    Upload a textbook PDF
 * @access  Private
 * @middleware uploadDocumentFile
 */
router.post("/", uploadDocumentFile, uploadDocument);

/**
 * @route   GET /api/documents
 * @desc    Get all documents belonging to the authenticated user
 * @access  Private
 */
router.get("/", getDocuments);

/**
 * @route   GET /api/documents/:documentId/status
 * @desc    Get document processing status
 * @access  Private
 */
router.get("/:documentId/status", getDocumentProcessingStatus);

/**
 * @route   GET /api/documents/:documentId
 * @desc    Get a specific document
 * @access  Private
 */
router.get("/:documentId", getDocumentById);

/**
 * @route   DELETE /api/documents/:documentId
 * @desc    Delete a document
 * @access  Private
 */
router.delete("/:documentId", deleteDocument);

export default router;

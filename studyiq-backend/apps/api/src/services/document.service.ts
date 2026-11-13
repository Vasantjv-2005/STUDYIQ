import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";

import DocumentModel, { type IDocument } from "../models/Document.model.js";
import Chapter from "../models/Chapter.model.js";
import Concept from "../models/Concept.model.js";
import { ApiError } from "../utils/ApiError.js";
import { formatPaginatedResponse } from "../utils/pagination.js";
import type { DocumentResponse, DocumentStatusResponse } from "../types/document.types.js";
import type { UploadDocumentBodyInput, DocumentQueryInput } from "../validators/document.validator.js";
import type { PaginatedResponseData } from "../types/api.types.js";

export const formatDocumentResponse = (doc: IDocument): DocumentResponse => {
    return {
        id: doc._id.toString(),
        user: doc.user.toString(),
        title: doc.title,
        originalFileName: doc.originalFileName,
        fileUrl: doc.fileUrl,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        pageCount: doc.pageCount,
        description: doc.description,
        subject: doc.subject,
        status: doc.status,
        processingError: doc.processingError,
        uploadedAt: doc.uploadedAt,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
};

export const createDocument = async (
    userId: string,
    file: Express.Multer.File,
    input: UploadDocumentBodyInput
): Promise<DocumentResponse> => {
    const rawTitle = input.title?.trim();
    const defaultTitle = path.parse(file.originalname).name;
    const title = rawTitle && rawTitle.length > 0 ? rawTitle : defaultTitle;

    const document = new DocumentModel({
        user: new mongoose.Types.ObjectId(userId),
        title,
        originalFileName: file.originalname,
        fileUrl: file.path,
        fileType: "application/pdf",
        fileSize: file.size,
        pageCount: 0,
        description: input.description,
        subject: input.subject,
        status: "uploaded",
        uploadedAt: new Date(),
    });

    await document.save();

    return formatDocumentResponse(document);
};

export const getDocuments = async (
    userId: string,
    query: DocumentQueryInput
): Promise<PaginatedResponseData<DocumentResponse>> => {
    const filter: Record<string, unknown> = {
        user: new mongoose.Types.ObjectId(userId),
    };

    if (query.status) {
        filter["status"] = query.status;
    }

    if (query.subject) {
        filter["subject"] = { $regex: query.subject, $options: "i" };
    }

    if (query.search) {
        filter["title"] = { $regex: query.search, $options: "i" };
    }

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
        DocumentModel.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(query.limit)
            .lean<IDocument[]>()
            .exec(),
        DocumentModel.countDocuments(filter).exec(),
    ]);

    const formattedItems = items.map((doc) => ({
        id: doc._id.toString(),
        user: doc.user.toString(),
        title: doc.title,
        originalFileName: doc.originalFileName,
        fileUrl: doc.fileUrl,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        pageCount: doc.pageCount,
        description: doc.description,
        subject: doc.subject,
        status: doc.status,
        processingError: doc.processingError,
        uploadedAt: doc.uploadedAt,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    }));

    return formatPaginatedResponse(formattedItems, total, query.page, query.limit);
};

export const getDocumentById = async (
    userId: string,
    documentId: string
): Promise<DocumentResponse> => {
    if (!mongoose.isValidObjectId(documentId)) {
        throw ApiError.badRequest("Invalid document ID format.");
    }

    const document = await DocumentModel.findOne({
        _id: documentId,
        user: userId,
    })
        .lean<IDocument>()
        .exec();

    if (!document) {
        throw ApiError.notFound("Textbook document not found or access denied.");
    }

    return {
        id: document._id.toString(),
        user: document.user.toString(),
        title: document.title,
        originalFileName: document.originalFileName,
        fileUrl: document.fileUrl,
        fileType: document.fileType,
        fileSize: document.fileSize,
        pageCount: document.pageCount,
        description: document.description,
        subject: document.subject,
        status: document.status,
        processingError: document.processingError,
        uploadedAt: document.uploadedAt,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
    };
};

export const getDocumentProcessingStatus = async (
    userId: string,
    documentId: string
): Promise<DocumentStatusResponse> => {
    if (!mongoose.isValidObjectId(documentId)) {
        throw ApiError.badRequest("Invalid document ID format.");
    }

    const document = await DocumentModel.findOne(
        { _id: documentId, user: userId },
        { status: 1, pageCount: 1, processingError: 1, updatedAt: 1 }
    )
        .lean<IDocument>()
        .exec();

    if (!document) {
        throw ApiError.notFound("Document not found or access denied.");
    }

    return {
        documentId: document._id.toString(),
        status: document.status,
        pageCount: document.pageCount,
        processingError: document.processingError,
        updatedAt: document.updatedAt,
    };
};

export const deleteDocument = async (
    userId: string,
    documentId: string
): Promise<void> => {
    if (!mongoose.isValidObjectId(documentId)) {
        throw ApiError.badRequest("Invalid document ID format.");
    }

    const document = await DocumentModel.findOneAndDelete({
        _id: documentId,
        user: userId,
    }).exec();

    if (!document) {
        throw ApiError.notFound("Document not found or access denied.");
    }

    // Safely remove the physical file from disk
    if (document.fileUrl) {
        await fs.promises.unlink(document.fileUrl).catch(() => undefined);
    }

    // Cascade delete extracted chapters and concepts owned by this user
    await Promise.all([
        Chapter.deleteMany({ document: document._id, user: userId }).exec(),
        Concept.deleteMany({ document: document._id, user: userId }).exec(),
    ]);
};

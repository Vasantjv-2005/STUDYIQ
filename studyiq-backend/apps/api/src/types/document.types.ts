import type { DocumentStatus } from "../models/Document.model.js";

export interface DocumentResponse {
    id: string;
    user: string;
    title: string;
    originalFileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    pageCount: number;
    description?: string;
    subject?: string;
    status: DocumentStatus;
    processingError?: string;
    uploadedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface DocumentStatusResponse {
    documentId: string;
    status: DocumentStatus;
    pageCount: number;
    processingError?: string;
    updatedAt: Date;
}


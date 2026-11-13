import mongoose from "mongoose";

import Chapter, { type IChapter } from "../models/Chapter.model.js";
import DocumentModel from "../models/Document.model.js";
import { ApiError } from "../utils/ApiError.js";

export interface ChapterSummaryResponse {
    id: string;
    documentId: string;
    title: string;
    chapterNumber: number;
    summary?: string;
    startPage: number;
    endPage: number;
    wordCount: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ChapterContentResponse {
    id: string;
    documentId: string;
    title: string;
    chapterNumber: number;
    content: string;
    summary?: string;
    startPage: number;
    endPage: number;
    wordCount: number;
    status: string;
}

export const getChaptersByDocument = async (
    userId: string,
    documentId: string
): Promise<ChapterSummaryResponse[]> => {
    if (!mongoose.isValidObjectId(documentId)) {
        throw ApiError.badRequest("Invalid document ID format.");
    }

    // Verify document belongs to student
    const documentExists = await DocumentModel.exists({
        _id: documentId,
        user: userId,
    });

    if (!documentExists) {
        throw ApiError.notFound("Textbook document not found or access denied.");
    }

    const chapters = await Chapter.find({
        document: documentId,
        user: userId,
    })
        .select("-content")
        .sort({ chapterNumber: 1 })
        .lean<IChapter[]>()
        .exec();

    return chapters.map((ch) => ({
        id: ch._id.toString(),
        documentId: ch.document.toString(),
        title: ch.title,
        chapterNumber: ch.chapterNumber,
        summary: ch.summary,
        startPage: ch.startPage,
        endPage: ch.endPage,
        wordCount: ch.wordCount,
        status: ch.status,
        createdAt: ch.createdAt,
        updatedAt: ch.updatedAt,
    }));
};

export const getChapterById = async (
    userId: string,
    chapterId: string
): Promise<ChapterSummaryResponse> => {
    if (!mongoose.isValidObjectId(chapterId)) {
        throw ApiError.badRequest("Invalid chapter ID format.");
    }

    const chapter = await Chapter.findOne({
        _id: chapterId,
        user: userId,
    })
        .select("-content")
        .lean<IChapter>()
        .exec();

    if (!chapter) {
        throw ApiError.notFound("Chapter not found or access denied.");
    }

    return {
        id: chapter._id.toString(),
        documentId: chapter.document.toString(),
        title: chapter.title,
        chapterNumber: chapter.chapterNumber,
        summary: chapter.summary,
        startPage: chapter.startPage,
        endPage: chapter.endPage,
        wordCount: chapter.wordCount,
        status: chapter.status,
        createdAt: chapter.createdAt,
        updatedAt: chapter.updatedAt,
    };
};

export const getChapterContent = async (
    userId: string,
    chapterId: string
): Promise<ChapterContentResponse> => {
    if (!mongoose.isValidObjectId(chapterId)) {
        throw ApiError.badRequest("Invalid chapter ID format.");
    }

    const chapter = await Chapter.findOne({
        _id: chapterId,
        user: userId,
    })
        .lean<IChapter>()
        .exec();

    if (!chapter) {
        throw ApiError.notFound("Chapter not found or access denied.");
    }

    return {
        id: chapter._id.toString(),
        documentId: chapter.document.toString(),
        title: chapter.title,
        chapterNumber: chapter.chapterNumber,
        content: chapter.content,
        summary: chapter.summary,
        startPage: chapter.startPage,
        endPage: chapter.endPage,
        wordCount: chapter.wordCount,
        status: chapter.status,
    };
};


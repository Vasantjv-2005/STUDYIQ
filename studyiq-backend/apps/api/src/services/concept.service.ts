import mongoose from "mongoose";

import Concept, { type IConcept } from "../models/Concept.model.js";
import DocumentModel from "../models/Document.model.js";
import Chapter from "../models/Chapter.model.js";
import { ApiError } from "../utils/ApiError.js";

export interface ConceptResponse {
    id: string;
    documentId: string;
    chapterId: string;
    title: string;
    description: string;
    explanation?: string;
    difficulty: string;
    keywords: string[];
    relatedConcepts?: unknown[];
    pageReferences: number[];
    createdAt: Date;
    updatedAt: Date;
}

export const getConceptsByDocument = async (
    userId: string,
    documentId: string,
    query?: { difficulty?: string; search?: string }
): Promise<ConceptResponse[]> => {
    if (!mongoose.isValidObjectId(documentId)) {
        throw ApiError.badRequest("Invalid document ID format.");
    }

    const documentExists = await DocumentModel.exists({
        _id: documentId,
        user: userId,
    });

    if (!documentExists) {
        throw ApiError.notFound("Textbook document not found or access denied.");
    }

    const filter: Record<string, unknown> = {
        document: documentId,
        user: userId,
    };

    if (query?.difficulty) {
        filter["difficulty"] = query.difficulty;
    }

    if (query?.search) {
        filter["title"] = { $regex: query.search, $options: "i" };
    }

    const concepts = await Concept.find(filter)
        .sort({ title: 1 })
        .lean<IConcept[]>()
        .exec();

    return concepts.map((c) => ({
        id: c._id.toString(),
        documentId: c.document.toString(),
        chapterId: c.chapter.toString(),
        title: c.title,
        description: c.description,
        explanation: c.explanation,
        difficulty: c.difficulty,
        keywords: c.keywords,
        pageReferences: c.pageReferences,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
    }));
};

export const getConceptsByChapter = async (
    userId: string,
    chapterId: string
): Promise<ConceptResponse[]> => {
    if (!mongoose.isValidObjectId(chapterId)) {
        throw ApiError.badRequest("Invalid chapter ID format.");
    }

    const chapterExists = await Chapter.exists({
        _id: chapterId,
        user: userId,
    });

    if (!chapterExists) {
        throw ApiError.notFound("Chapter not found or access denied.");
    }

    const concepts = await Concept.find({
        chapter: chapterId,
        user: userId,
    })
        .sort({ title: 1 })
        .lean<IConcept[]>()
        .exec();

    return concepts.map((c) => ({
        id: c._id.toString(),
        documentId: c.document.toString(),
        chapterId: c.chapter.toString(),
        title: c.title,
        description: c.description,
        explanation: c.explanation,
        difficulty: c.difficulty,
        keywords: c.keywords,
        pageReferences: c.pageReferences,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
    }));
};

export const getConceptById = async (
    userId: string,
    conceptId: string
): Promise<ConceptResponse> => {
    if (!mongoose.isValidObjectId(conceptId)) {
        throw ApiError.badRequest("Invalid concept ID format.");
    }

    const concept = await Concept.findOne({
        _id: conceptId,
        user: userId,
    })
        .populate("relatedConcepts", "_id title difficulty")
        .lean<IConcept>()
        .exec();

    if (!concept) {
        throw ApiError.notFound("Concept not found or access denied.");
    }

    return {
        id: concept._id.toString(),
        documentId: concept.document.toString(),
        chapterId: concept.chapter.toString(),
        title: concept.title,
        description: concept.description,
        explanation: concept.explanation,
        difficulty: concept.difficulty,
        keywords: concept.keywords,
        relatedConcepts: concept.relatedConcepts,
        pageReferences: concept.pageReferences,
        createdAt: concept.createdAt,
        updatedAt: concept.updatedAt,
    };
};

export const getRelatedConcepts = async (
    userId: string,
    conceptId: string
): Promise<unknown[]> => {
    if (!mongoose.isValidObjectId(conceptId)) {
        throw ApiError.badRequest("Invalid concept ID format.");
    }

    const concept = await Concept.findOne({
        _id: conceptId,
        user: userId,
    })
        .populate("relatedConcepts", "_id title description difficulty keywords")
        .lean<IConcept>()
        .exec();

    if (!concept) {
        throw ApiError.notFound("Concept not found or access denied.");
    }

    return concept.relatedConcepts || [];
};

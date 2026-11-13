import mongoose from "mongoose";

import Revision, { type IRevision } from "../models/Revision.model.js";
import DocumentModel from "../models/Document.model.js";
import Chapter from "../models/Chapter.model.js";
import Concept from "../models/Concept.model.js";
import LearningProgress from "../models/LearningProgress.model.js";
import { ApiError } from "../utils/ApiError.js";
import { formatPaginatedResponse } from "../utils/pagination.js";
import type {
    CreateRevisionInput,
    UpdateRevisionInput,
    RevisionQueryInput,
} from "../validators/revision.validator.js";
import type { PaginatedResponseData } from "../types/api.types.js";

/**
 * Calculates next spaced repetition date based on revision repetition cycle.
 */
const calculateNextRevisionDate = (revisionCount: number, fromDate: Date = new Date()): Date => {
    const nextDate = new Date(fromDate);
    let daysToAdd = 1;

    switch (revisionCount) {
        case 1:
            daysToAdd = 1;
            break;
        case 2:
            daysToAdd = 3;
            break;
        case 3:
            daysToAdd = 7;
            break;
        case 4:
            daysToAdd = 14;
            break;
        default:
            daysToAdd = 30;
            break;
    }

    nextDate.setDate(nextDate.getDate() + daysToAdd);
    return nextDate;
};

export const createRevision = async (
    userId: string,
    input: CreateRevisionInput
): Promise<IRevision> => {
    let docId: mongoose.Types.ObjectId | undefined = undefined;
    let chapId: mongoose.Types.ObjectId | undefined = undefined;
    let concId: mongoose.Types.ObjectId | undefined = undefined;

    if (input.document) {
        if (!mongoose.isValidObjectId(input.document)) {
            throw ApiError.badRequest("Invalid document ID format.");
        }
        const exists = await DocumentModel.exists({ _id: input.document, user: userId });
        if (!exists) throw ApiError.notFound("Document not found or access denied.");
        docId = new mongoose.Types.ObjectId(input.document);
    }

    if (input.chapter) {
        if (!mongoose.isValidObjectId(input.chapter)) {
            throw ApiError.badRequest("Invalid chapter ID format.");
        }
        const exists = await Chapter.exists({ _id: input.chapter, user: userId });
        if (!exists) throw ApiError.notFound("Chapter not found or access denied.");
        chapId = new mongoose.Types.ObjectId(input.chapter);
    }

    if (input.concept) {
        if (!mongoose.isValidObjectId(input.concept)) {
            throw ApiError.badRequest("Invalid concept ID format.");
        }
        const exists = await Concept.exists({ _id: input.concept, user: userId });
        if (!exists) throw ApiError.notFound("Concept not found or access denied.");
        concId = new mongoose.Types.ObjectId(input.concept);
    }

    const revision = new Revision({
        user: new mongoose.Types.ObjectId(userId),
        document: docId,
        chapter: chapId,
        concept: concId,
        title: input.title,
        notes: input.notes,
        scheduledAt: input.scheduledAt,
        status: "pending",
        revisionCount: 0,
    });

    await revision.save();
    return revision;
};

export const getRevisions = async (
    userId: string,
    query: RevisionQueryInput
): Promise<PaginatedResponseData<IRevision>> => {
    const filter: Record<string, unknown> = {
        user: new mongoose.Types.ObjectId(userId),
    };

    if (query.status) {
        filter["status"] = query.status;
    }

    if (query.from || query.to) {
        const dateFilter: Record<string, Date> = {};
        if (query.from) dateFilter["$gte"] = query.from;
        if (query.to) dateFilter["$lte"] = query.to;
        filter["scheduledAt"] = dateFilter;
    }

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
        Revision.find(filter)
            .sort({ scheduledAt: 1 })
            .skip(skip)
            .limit(query.limit)
            .populate("document", "title")
            .populate("chapter", "chapterNumber title")
            .populate("concept", "title difficulty")
            .lean<IRevision[]>()
            .exec(),
        Revision.countDocuments(filter).exec(),
    ]);

    return formatPaginatedResponse(items, total, query.page, query.limit);
};

export const getRevisionById = async (
    userId: string,
    revisionId: string
): Promise<IRevision> => {
    if (!mongoose.isValidObjectId(revisionId)) {
        throw ApiError.badRequest("Invalid revision ID format.");
    }

    const revision = await Revision.findOne({
        _id: revisionId,
        user: userId,
    })
        .populate("document", "title")
        .populate("chapter", "chapterNumber title")
        .populate("concept", "title difficulty")
        .lean<IRevision>()
        .exec();

    if (!revision) {
        throw ApiError.notFound("Revision task not found or access denied.");
    }

    return revision;
};

export const updateRevision = async (
    userId: string,
    revisionId: string,
    input: UpdateRevisionInput
): Promise<IRevision> => {
    if (!mongoose.isValidObjectId(revisionId)) {
        throw ApiError.badRequest("Invalid revision ID format.");
    }

    const revision = await Revision.findOne({
        _id: revisionId,
        user: userId,
    });

    if (!revision) {
        throw ApiError.notFound("Revision task not found or access denied.");
    }

    if (input.title !== undefined) revision.title = input.title;
    if (input.notes !== undefined) revision.notes = input.notes;
    if (input.scheduledAt !== undefined) revision.scheduledAt = input.scheduledAt;
    if (input.status !== undefined) revision.status = input.status;

    await revision.save();
    return revision;
};

export const completeRevision = async (
    userId: string,
    revisionId: string
): Promise<IRevision> => {
    if (!mongoose.isValidObjectId(revisionId)) {
        throw ApiError.badRequest("Invalid revision ID format.");
    }

    const revision = await Revision.findOne({
        _id: revisionId,
        user: userId,
    });

    if (!revision) {
        throw ApiError.notFound("Revision task not found or access denied.");
    }

    const now = new Date();
    const newCount = revision.revisionCount + 1;
    const nextRevisionDate = calculateNextRevisionDate(newCount, now);

    revision.status = "completed";
    revision.completedAt = now;
    revision.revisionCount = newCount;
    revision.nextRevisionAt = nextRevisionDate;

    await revision.save();

    // Advance learning progress if attached to a concept
    if (revision.concept) {
        const concept = await Concept.findById(revision.concept).lean().exec();
        if (concept) {
            let progress = await LearningProgress.findOne({
                user: userId,
                concept: revision.concept,
            });

            if (!progress) {
                progress = new LearningProgress({
                    user: new mongoose.Types.ObjectId(userId),
                    document: revision.document,
                    chapter: revision.chapter,
                    concept: revision.concept,
                    topic: concept.title,
                    masteryLevel: "beginner",
                    totalAttempts: 1,
                    correctAttempts: 1,
                    accuracy: 100,
                    timeSpentSeconds: 600,
                    lastStudiedAt: now,
                });
            } else {
                progress.totalAttempts += 1;
                progress.correctAttempts += 1;
                progress.accuracy = Math.round(
                    (progress.correctAttempts / progress.totalAttempts) * 100
                );
                progress.lastStudiedAt = now;

                if (newCount >= 4) {
                    progress.masteryLevel = "mastered";
                    progress.masteredAt = now;
                } else if (newCount >= 2) {
                    progress.masteryLevel = "intermediate";
                }
            }

            await progress.save();
        }
    }

    return revision;
};

export const deleteRevision = async (
    userId: string,
    revisionId: string
): Promise<void> => {
    if (!mongoose.isValidObjectId(revisionId)) {
        throw ApiError.badRequest("Invalid revision ID format.");
    }

    const revision = await Revision.findOneAndDelete({
        _id: revisionId,
        user: userId,
    });

    if (!revision) {
        throw ApiError.notFound("Revision task not found or access denied.");
    }
};


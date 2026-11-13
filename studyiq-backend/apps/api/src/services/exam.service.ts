import mongoose from "mongoose";

import QuestionPaper, { type IQuestionPaper } from "../models/QuestionPaper.model.js";
import DocumentModel from "../models/Document.model.js";
import { ApiError } from "../utils/ApiError.js";
import { formatPaginatedResponse } from "../utils/pagination.js";
import type {
    CreateQuestionPaperInput,
    QuestionPaperQueryInput,
} from "../validators/exam.validator.js";
import type { PaginatedResponseData } from "../types/api.types.js";

export interface ExamInsightsResponse {
    totalPapers: number;
    totalQuestions: number;
    subjects: Array<{ subject: string; count: number }>;
    topTopics: Array<{ topic: string; frequency: number; totalMarks: number }>;
    yearlyDistribution: Array<{ year: number; count: number }>;
}

export interface PaperAnalysisResult {
    paperId: string;
    title: string;
    subject: string;
    totalQuestions: number;
    totalMarksCalculated: number;
    topicBreakdown: Array<{
        topic: string;
        questionCount: number;
        totalMarks: number;
        percentage: number;
    }>;
    recommendedFocusAreas: string[];
}

export const createPaper = async (
    userId: string,
    input: CreateQuestionPaperInput
): Promise<IQuestionPaper> => {
    let docId: mongoose.Types.ObjectId | undefined = undefined;

    if (input.document) {
        if (!mongoose.isValidObjectId(input.document)) {
            throw ApiError.badRequest("Invalid document ID format.");
        }

        const docExists = await DocumentModel.exists({
            _id: input.document,
            user: userId,
        });

        if (!docExists) {
            throw ApiError.notFound("Textbook document not found or access denied.");
        }

        docId = new mongoose.Types.ObjectId(input.document);
    }

    const questions = input.questions.map((q) => ({
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        marks: q.marks,
        topic: q.topic,
        chapter: q.chapter && mongoose.isValidObjectId(q.chapter)
            ? new mongoose.Types.ObjectId(q.chapter)
            : undefined,
        pageNumber: q.pageNumber,
    }));

    const paper = new QuestionPaper({
        user: new mongoose.Types.ObjectId(userId),
        document: docId,
        title: input.title,
        subject: input.subject,
        university: input.university,
        course: input.course,
        semester: input.semester,
        examYear: input.examYear,
        examType: input.examType,
        totalMarks: input.totalMarks,
        durationMinutes: input.durationMinutes,
        questions,
        status: "completed",
    });

    await paper.save();
    return paper;
};

export const getPapers = async (
    userId: string,
    query: QuestionPaperQueryInput
): Promise<PaginatedResponseData<IQuestionPaper>> => {
    const filter: Record<string, unknown> = {
        user: new mongoose.Types.ObjectId(userId),
    };

    if (query.subject) {
        filter["subject"] = { $regex: query.subject, $options: "i" };
    }

    if (query.examYear) {
        filter["examYear"] = query.examYear;
    }

    if (query.status) {
        filter["status"] = query.status;
    }

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
        QuestionPaper.find(filter)
            .sort({ examYear: -1, createdAt: -1 })
            .skip(skip)
            .limit(query.limit)
            .lean<IQuestionPaper[]>()
            .exec(),
        QuestionPaper.countDocuments(filter).exec(),
    ]);

    return formatPaginatedResponse(items, total, query.page, query.limit);
};

export const getPaperById = async (
    userId: string,
    paperId: string
): Promise<IQuestionPaper> => {
    if (!mongoose.isValidObjectId(paperId)) {
        throw ApiError.badRequest("Invalid question paper ID format.");
    }

    const paper = await QuestionPaper.findOne({
        _id: paperId,
        user: userId,
    })
        .lean<IQuestionPaper>()
        .exec();

    if (!paper) {
        throw ApiError.notFound("Question paper not found or access denied.");
    }

    return paper;
};

export const analyzePaper = async (
    userId: string,
    paperId: string
): Promise<PaperAnalysisResult> => {
    if (!mongoose.isValidObjectId(paperId)) {
        throw ApiError.badRequest("Invalid question paper ID format.");
    }

    const paper = await QuestionPaper.findOne({
        _id: paperId,
        user: userId,
    }).lean<IQuestionPaper>().exec();

    if (!paper) {
        throw ApiError.notFound("Question paper not found or access denied.");
    }

    const topicMap: Record<string, { count: number; marks: number }> = {};
    let totalMarksCalculated = 0;

    for (const q of paper.questions) {
        const topic = q.topic?.trim() || "General / Uncategorized";
        const marks = q.marks || 0;
        totalMarksCalculated += marks;

        if (!topicMap[topic]) {
            topicMap[topic] = { count: 0, marks: 0 };
        }
        topicMap[topic].count += 1;
        topicMap[topic].marks += marks;
    }

    const topicBreakdown = Object.entries(topicMap).map(([topic, data]) => ({
        topic,
        questionCount: data.count,
        totalMarks: data.marks,
        percentage:
            totalMarksCalculated > 0
                ? Math.round((data.marks / totalMarksCalculated) * 100)
                : 0,
    })).sort((a, b) => b.totalMarks - a.totalMarks);

    // Recommended focus areas are top weighted topics
    const recommendedFocusAreas = topicBreakdown
        .slice(0, 3)
        .map((t) => t.topic);

    return {
        paperId: paper._id.toString(),
        title: paper.title,
        subject: paper.subject,
        totalQuestions: paper.questions.length,
        totalMarksCalculated,
        topicBreakdown,
        recommendedFocusAreas,
    };
};

export const getExamInsights = async (
    userId: string
): Promise<ExamInsightsResponse> => {
    const papers = await QuestionPaper.find({
        user: new mongoose.Types.ObjectId(userId),
    })
        .lean<IQuestionPaper[]>()
        .exec();

    if (papers.length === 0) {
        return {
            totalPapers: 0,
            totalQuestions: 0,
            subjects: [],
            topTopics: [],
            yearlyDistribution: [],
        };
    }

    let totalQuestions = 0;
    const subjectCounts: Record<string, number> = {};
    const topicStats: Record<string, { frequency: number; totalMarks: number }> = {};
    const yearlyMap: Record<number, number> = {};

    for (const paper of papers) {
        totalQuestions += paper.questions.length;

        subjectCounts[paper.subject] = (subjectCounts[paper.subject] || 0) + 1;

        if (paper.examYear) {
            yearlyMap[paper.examYear] = (yearlyMap[paper.examYear] || 0) + 1;
        }

        for (const q of paper.questions) {
            const topic = q.topic?.trim() || "General / Uncategorized";
            if (!topicStats[topic]) {
                topicStats[topic] = { frequency: 0, totalMarks: 0 };
            }
            topicStats[topic].frequency += 1;
            topicStats[topic].totalMarks += q.marks || 0;
        }
    }

    const subjects = Object.entries(subjectCounts).map(([subject, count]) => ({
        subject,
        count,
    })).sort((a, b) => b.count - a.count);

    const topTopics = Object.entries(topicStats).map(([topic, stats]) => ({
        topic,
        frequency: stats.frequency,
        totalMarks: stats.totalMarks,
    })).sort((a, b) => b.frequency - a.frequency).slice(0, 10);

    const yearlyDistribution = Object.entries(yearlyMap).map(([yearStr, count]) => ({
        year: parseInt(yearStr, 10),
        count,
    })).sort((a, b) => b.year - a.year);

    return {
        totalPapers: papers.length,
        totalQuestions,
        subjects,
        topTopics,
        yearlyDistribution,
    };
};

export const deletePaper = async (
    userId: string,
    paperId: string
): Promise<void> => {
    if (!mongoose.isValidObjectId(paperId)) {
        throw ApiError.badRequest("Invalid question paper ID format.");
    }

    const paper = await QuestionPaper.findOneAndDelete({
        _id: paperId,
        user: userId,
    });

    if (!paper) {
        throw ApiError.notFound("Question paper not found or access denied.");
    }
};


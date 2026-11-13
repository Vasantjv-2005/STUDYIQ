import mongoose from "mongoose";

import DocumentModel from "../models/Document.model.js";
import StudyPlan from "../models/StudyPlan.model.js";
import StudySession, { type IStudySession } from "../models/StudySession.model.js";
import Revision, { type IRevision } from "../models/Revision.model.js";
import LearningProgress, { type ILearningProgress } from "../models/LearningProgress.model.js";
import QuestionPaper from "../models/QuestionPaper.model.js";

export interface DashboardAnalyticsResponse {
    overview: {
        totalDocuments: number;
        totalPlans: number;
        activeTasks: number;
        totalStudyMinutes: number;
        overallAccuracy: number;
    };
    revisions: {
        dueToday: number;
        upcoming: number;
        completed: number;
    };
    recentActivity: {
        documents: number;
        sessionsCount: number;
    };
}

export interface StudyStatisticsResponse {
    totalDurationSeconds: number;
    totalDurationMinutes: number;
    totalDurationHours: number;
    totalSessions: number;
    averageSessionMinutes: number;
    dailyBreakdown: Array<{ date: string; minutes: number }>;
}

export interface LearningProgressResponse {
    totalTopicsTracked: number;
    overallAccuracy: number;
    totalTimeSpentMinutes: number;
    masteryDistribution: {
        not_started: number;
        beginner: number;
        intermediate: number;
        advanced: number;
        mastered: number;
    };
    topMasteredTopics: Array<{ topic: string; masteryLevel: string; accuracy: number }>;
    topicsNeedingReview: Array<{ topic: string; masteryLevel: string; accuracy: number }>;
}

export interface SubjectPerformanceResponse {
    subjects: Array<{
        subject: string;
        studyMinutes: number;
        documentCount: number;
        questionPaperCount: number;
        taskCount: number;
    }>;
}

export interface RevisionStatisticsResponse {
    totalRevisions: number;
    completedRevisions: number;
    pendingRevisions: number;
    overdueRevisions: number;
    scheduledToday: number;
    completionRatePercentage: number;
    averageRepetitionCount: number;
}

export const getDashboardAnalytics = async (
    userId: string
): Promise<DashboardAnalyticsResponse> => {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [
        totalDocuments,
        plans,
        studySessions,
        progressList,
        dueTodayRevisions,
        upcomingRevisions,
        completedRevisions,
    ] = await Promise.all([
        DocumentModel.countDocuments({ user: userObjectId }),
        StudyPlan.find({ user: userObjectId, status: "active" }).lean(),
        StudySession.find({ user: userObjectId, status: "completed" }).lean<IStudySession[]>(),
        LearningProgress.find({ user: userObjectId }).lean<ILearningProgress[]>(),
        Revision.countDocuments({
            user: userObjectId,
            status: "pending",
            scheduledAt: { $gte: startOfToday, $lte: endOfToday },
        }),
        Revision.countDocuments({
            user: userObjectId,
            status: "pending",
            scheduledAt: { $gt: endOfToday },
        }),
        Revision.countDocuments({
            user: userObjectId,
            status: "completed",
        }),
    ]);

    let activeTasks = 0;
    for (const plan of plans) {
        activeTasks += plan.tasks.filter((t) => t.status !== "completed").length;
    }

    const totalSeconds = studySessions.reduce(
        (sum, s) => sum + (s.durationSeconds || 0),
        0
    );
    const totalStudyMinutes = Math.round(totalSeconds / 60);

    const accuracySum = progressList.reduce(
        (sum, p) => sum + (p.accuracy || 0),
        0
    );
    const overallAccuracy =
        progressList.length > 0 ? Math.round(accuracySum / progressList.length) : 0;

    return {
        overview: {
            totalDocuments,
            totalPlans: plans.length,
            activeTasks,
            totalStudyMinutes,
            overallAccuracy,
        },
        revisions: {
            dueToday: dueTodayRevisions,
            upcoming: upcomingRevisions,
            completed: completedRevisions,
        },
        recentActivity: {
            documents: totalDocuments,
            sessionsCount: studySessions.length,
        },
    };
};

export const getStudyStatistics = async (
    userId: string
): Promise<StudyStatisticsResponse> => {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const sessions = await StudySession.find({
        user: userObjectId,
        status: "completed",
    })
        .sort({ startedAt: 1 })
        .lean<IStudySession[]>()
        .exec();

    const totalDurationSeconds = sessions.reduce(
        (sum, s) => sum + (s.durationSeconds || 0),
        0
    );
    const totalDurationMinutes = Math.round(totalDurationSeconds / 60);
    const totalDurationHours = Number((totalDurationMinutes / 60).toFixed(1));
    const totalSessions = sessions.length;
    const averageSessionMinutes =
        totalSessions > 0 ? Math.round(totalDurationMinutes / totalSessions) : 0;

    // Daily breakdown for the last 7 days
    const dailyMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split("T")[0] || "";
        dailyMap[key] = 0;
    }

    for (const session of sessions) {
        if (session.startedAt) {
            const dayKey = session.startedAt.toISOString().split("T")[0] || "";
            if (dailyMap[dayKey] !== undefined) {
                dailyMap[dayKey] = (dailyMap[dayKey] || 0) + Math.round((session.durationSeconds || 0) / 60);
            }
        }
    }

    const dailyBreakdown = Object.entries(dailyMap).map(([date, minutes]) => ({
        date,
        minutes,
    }));

    return {
        totalDurationSeconds,
        totalDurationMinutes,
        totalDurationHours,
        totalSessions,
        averageSessionMinutes,
        dailyBreakdown,
    };
};

export const getLearningProgress = async (
    userId: string
): Promise<LearningProgressResponse> => {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const progressRecords = await LearningProgress.find({
        user: userObjectId,
    })
        .sort({ accuracy: -1 })
        .lean<ILearningProgress[]>()
        .exec();

    const masteryDistribution = {
        not_started: 0,
        beginner: 0,
        intermediate: 0,
        advanced: 0,
        mastered: 0,
    };

    let accuracySum = 0;
    let totalSeconds = 0;

    for (const record of progressRecords) {
        accuracySum += record.accuracy || 0;
        totalSeconds += record.timeSpentSeconds || 0;

        if (record.masteryLevel && masteryDistribution[record.masteryLevel] !== undefined) {
            masteryDistribution[record.masteryLevel] += 1;
        } else {
            masteryDistribution.not_started += 1;
        }
    }

    const overallAccuracy =
        progressRecords.length > 0
            ? Math.round(accuracySum / progressRecords.length)
            : 0;

    const topMasteredTopics = progressRecords
        .filter((p) => p.masteryLevel === "mastered" || p.masteryLevel === "advanced")
        .slice(0, 5)
        .map((p) => ({
            topic: p.topic,
            masteryLevel: p.masteryLevel,
            accuracy: p.accuracy,
        }));

    const topicsNeedingReview = progressRecords
        .filter((p) => p.masteryLevel === "beginner" || p.masteryLevel === "not_started" || p.accuracy < 60)
        .slice(0, 5)
        .map((p) => ({
            topic: p.topic,
            masteryLevel: p.masteryLevel,
            accuracy: p.accuracy,
        }));

    return {
        totalTopicsTracked: progressRecords.length,
        overallAccuracy,
        totalTimeSpentMinutes: Math.round(totalSeconds / 60),
        masteryDistribution,
        topMasteredTopics,
        topicsNeedingReview,
    };
};

export const getSubjectPerformance = async (
    userId: string
): Promise<SubjectPerformanceResponse> => {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [documents, papers, studySessions, plans] = await Promise.all([
        DocumentModel.find({ user: userObjectId }).select("subject").lean(),
        QuestionPaper.find({ user: userObjectId }).select("subject").lean(),
        StudySession.find({ user: userObjectId, status: "completed" }).select("subject durationSeconds").lean(),
        StudyPlan.find({ user: userObjectId }).select("subjects tasks").lean(),
    ]);

    const subjectMap: Record<
        string,
        {
            studyMinutes: number;
            documentCount: number;
            questionPaperCount: number;
            taskCount: number;
        }
    > = {};

    const getOrCreate = (sub: string) => {
        const key = sub.trim();
        if (!subjectMap[key]) {
            subjectMap[key] = {
                studyMinutes: 0,
                documentCount: 0,
                questionPaperCount: 0,
                taskCount: 0,
            };
        }
        return subjectMap[key];
    };

    for (const doc of documents) {
        if (doc.subject) {
            getOrCreate(doc.subject).documentCount += 1;
        }
    }

    for (const paper of papers) {
        if (paper.subject) {
            getOrCreate(paper.subject).questionPaperCount += 1;
        }
    }

    for (const session of studySessions) {
        if (session.subject) {
            getOrCreate(session.subject).studyMinutes += Math.round(
                (session.durationSeconds || 0) / 60
            );
        }
    }

    for (const plan of plans) {
        for (const task of plan.tasks) {
            if (task.subject) {
                getOrCreate(task.subject).taskCount += 1;
            }
        }
    }

    const subjects = Object.entries(subjectMap).map(([subject, stats]) => ({
        subject,
        ...stats,
    })).sort((a, b) => b.studyMinutes - a.studyMinutes);

    return { subjects };
};

export const getRevisionStatistics = async (
    userId: string
): Promise<RevisionStatisticsResponse> => {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const now = new Date();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const revisions = await Revision.find({ user: userObjectId }).lean<IRevision[]>().exec();

    const totalRevisions = revisions.length;
    let completedRevisions = 0;
    let pendingRevisions = 0;
    let overdueRevisions = 0;
    let scheduledToday = 0;
    let totalRepetitionCount = 0;

    for (const rev of revisions) {
        totalRepetitionCount += rev.revisionCount || 0;

        if (rev.status === "completed") {
            completedRevisions += 1;
        } else {
            pendingRevisions += 1;

            if (rev.scheduledAt < now) {
                overdueRevisions += 1;
            }

            if (rev.scheduledAt >= startOfToday && rev.scheduledAt <= endOfToday) {
                scheduledToday += 1;
            }
        }
    }

    const completionRatePercentage =
        totalRevisions > 0
            ? Math.round((completedRevisions / totalRevisions) * 100)
            : 0;

    const averageRepetitionCount =
        totalRevisions > 0
            ? Number((totalRepetitionCount / totalRevisions).toFixed(1))
            : 0;

    return {
        totalRevisions,
        completedRevisions,
        pendingRevisions,
        overdueRevisions,
        scheduledToday,
        completionRatePercentage,
        averageRepetitionCount,
    };
};


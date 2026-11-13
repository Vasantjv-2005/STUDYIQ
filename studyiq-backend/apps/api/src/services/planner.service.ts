import mongoose from "mongoose";

import StudyPlan, { type IStudyPlan, type IStudyTask } from "../models/StudyPlan.model.js";
import { ApiError } from "../utils/ApiError.js";
import { formatPaginatedResponse } from "../utils/pagination.js";
import type {
    CreateStudyPlanInput,
    UpdateStudyPlanInput,
    AddStudyTaskInput,
    UpdateStudyTaskInput,
    PlannerQueryInput,
} from "../validators/planner.validator.js";
import type { PaginatedResponseData } from "../types/api.types.js";

export const createPlan = async (
    userId: string,
    input: CreateStudyPlanInput
): Promise<IStudyPlan> => {
    const plan = new StudyPlan({
        user: new mongoose.Types.ObjectId(userId),
        title: input.title,
        description: input.description,
        startDate: input.startDate,
        endDate: input.endDate,
        subjects: input.subjects,
        tasks: input.tasks.map((t) => ({
            title: t.title,
            description: t.description,
            subject: t.subject,
            scheduledDate: t.scheduledDate,
            estimatedMinutes: t.estimatedMinutes,
            completedMinutes: t.completedMinutes || 0,
            status: t.status || "pending",
        })),
        status: input.status,
    });

    await plan.save();
    return plan;
};

export const getPlans = async (
    userId: string,
    query: PlannerQueryInput
): Promise<PaginatedResponseData<IStudyPlan>> => {
    const filter: Record<string, unknown> = {
        user: new mongoose.Types.ObjectId(userId),
    };

    if (query.status) {
        filter["status"] = query.status;
    }

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
        StudyPlan.find(filter)
            .sort({ startDate: -1 })
            .skip(skip)
            .limit(query.limit)
            .lean<IStudyPlan[]>()
            .exec(),
        StudyPlan.countDocuments(filter).exec(),
    ]);

    return formatPaginatedResponse(items, total, query.page, query.limit);
};

export const getPlanById = async (
    userId: string,
    planId: string
): Promise<IStudyPlan> => {
    if (!mongoose.isValidObjectId(planId)) {
        throw ApiError.badRequest("Invalid study plan ID format.");
    }

    const plan = await StudyPlan.findOne({
        _id: planId,
        user: userId,
    })
        .lean<IStudyPlan>()
        .exec();

    if (!plan) {
        throw ApiError.notFound("Study plan not found or access denied.");
    }

    return plan;
};

export const updatePlan = async (
    userId: string,
    planId: string,
    input: UpdateStudyPlanInput
): Promise<IStudyPlan> => {
    if (!mongoose.isValidObjectId(planId)) {
        throw ApiError.badRequest("Invalid study plan ID format.");
    }

    const plan = await StudyPlan.findOne({
        _id: planId,
        user: userId,
    });

    if (!plan) {
        throw ApiError.notFound("Study plan not found or access denied.");
    }

    const startDate = input.startDate ?? plan.startDate;
    const endDate = input.endDate ?? plan.endDate;

    if (startDate > endDate) {
        throw ApiError.badRequest("Study plan start date cannot be after end date.");
    }

    if (input.title !== undefined) plan.title = input.title;
    if (input.description !== undefined) plan.description = input.description;
    if (input.startDate !== undefined) plan.startDate = input.startDate;
    if (input.endDate !== undefined) plan.endDate = input.endDate;
    if (input.subjects !== undefined) plan.subjects = input.subjects;
    if (input.status !== undefined) plan.status = input.status;

    await plan.save();
    return plan;
};

export const deletePlan = async (
    userId: string,
    planId: string
): Promise<void> => {
    if (!mongoose.isValidObjectId(planId)) {
        throw ApiError.badRequest("Invalid study plan ID format.");
    }

    const plan = await StudyPlan.findOneAndDelete({
        _id: planId,
        user: userId,
    });

    if (!plan) {
        throw ApiError.notFound("Study plan not found or access denied.");
    }
};

export const addTask = async (
    userId: string,
    planId: string,
    input: AddStudyTaskInput
): Promise<IStudyPlan> => {
    if (!mongoose.isValidObjectId(planId)) {
        throw ApiError.badRequest("Invalid study plan ID format.");
    }

    const plan = await StudyPlan.findOne({
        _id: planId,
        user: userId,
    });

    if (!plan) {
        throw ApiError.notFound("Study plan not found or access denied.");
    }

    const newTask: IStudyTask = {
        title: input.title,
        description: input.description,
        subject: input.subject,
        scheduledDate: input.scheduledDate,
        estimatedMinutes: input.estimatedMinutes,
        completedMinutes: 0,
        status: "pending",
    };

    plan.tasks.push(newTask);
    await plan.save();

    return plan;
};

export const updateTask = async (
    userId: string,
    planId: string,
    taskId: string,
    input: UpdateStudyTaskInput
): Promise<IStudyPlan> => {
    if (!mongoose.isValidObjectId(planId) || !mongoose.isValidObjectId(taskId)) {
        throw ApiError.badRequest("Invalid plan or task ID format.");
    }

    const plan = await StudyPlan.findOne({
        _id: planId,
        user: userId,
    });

    if (!plan) {
        throw ApiError.notFound("Study plan not found or access denied.");
    }

    const task = plan.tasks.find(
        (t) => (t as unknown as { _id: mongoose.Types.ObjectId })._id?.toString() === taskId
    );

    if (!task) {
        throw ApiError.notFound("Study task not found in this study plan.");
    }

    if (input.title !== undefined) task.title = input.title;
    if (input.description !== undefined) task.description = input.description;
    if (input.subject !== undefined) task.subject = input.subject;
    if (input.scheduledDate !== undefined) task.scheduledDate = input.scheduledDate;
    if (input.estimatedMinutes !== undefined) task.estimatedMinutes = input.estimatedMinutes;
    if (input.completedMinutes !== undefined) task.completedMinutes = input.completedMinutes;
    if (input.status !== undefined) task.status = input.status;

    await plan.save();
    return plan;
};

export const completeTask = async (
    userId: string,
    planId: string,
    taskId: string
): Promise<IStudyPlan> => {
    if (!mongoose.isValidObjectId(planId) || !mongoose.isValidObjectId(taskId)) {
        throw ApiError.badRequest("Invalid plan or task ID format.");
    }

    const plan = await StudyPlan.findOne({
        _id: planId,
        user: userId,
    });

    if (!plan) {
        throw ApiError.notFound("Study plan not found or access denied.");
    }

    const task = plan.tasks.find(
        (t) => (t as unknown as { _id: mongoose.Types.ObjectId })._id?.toString() === taskId
    );

    if (!task) {
        throw ApiError.notFound("Study task not found in this study plan.");
    }

    task.status = "completed";
    if (task.completedMinutes === 0) {
        task.completedMinutes = task.estimatedMinutes;
    }

    // Check if all tasks in plan are complete
    const allCompleted = plan.tasks.every((t) => t.status === "completed");
    if (allCompleted && plan.tasks.length > 0) {
        plan.status = "completed";
    }

    await plan.save();
    return plan;
};

export const deleteTask = async (
    userId: string,
    planId: string,
    taskId: string
): Promise<IStudyPlan> => {
    if (!mongoose.isValidObjectId(planId) || !mongoose.isValidObjectId(taskId)) {
        throw ApiError.badRequest("Invalid plan or task ID format.");
    }

    const plan = await StudyPlan.findOne({
        _id: planId,
        user: userId,
    });

    if (!plan) {
        throw ApiError.notFound("Study plan not found or access denied.");
    }

    const initialLength = plan.tasks.length;
    plan.tasks = plan.tasks.filter(
        (t) => (t as unknown as { _id: mongoose.Types.ObjectId })._id?.toString() !== taskId
    );

    if (plan.tasks.length === initialLength) {
        throw ApiError.notFound("Study task not found in this study plan.");
    }

    await plan.save();
    return plan;
};


import type { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { getRouteParam } from "../utils/params.js";
import {
    createStudyPlanSchema,
    updateStudyPlanSchema,
    addStudyTaskSchema,
    updateStudyTaskSchema,
    plannerQuerySchema,
} from "../validators/planner.validator.js";
import * as plannerService from "../services/planner.service.js";

/**
 * @desc   Create a new personalized study plan
 * @route  POST /api/planner
 * @access Private
 */
export const createStudyPlan = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const validatedInput = createStudyPlanSchema.parse(req.body);
        const plan = await plannerService.createPlan(
            req.user.id,
            validatedInput
        );

        ApiResponse.created(plan, "Study plan created successfully.").send(res);
    }
);

/**
 * @desc   Get all study plans belonging to the authenticated user
 * @route  GET /api/planner
 * @access Private
 */
export const getStudyPlans = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const validatedQuery = plannerQuerySchema.parse(req.query);
        const result = await plannerService.getPlans(
            req.user.id,
            validatedQuery
        );

        ApiResponse.ok(result, "Study plans retrieved successfully.").send(res);
    }
);

/**
 * @desc   Get details of a specific study plan
 * @route  GET /api/planner/:planId
 * @access Private
 */
export const getStudyPlanById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const planId = getRouteParam(req.params["planId"], "planId");
        const plan = await plannerService.getPlanById(req.user.id, planId);

        ApiResponse.ok(plan, "Study plan retrieved successfully.").send(res);
    }
);

/**
 * @desc   Update an existing study plan
 * @route  PATCH /api/planner/:planId
 * @access Private
 */
export const updateStudyPlan = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const planId = getRouteParam(req.params["planId"], "planId");
        const validatedInput = updateStudyPlanSchema.parse(req.body);

        const plan = await plannerService.updatePlan(
            req.user.id,
            planId,
            validatedInput
        );

        ApiResponse.ok(plan, "Study plan updated successfully.").send(res);
    }
);

/**
 * @desc   Delete a study plan
 * @route  DELETE /api/planner/:planId
 * @access Private
 */
export const deleteStudyPlan = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const planId = getRouteParam(req.params["planId"], "planId");
        await plannerService.deletePlan(req.user.id, planId);

        ApiResponse.ok(
            { message: "Study plan deleted successfully." },
            "Study plan deleted successfully."
        ).send(res);
    }
);

/**
 * @desc   Add a task to a study plan
 * @route  POST /api/planner/:planId/tasks
 * @access Private
 */
export const addStudyTask = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const planId = getRouteParam(req.params["planId"], "planId");
        const validatedInput = addStudyTaskSchema.parse(req.body);

        const updatedPlan = await plannerService.addTask(
            req.user.id,
            planId,
            validatedInput
        );

        ApiResponse.created(updatedPlan, "Task added to study plan successfully.").send(res);
    }
);

/**
 * @desc   Update a task in a study plan
 * @route  PATCH /api/planner/:planId/tasks/:taskId
 * @access Private
 */
export const updateStudyTask = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const planId = getRouteParam(req.params["planId"], "planId");
        const taskId = getRouteParam(req.params["taskId"], "taskId");
        const validatedInput = updateStudyTaskSchema.parse(req.body);

        const updatedPlan = await plannerService.updateTask(
            req.user.id,
            planId,
            taskId,
            validatedInput
        );

        ApiResponse.ok(updatedPlan, "Task updated successfully.").send(res);
    }
);

/**
 * @desc   Mark a study task as completed
 * @route  PATCH /api/planner/:planId/tasks/:taskId/complete
 * @access Private
 */
export const completeStudyTask = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const planId = getRouteParam(req.params["planId"], "planId");
        const taskId = getRouteParam(req.params["taskId"], "taskId");

        const updatedPlan = await plannerService.completeTask(
            req.user.id,
            planId,
            taskId
        );

        ApiResponse.ok(updatedPlan, "Task completed successfully.").send(res);
    }
);

/**
 * @desc   Delete a task from a study plan
 * @route  DELETE /api/planner/:planId/tasks/:taskId
 * @access Private
 */
export const deleteStudyTask = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const planId = getRouteParam(req.params["planId"], "planId");
        const taskId = getRouteParam(req.params["taskId"], "taskId");

        const updatedPlan = await plannerService.deleteTask(
            req.user.id,
            planId,
            taskId
        );

        ApiResponse.ok(updatedPlan, "Task deleted from study plan successfully.").send(res);
    }
);


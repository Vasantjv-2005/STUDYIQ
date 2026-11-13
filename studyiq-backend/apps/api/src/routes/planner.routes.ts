
import { Router } from "express";

import {
    createStudyPlan,
    getStudyPlans,
    getStudyPlanById,
    updateStudyPlan,
    deleteStudyPlan,
    addStudyTask,
    updateStudyTask,
    deleteStudyTask,
    completeStudyTask,
} from "../controllers/planner.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * All study planner routes require an authenticated user.
 */
router.use(authenticate);

/**
 * @route   POST /api/planner
 * @desc    Create a new personalized study plan
 * @access  Private
 */
router.post("/", createStudyPlan);

/**
 * @route   GET /api/planner
 * @desc    Get all study plans belonging to the authenticated user
 * @access  Private
 */
router.get("/", getStudyPlans);

/**
 * @route   GET /api/planner/:planId
 * @desc    Get details of a specific study plan
 * @access  Private
 */
router.get("/:planId", getStudyPlanById);

/**
 * @route   PATCH /api/planner/:planId
 * @desc    Update an existing study plan
 * @access  Private
 */
router.patch("/:planId", updateStudyPlan);

/**
 * @route   DELETE /api/planner/:planId
 * @desc    Delete a study plan
 * @access  Private
 */
router.delete("/:planId", deleteStudyPlan);

/**
 * @route   POST /api/planner/:planId/tasks
 * @desc    Add a task to a study plan
 * @access  Private
 */
router.post("/:planId/tasks", addStudyTask);

/**
 * @route   PATCH /api/planner/:planId/tasks/:taskId
 * @desc    Update a task in a study plan
 * @access  Private
 */
router.patch("/:planId/tasks/:taskId", updateStudyTask);

/**
 * @route   PATCH /api/planner/:planId/tasks/:taskId/complete
 * @desc    Mark a study task as completed
 * @access  Private
 */
router.patch(
    "/:planId/tasks/:taskId/complete",
    completeStudyTask
);

/**
 * @route   DELETE /api/planner/:planId/tasks/:taskId
 * @desc    Delete a task from a study plan
 * @access  Private
 */
router.delete("/:planId/tasks/:taskId", deleteStudyTask);

export default router;

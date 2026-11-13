
import { Router } from "express";

import {
    updateUserProfile,
    deleteUserAccount,
} from "../controllers/user.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * All user-management routes require authentication.
 */
router.use(authenticate);

/**
 * @route   PATCH /api/users/profile
 * @desc    Update the authenticated user's profile
 * @access  Private
 */
router.patch("/profile", updateUserProfile);

/**
 * @route   DELETE /api/users/account
 * @desc    Delete the authenticated user's account
 * @access  Private
 */
router.delete("/account", deleteUserAccount);

export default router;


import { Router } from "express";

import {
    registerUser,
    loginUser,
    getCurrentUser,
} from "../controllers/auth.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @route   POST /api/auth/register
 * @description Register a new STUDYIQ student account.
 * @access  Public
 */
router.post("/register", registerUser);

/**
 * @route   POST /api/auth/login
 * @description Authenticate a student and issue an access token.
 * @access  Public
 */
router.post("/login", loginUser);

/**
 * @route   GET /api/auth/me
 * @description Retrieve the authenticated student's profile.
 * @access  Private
 */
router.get("/me", authenticate, getCurrentUser);

export default router;

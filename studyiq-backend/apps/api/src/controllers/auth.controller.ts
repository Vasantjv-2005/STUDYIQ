import type { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import * as authService from "../services/auth.service.js";

/**
 * @desc   Register a new student account
 * @route  POST /api/auth/register
 * @access Public
 */
export const registerUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const validatedInput = registerSchema.parse(req.body);
        const result = await authService.register(validatedInput);

        ApiResponse.created(result, "Account registered successfully.").send(res);
    }
);

/**
 * @desc   Authenticate student and issue JWT token
 * @route  POST /api/auth/login
 * @access Public
 */
export const loginUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const validatedInput = loginSchema.parse(req.body);
        const result = await authService.login(validatedInput);

        ApiResponse.ok(result, "Authentication successful.").send(res);
    }
);

/**
 * @desc   Get authenticated user profile
 * @route  GET /api/auth/me
 * @access Private
 */
export const getCurrentUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const profile = await authService.getMe(req.user.id);
        ApiResponse.ok(profile, "User profile retrieved successfully.").send(res);
    }
);


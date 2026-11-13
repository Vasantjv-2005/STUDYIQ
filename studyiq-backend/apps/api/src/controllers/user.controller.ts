import type { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { updateUserProfileSchema } from "../validators/user.validator.js";
import * as userService from "../services/user.service.js";

/**
 * @desc   Update the authenticated user's profile
 * @route  PATCH /api/users/profile
 * @access Private
 */
export const updateUserProfile = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        const validatedInput = updateUserProfileSchema.parse(req.body);
        const updatedUser = await userService.updateProfile(req.user.id, validatedInput);

        ApiResponse.ok(updatedUser, "Profile updated successfully.").send(res);
    }
);

/**
 * @desc   Delete the authenticated user's account
 * @route  DELETE /api/users/account
 * @access Private
 */
export const deleteUserAccount = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.id) {
            throw ApiError.unauthorized("Authentication required.");
        }

        await userService.deleteAccount(req.user.id);
        ApiResponse.ok({ message: "Account deleted successfully." }, "Account deleted successfully.").send(res);
    }
);


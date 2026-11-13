import User from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import type { UpdateUserProfileInput } from "../validators/user.validator.js";
import type { UserResponse } from "../types/user.types.js";

export const updateProfile = async (
    userId: string,
    input: UpdateUserProfileInput
): Promise<UserResponse> => {
    const user = await User.findById(userId);

    if (!user) {
        throw ApiError.notFound("User account not found.");
    }

    if (input.name !== undefined) {
        user.name = input.name;
    }

    if (input.avatar !== undefined) {
        user.avatar = input.avatar ?? undefined;
    }

    await user.save();

    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};

export const deleteAccount = async (userId: string): Promise<void> => {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
        throw ApiError.notFound("User account not found.");
    }
};


import type { UserRole } from "../models/User.model.js";

export interface UserResponse {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string | null;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthSuccessResponse {
    user: UserResponse;
    token: string;
}

export interface UpdateUserProfileInput {
    name?: string;
    avatar?: string | null;
}


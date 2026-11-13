import type { UserRole } from "../models/User.model.js";

/**
 * Represents the authenticated user identity attached to an Express request.
 *
 * Only the user's identifier and authorization role are exposed here.
 * Passwords and other sensitive account fields are strictly excluded.
 */
export interface AuthenticatedUser {
    id: string;
    role: UserRole;
}

/**
 * Standard payload used when issuing and verifying STUDYIQ access tokens.
 */
export interface AccessTokenPayload {
    sub: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}

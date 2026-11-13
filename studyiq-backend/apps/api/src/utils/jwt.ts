import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

import { env } from "../config/env.js";
import type { AccessTokenPayload } from "../types/auth.types.js";

/**
 * Signs a JWT access token using HMAC SHA-256 and the configured JWT_SECRET.
 */
export const signAccessToken = (
    payload: AccessTokenPayload,
    options?: SignOptions
): string => {
    return jwt.sign(payload, env.JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: (env.JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"],
        ...options,
    });
};

/**
 * Verifies a JWT token using HS256 algorithm only.
 */
export const verifyAccessToken = (token: string): JwtPayload => {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
        algorithms: ["HS256"],
    });

    if (typeof decoded === "string" || !decoded) {
        throw new jwt.JsonWebTokenError("Invalid token payload structure");
    }

    return decoded;
};


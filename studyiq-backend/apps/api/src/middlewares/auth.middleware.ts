import type { RequestHandler } from "express";
import mongoose from "mongoose";
import jwt, { JsonWebTokenError, TokenExpiredError, type JwtPayload } from "jsonwebtoken";

import { env } from "../config/env.js";
import User from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Authentication middleware.
 *
 * Responsibilities:
 * 1. Read the Bearer access token.
 * 2. Verify its JWT signature and expiration (HS256 only).
 * 3. Validate the token's subject as a valid MongoDB ObjectId.
 * 4. Confirm that the user still exists in MongoDB.
 * 5. Attach a minimal authenticated identity to req.user.
 *
 * Controllers and services must enforce resource ownership.
 */
export const authenticate: RequestHandler = async (
    req,
    _res,
    next
): Promise<void> => {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
        next(ApiError.unauthorized("Authentication required. Please provide a valid Bearer token."));
        return;
    }

    const token = authorization.slice(7).trim();

    if (!token) {
        next(ApiError.unauthorized("Access token is missing."));
        return;
    }

    let decoded: JwtPayload;

    try {
        const verified = jwt.verify(token, env.JWT_SECRET, {
            algorithms: ["HS256"],
        });

        if (typeof verified === "string" || !verified) {
            next(ApiError.unauthorized("Invalid access token structure."));
            return;
        }

        decoded = verified;
    } catch (error: unknown) {
        if (error instanceof TokenExpiredError) {
            next(ApiError.unauthorized("Access token has expired. Please log in again."));
            return;
        }

        if (error instanceof JsonWebTokenError) {
            next(ApiError.unauthorized("Invalid access token."));
            return;
        }

        next(error);
        return;
    }

    const subject = decoded.sub;

    if (
        typeof subject !== "string" ||
        !subject ||
        !mongoose.isValidObjectId(subject)
    ) {
        next(ApiError.unauthorized("Invalid token subject."));
        return;
    }

    try {
        const user = await User.findById(subject)
            .select("_id role")
            .lean()
            .exec();

        if (!user) {
            next(ApiError.unauthorized("The account associated with this token no longer exists."));
            return;
        }

        req.user = {
            id: user._id.toString(),
            role: user.role,
        };

        next();
    } catch (error: unknown) {
        next(error);
    }
};

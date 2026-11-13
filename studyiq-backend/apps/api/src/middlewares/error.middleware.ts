import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import multer from "multer";
import mongoose from "mongoose";

import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

export const errorHandler: ErrorRequestHandler = (
    err,
    _req,
    res,
    _next
): void => {
    let statusCode = 500;
    let message = "An internal server error occurred.";
    let errors: unknown[] = [];

    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
        errors = err.errors;
    } else if (err instanceof ZodError) {
        statusCode = 422;
        message = "Request validation failed.";
        errors = err.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
        }));
    } else if (err instanceof TokenExpiredError) {
        statusCode = 401;
        message = "Access token has expired. Please authenticate again.";
    } else if (err instanceof JsonWebTokenError) {
        statusCode = 401;
        message = "Invalid access token signature or format.";
    } else if (err instanceof multer.MulterError) {
        statusCode = 400;
        if (err.code === "LIMIT_FILE_SIZE") {
            message = `File is too large. Maximum size allowed is ${env.MAX_FILE_SIZE_MB}MB.`;
        } else if (err.code === "LIMIT_FILE_COUNT") {
            message = "Too many files uploaded. Please upload one file at a time.";
        } else {
            message = `Upload error: ${err.message}`;
        }
    } else if (err instanceof mongoose.Error.CastError) {
        statusCode = 400;
        message = `Invalid ID format for field '${err.path}'.`;
    } else if (err instanceof mongoose.Error.ValidationError) {
        statusCode = 422;
        message = "Database validation failed.";
        errors = Object.values(err.errors).map((e) => ({
            field: e.path,
            message: e.message,
        }));
    } else if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: unknown }).code === 11000
    ) {
        statusCode = 409;
        const keyPattern = (err as { keyPattern?: Record<string, number> }).keyPattern;
        const field = keyPattern ? Object.keys(keyPattern)[0] : "field";
        message = `A resource with this ${field} already exists.`;
    } else if (err instanceof Error) {
        if (env.NODE_ENV !== "production") {
            message = err.message;
        }
    }

    if (env.NODE_ENV !== "production" && statusCode >= 500) {
        console.error("[ServerError]:", err);
    }

    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        ...(errors.length > 0 && { errors }),
        ...(env.NODE_ENV !== "production" &&
            err instanceof Error &&
            err.stack && {
                stack: err.stack,
            }),
        timestamp: new Date().toISOString(),
    });
};


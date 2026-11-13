import rateLimit from "express-rate-limit";

/**
 * Standard API rate limiter for general endpoints.
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        statusCode: 429,
        message: "Too many requests from this client. Please retry after 15 minutes.",
        timestamp: new Date().toISOString(),
    },
});

/**
 * Stricter rate limiter for sensitive authentication endpoints.
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        statusCode: 429,
        message: "Too many authentication attempts. Please try again after 15 minutes.",
        timestamp: new Date().toISOString(),
    },
});


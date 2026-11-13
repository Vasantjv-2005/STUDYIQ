import { ApiError } from "./ApiError.js";

/**
 * Safely extracts and validates a single string route parameter in Express 5.
 * Throws 400 Bad Request if the parameter is missing or malformed.
 */
export const getRouteParam = (
    value: string | string[] | undefined,
    paramName: string
): string => {
    if (typeof value === "string" && value.trim().length > 0) {
        return value.trim();
    }

    if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim().length > 0) {
        return value[0].trim();
    }

    throw ApiError.badRequest(`Route parameter '${paramName}' is required and must be a valid string.`);
};


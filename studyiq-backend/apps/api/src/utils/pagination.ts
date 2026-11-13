import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from "./constants.js";
import type { PaginationMeta, PaginatedResponseData } from "../types/api.types.js";

export interface PaginationParams {
    page: number;
    limit: number;
    skip: number;
}

export const extractPagination = (
    query: Record<string, unknown>,
    fallbackLimit: number = DEFAULT_LIMIT
): PaginationParams => {
    const rawPage = query["page"];
    const rawLimit = query["limit"];

    const page = Math.max(
        DEFAULT_PAGE,
        typeof rawPage === "string" || typeof rawPage === "number"
            ? parseInt(String(rawPage), 10) || DEFAULT_PAGE
            : DEFAULT_PAGE
    );

    const parsedLimit =
        typeof rawLimit === "string" || typeof rawLimit === "number"
            ? parseInt(String(rawLimit), 10) || fallbackLimit
            : fallbackLimit;

    const limit = Math.min(MAX_LIMIT, Math.max(1, parsedLimit));
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

export const formatPaginatedResponse = <T>(
    items: T[],
    total: number,
    page: number,
    limit: number
): PaginatedResponseData<T> => {
    const totalPages = Math.ceil(total / limit) || 1;

    const pagination: PaginationMeta = {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };

    return {
        items,
        pagination,
    };
};


export interface ApiResponsePayload<T = unknown> {
    success: boolean;
    statusCode: number;
    message: string;
    data?: T;
    errors?: unknown[];
    timestamp: string;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface PaginatedResponseData<T> {
    items: T[];
    pagination: PaginationMeta;
}


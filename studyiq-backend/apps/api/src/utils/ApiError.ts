export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly errors: unknown[];
    public readonly isOperational: boolean;

    constructor(
        statusCode: number,
        message: string = "Something went wrong",
        errors: unknown[] = [],
        stack: string = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = true;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    static badRequest(message: string = "Bad request", errors: unknown[] = []): ApiError {
        return new ApiError(400, message, errors);
    }

    static unauthorized(message: string = "Authentication required"): ApiError {
        return new ApiError(401, message);
    }

    static forbidden(message: string = "Access denied"): ApiError {
        return new ApiError(403, message);
    }

    static notFound(message: string = "Resource not found"): ApiError {
        return new ApiError(404, message);
    }

    static conflict(message: string = "Resource already exists"): ApiError {
        return new ApiError(409, message);
    }

    static unprocessableEntity(message: string = "Validation failed", errors: unknown[] = []): ApiError {
        return new ApiError(422, message, errors);
    }

    static internal(message: string = "Internal server error"): ApiError {
        return new ApiError(500, message);
    }

    static serviceUnavailable(message: string = "Service temporarily unavailable"): ApiError {
        return new ApiError(503, message);
    }
}


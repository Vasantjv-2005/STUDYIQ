import type { Response } from "express";

export class ApiResponse<T = unknown> {
    public readonly success: boolean;
    public readonly statusCode: number;
    public readonly message: string;
    public readonly data?: T;
    public readonly timestamp: string;

    constructor(statusCode: number, data?: T, message: string = "Success") {
        this.success = statusCode >= 200 && statusCode < 300;
        this.statusCode = statusCode;
        this.message = message;
        if (data !== undefined) {
            this.data = data;
        }
        this.timestamp = new Date().toISOString();
    }

    public send(res: Response): void {
        res.status(this.statusCode).json(this);
    }

    static ok<T>(data: T, message: string = "Success"): ApiResponse<T> {
        return new ApiResponse(200, data, message);
    }

    static created<T>(data: T, message: string = "Resource created successfully"): ApiResponse<T> {
        return new ApiResponse(201, data, message);
    }

    static noContent(message: string = "Resource deleted successfully"): ApiResponse<null> {
        return new ApiResponse(200, null, message);
    }
}


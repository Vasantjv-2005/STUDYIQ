import type { RequestHandler } from "express";
import { ApiError } from "../utils/ApiError.js";

export const notFoundHandler: RequestHandler = (req, _res, next): void => {
    next(ApiError.notFound(`Endpoint '${req.method} ${req.originalUrl}' was not found on this server.`));
};


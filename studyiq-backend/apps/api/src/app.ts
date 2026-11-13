import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";

import { corsOptions } from "./config/cors.js";
import { helmetOptions } from "./config/security.js";
import { requestLogger } from "./config/logger.js";
import { apiLimiter, authLimiter } from "./middlewares/rate-limit.middleware.js";
import { notFoundHandler } from "./middlewares/not-found.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import rootRouter from "./routes/index.js";

const app: Express = express();

// Security headers
app.use(helmet(helmetOptions));

// CORS configuration
app.use(cors(corsOptions));

// Request logging
app.use(requestLogger);

// Rate limiting
app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

// Body parsing
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Mount all API routes
app.use("/api", rootRouter);

// Catch 404 unmatched endpoints
app.use(notFoundHandler);

// Centralized error handling middleware
app.use(errorHandler);

export default app;

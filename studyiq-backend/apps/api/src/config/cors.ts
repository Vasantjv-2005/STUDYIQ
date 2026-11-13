import type { CorsOptions } from "cors";

export const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or localhost in development
        if (!origin || origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
            callback(null, true);
            return;
        }

        callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};


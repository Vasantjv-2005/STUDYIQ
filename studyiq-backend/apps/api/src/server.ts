
import app from "./app.js";

import { env } from "./config/env.js";
import {
    connectDatabase,
    disconnectDatabase
} from "./config/database.js";

import type { Server } from "node:http";

let server: Server | undefined;

const startServer = async (): Promise<void> => {
    try {
        // Connect to MongoDB before starting the API
        await connectDatabase();

        server = app.listen(env.PORT, () => {
            console.log("-------------------------------------");
            console.log("       STUDYIQ BACKEND SERVER");
            console.log("-------------------------------------");
            console.log(`Environment: ${env.NODE_ENV}`);
            console.log(`Port: ${env.PORT}`);
            console.log(
                `Health Check: http://localhost:${env.PORT}/api/health`
            );
            console.log("-------------------------------------");
        });
    } catch (error: unknown) {
        console.error("Failed to start STUDYIQ:", error);

        await disconnectDatabase().catch(() => undefined);

        process.exitCode = 1;
    }
};

// Graceful shutdown
const shutdown = (signal: string): void => {
    console.log(`${signal} received. Shutting down...`);

    if (!server) {
        void disconnectDatabase().finally(() => {
            process.exit(0);
        });

        return;
    }

    server.close(async (error) => {
        if (error) {
            console.error("Server shutdown error:", error);
            process.exitCode = 1;
        }

        try {
            await disconnectDatabase();
        } catch (disconnectError) {
            console.error("Database shutdown error:", disconnectError);
            process.exitCode = 1;
        }

        process.exit();
    });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

void startServer();

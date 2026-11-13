
import mongoose from "mongoose";

import { env } from "./env.js";

export const connectDatabase = async (): Promise<void> => {
    try {
        // Connect to MongoDB Atlas
        await mongoose.connect(env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000
        });

        const db = mongoose.connection.db;

        if (!db) {
            throw new Error("MongoDB database instance is unavailable.");
        }

        // Verify database connection
        await db.admin().ping();

        console.log("MongoDB connected successfully!");
        console.log(`Database: ${mongoose.connection.name}`);
        console.log(`Host: ${mongoose.connection.host}`);

        // Create the initial users collection if it doesn't exist
        const collections = await db
            .listCollections({ name: "users" })
            .toArray();

        if (collections.length === 0) {
            await db.createCollection("users");
            console.log("Users collection created successfully!");
        } else {
            console.log("Users collection already exists.");
        }

        console.log("STUDYIQ database initialized successfully!");

    } catch (error: unknown) {
        console.error("MongoDB connection failed:");

        if (error instanceof Error) {
            console.error(error.message);
        }

        throw error;
    }
};

export const disconnectDatabase = async (): Promise<void> => {
    await mongoose.disconnect();

    console.log("MongoDB disconnected successfully.");
};

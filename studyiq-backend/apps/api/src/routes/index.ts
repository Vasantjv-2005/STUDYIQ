import { Router } from "express";

import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import documentRoutes from "./document.routes.js";
import chapterRoutes from "./chapter.routes.js";
import conceptRoutes from "./concept.routes.js";
import chatRoutes from "./chat.routes.js";
import examRoutes from "./exam.routes.js";
import revisionRoutes from "./revision.routes.js";
import plannerRoutes from "./planner.routes.js";
import analyticsRoutes from "./analytics.routes.js";

const rootRouter = Router();

rootRouter.use("/health", healthRoutes);
rootRouter.use("/auth", authRoutes);
rootRouter.use("/users", userRoutes);
rootRouter.use("/documents", documentRoutes);
rootRouter.use("/chapters", chapterRoutes);
rootRouter.use("/concepts", conceptRoutes);
rootRouter.use("/chat", chatRoutes);
rootRouter.use("/exams", examRoutes);
rootRouter.use("/revisions", revisionRoutes);
rootRouter.use("/planner", plannerRoutes);
rootRouter.use("/analytics", analyticsRoutes);

export default rootRouter;


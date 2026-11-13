
import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "STUDYIQ API is running successfully!",
        service: "STUDYIQ Backend",
        status: "healthy",
        timestamp: new Date().toISOString()
    });
});

export default router;

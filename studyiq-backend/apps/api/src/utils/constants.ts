export const USER_ROLES = {
    STUDENT: "student",
    ADMIN: "admin",
} as const;

export const DOCUMENT_STATUSES = {
    UPLOADED: "uploaded",
    PROCESSING: "processing",
    COMPLETED: "completed",
    FAILED: "failed",
} as const;

export const REVISION_STATUSES = {
    PENDING: "pending",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
} as const;

export const STUDY_PLAN_STATUSES = {
    ACTIVE: "active",
    COMPLETED: "completed",
    PAUSED: "paused",
} as const;

export const STUDY_TASK_STATUSES = {
    PENDING: "pending",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
} as const;

export const MASTERY_LEVELS = {
    NOT_STARTED: "not_started",
    BEGINNER: "beginner",
    INTERMEDIATE: "intermediate",
    ADVANCED: "advanced",
    MASTERED: "mastered",
} as const;

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

export const ALLOWED_MIME_TYPES = ["application/pdf"] as const;
export const PDF_MAGIC_BYTES = "%PDF-";


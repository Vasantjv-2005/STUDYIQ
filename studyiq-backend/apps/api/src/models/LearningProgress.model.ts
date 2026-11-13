
import mongoose, {
    Schema,
    type Document,
    type Model,
    type Types,
} from "mongoose";

export type MasteryLevel =
    | "not_started"
    | "beginner"
    | "intermediate"
    | "advanced"
    | "mastered";

export interface ILearningProgress extends Document {
    user: Types.ObjectId;
    document?: Types.ObjectId;
    chapter?: Types.ObjectId;
    concept?: Types.ObjectId;
    topic: string;
    masteryLevel: MasteryLevel;
    totalAttempts: number;
    correctAttempts: number;
    accuracy: number;
    timeSpentSeconds: number;
    lastStudiedAt?: Date;
    masteredAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const learningProgressSchema = new Schema<ILearningProgress>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        document: {
            type: Schema.Types.ObjectId,
            ref: "Document",
        },
        chapter: {
            type: Schema.Types.ObjectId,
            ref: "Chapter",
        },
        concept: {
            type: Schema.Types.ObjectId,
            ref: "Concept",
        },
        topic: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        masteryLevel: {
            type: String,
            enum: [
                "not_started",
                "beginner",
                "intermediate",
                "advanced",
                "mastered",
            ],
            default: "not_started",
        },
        totalAttempts: {
            type: Number,
            default: 0,
            min: 0,
        },
        correctAttempts: {
            type: Number,
            default: 0,
            min: 0,
        },
        accuracy: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        timeSpentSeconds: {
            type: Number,
            default: 0,
            min: 0,
        },
        lastStudiedAt: {
            type: Date,
        },
        masteredAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

learningProgressSchema.index(
    { user: 1, concept: 1 },
    { unique: true, sparse: true }
);

learningProgressSchema.index({ user: 1, masteryLevel: 1 });
learningProgressSchema.index({ user: 1, lastStudiedAt: -1 });

const LearningProgress: Model<ILearningProgress> =
    mongoose.models.LearningProgress ||
    mongoose.model<ILearningProgress>(
        "LearningProgress",
        learningProgressSchema
    );

export default LearningProgress;

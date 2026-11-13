
import mongoose, {
    Schema,
    type Document,
    type Model,
    type Types,
} from "mongoose";

export type StudySessionStatus = "active" | "completed" | "abandoned";

export interface IStudySession extends Document {
    user: Types.ObjectId;
    document?: Types.ObjectId;
    chapter?: Types.ObjectId;
    subject?: string;
    topic?: string;
    startedAt: Date;
    endedAt?: Date;
    durationSeconds: number;
    status: StudySessionStatus;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const studySessionSchema = new Schema<IStudySession>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        document: {
            type: Schema.Types.ObjectId,
            ref: "Document",
        },
        chapter: {
            type: Schema.Types.ObjectId,
            ref: "Chapter",
        },
        subject: {
            type: String,
            trim: true,
            maxlength: 150,
        },
        topic: {
            type: String,
            trim: true,
            maxlength: 200,
        },
        startedAt: {
            type: Date,
            default: Date.now,
        },
        endedAt: {
            type: Date,
        },
        durationSeconds: {
            type: Number,
            default: 0,
            min: 0,
        },
        status: {
            type: String,
            enum: ["active", "completed", "abandoned"],
            default: "active",
        },
        notes: {
            type: String,
            maxlength: 2000,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

studySessionSchema.index({ user: 1, startedAt: -1 });
studySessionSchema.index({ user: 1, status: 1 });

const StudySession: Model<IStudySession> =
    mongoose.models.StudySession ||
    mongoose.model<IStudySession>("StudySession", studySessionSchema);

export default StudySession;

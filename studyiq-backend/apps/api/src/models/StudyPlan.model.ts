
import mongoose, {
    Schema,
    type Document,
    type Model,
    type Types,
} from "mongoose";

export type StudyPlanStatus = "active" | "completed" | "paused";

export type StudyTaskStatus = "pending" | "in_progress" | "completed";

export interface IStudyTask {
    title: string;
    description?: string;
    subject: string;
    scheduledDate: Date;
    estimatedMinutes: number;
    completedMinutes: number;
    status: StudyTaskStatus;
}

export interface IStudyPlan extends Document {
    user: Types.ObjectId;
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    subjects: string[];
    tasks: IStudyTask[];
    status: StudyPlanStatus;
    createdAt: Date;
    updatedAt: Date;
}

const studyTaskSchema = new Schema<IStudyTask>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        description: {
            type: String,
            maxlength: 1000,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },
        scheduledDate: {
            type: Date,
            required: true,
        },
        estimatedMinutes: {
            type: Number,
            required: true,
            min: 1,
        },
        completedMinutes: {
            type: Number,
            default: 0,
            min: 0,
        },
        status: {
            type: String,
            enum: ["pending", "in_progress", "completed"],
            default: "pending",
        },
    },
    { _id: true }
);

const studyPlanSchema = new Schema<IStudyPlan>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        description: {
            type: String,
            maxlength: 2000,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        subjects: {
            type: [String],
            default: [],
        },
        tasks: {
            type: [studyTaskSchema],
            default: [],
        },
        status: {
            type: String,
            enum: ["active", "completed", "paused"],
            default: "active",
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

studyPlanSchema.index({ user: 1, startDate: -1 });
studyPlanSchema.index({ user: 1, status: 1 });

const StudyPlan: Model<IStudyPlan> =
    mongoose.models.StudyPlan ||
    mongoose.model<IStudyPlan>("StudyPlan", studyPlanSchema);

export default StudyPlan;

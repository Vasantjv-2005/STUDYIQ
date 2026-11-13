
import mongoose, {
    Schema,
    type Document,
    type Model,
    type Types,
} from "mongoose";

export type RevisionStatus = "pending" | "in_progress" | "completed";

export interface IRevision extends Document {
    user: Types.ObjectId;
    document?: Types.ObjectId;
    chapter?: Types.ObjectId;
    concept?: Types.ObjectId;
    title: string;
    notes?: string;
    scheduledAt: Date;
    completedAt?: Date;
    status: RevisionStatus;
    revisionCount: number;
    nextRevisionAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const revisionSchema = new Schema<IRevision>(
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
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        notes: {
            type: String,
            maxlength: 3000,
        },
        scheduledAt: {
            type: Date,
            required: true,
        },
        completedAt: {
            type: Date,
        },
        status: {
            type: String,
            enum: ["pending", "in_progress", "completed"],
            default: "pending",
        },
        revisionCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        nextRevisionAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

revisionSchema.index({ user: 1, scheduledAt: 1 });
revisionSchema.index({ user: 1, status: 1 });
revisionSchema.index({ user: 1, nextRevisionAt: 1 });

const Revision: Model<IRevision> =
    mongoose.models.Revision ||
    mongoose.model<IRevision>("Revision", revisionSchema);

export default Revision;


import mongoose, {
    Schema,
    type Document,
    type Model,
    type Types,
} from "mongoose";

export interface IChapter extends Document {
    document: Types.ObjectId;
    user: Types.ObjectId;
    title: string;
    chapterNumber: number;
    content: string;
    summary?: string;
    startPage: number;
    endPage: number;
    wordCount: number;
    status: "pending" | "processed" | "failed";
    createdAt: Date;
    updatedAt: Date;
}

const chapterSchema = new Schema<IChapter>(
    {
        document: {
            type: Schema.Types.ObjectId,
            ref: "Document",
            required: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        chapterNumber: {
            type: Number,
            required: true,
            min: 1,
        },
        content: {
            type: String,
            required: true,
        },
        summary: {
            type: String,
            maxlength: 10000,
        },
        startPage: {
            type: Number,
            required: true,
            min: 1,
        },
        endPage: {
            type: Number,
            required: true,
            min: 1,
        },
        wordCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        status: {
            type: String,
            enum: ["pending", "processed", "failed"],
            default: "pending",
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

chapterSchema.index(
    { document: 1, chapterNumber: 1 },
    { unique: true }
);

chapterSchema.index({ user: 1, document: 1 });

const Chapter: Model<IChapter> =
    mongoose.models.Chapter ||
    mongoose.model<IChapter>("Chapter", chapterSchema);

export default Chapter;

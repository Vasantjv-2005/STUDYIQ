
import mongoose, {
    Schema,
    type Document,
    type Model,
    type Types,
} from "mongoose";

export type DocumentStatus =
    | "uploaded"
    | "processing"
    | "completed"
    | "failed";

export interface IDocument extends Document {
    user: Types.ObjectId;
    title: string;
    originalFileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    pageCount: number;
    description?: string;
    subject?: string;
    status: DocumentStatus;
    processingError?: string;
    uploadedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
    {
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
            minlength: 2,
            maxlength: 200,
        },
        originalFileName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 255,
        },
        fileUrl: {
            type: String,
            required: true,
        },
        fileType: {
            type: String,
            required: true,
            enum: ["application/pdf"],
        },
        fileSize: {
            type: Number,
            required: true,
            min: 1,
        },
        pageCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 1000,
        },
        subject: {
            type: String,
            trim: true,
            maxlength: 100,
        },
        status: {
            type: String,
            enum: ["uploaded", "processing", "completed", "failed"],
            default: "uploaded",
        },
        processingError: {
            type: String,
            maxlength: 2000,
        },
        uploadedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

documentSchema.index({ user: 1, createdAt: -1 });
documentSchema.index({ user: 1, status: 1 });

const DocumentModel: Model<IDocument> =
    mongoose.models.Document ||
    mongoose.model<IDocument>("Document", documentSchema);

export default DocumentModel;

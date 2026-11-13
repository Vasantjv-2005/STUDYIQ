
import mongoose, {
    Schema,
    type Document,
    type Model,
    type Types,
} from "mongoose";

export type MessageRole = "user" | "assistant" | "system";

export interface IChatSource {
    document: Types.ObjectId;
    chapter?: Types.ObjectId;
    pageNumber?: number;
    excerpt?: string;
}

export interface IChatMessage extends Document {
    session: Types.ObjectId;
    user: Types.ObjectId;
    role: MessageRole;
    content: string;
    sources: IChatSource[];
    feedback?: "helpful" | "not_helpful";
    createdAt: Date;
    updatedAt: Date;
}

const chatSourceSchema = new Schema<IChatSource>(
    {
        document: {
            type: Schema.Types.ObjectId,
            ref: "Document",
            required: true,
        },
        chapter: {
            type: Schema.Types.ObjectId,
            ref: "Chapter",
        },
        pageNumber: {
            type: Number,
            min: 1,
        },
        excerpt: {
            type: String,
            maxlength: 3000,
        },
    },
    { _id: false }
);

const chatMessageSchema = new Schema<IChatMessage>(
    {
        session: {
            type: Schema.Types.ObjectId,
            ref: "ChatSession",
            required: true,
            index: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        role: {
            type: String,
            enum: ["user", "assistant", "system"],
            required: true,
        },
        content: {
            type: String,
            required: true,
            maxlength: 30000,
        },
        sources: {
            type: [chatSourceSchema],
            default: [],
        },
        feedback: {
            type: String,
            enum: ["helpful", "not_helpful"],
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

chatMessageSchema.index({ session: 1, createdAt: 1 });

const ChatMessage: Model<IChatMessage> =
    mongoose.models.ChatMessage ||
    mongoose.model<IChatMessage>("ChatMessage", chatMessageSchema);

export default ChatMessage;

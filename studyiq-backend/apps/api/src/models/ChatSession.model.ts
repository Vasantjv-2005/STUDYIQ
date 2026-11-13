
import mongoose, {
    Schema,
    type Document,
    type Model,
    type Types,
} from "mongoose";

export interface IChatSession extends Document {
    user: Types.ObjectId;
    document?: Types.ObjectId;
    title: string;
    isArchived: boolean;
    lastMessageAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const chatSessionSchema = new Schema<IChatSession>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        document: {
            type: Schema.Types.ObjectId,
            ref: "Document",
            default: null,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
            default: "New conversation",
        },
        isArchived: {
            type: Boolean,
            default: false,
        },
        lastMessageAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

chatSessionSchema.index({ user: 1, updatedAt: -1 });
chatSessionSchema.index({ user: 1, document: 1 });

const ChatSession: Model<IChatSession> =
    mongoose.models.ChatSession ||
    mongoose.model<IChatSession>("ChatSession", chatSessionSchema);

export default ChatSession;

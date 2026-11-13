
import mongoose, {
    Schema,
    type Document,
    type Model,
    type Types,
} from "mongoose";

export type ConceptDifficulty = "beginner" | "intermediate" | "advanced";

export interface IConcept extends Document {
    user: Types.ObjectId;
    document: Types.ObjectId;
    chapter: Types.ObjectId;
    title: string;
    description: string;
    explanation?: string;
    difficulty: ConceptDifficulty;
    keywords: string[];
    relatedConcepts: Types.ObjectId[];
    pageReferences: number[];
    createdAt: Date;
    updatedAt: Date;
}

const conceptSchema = new Schema<IConcept>(
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
            required: true,
        },
        chapter: {
            type: Schema.Types.ObjectId,
            ref: "Chapter",
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
            required: true,
            maxlength: 2000,
        },
        explanation: {
            type: String,
            maxlength: 10000,
        },
        difficulty: {
            type: String,
            enum: ["beginner", "intermediate", "advanced"],
            default: "beginner",
        },
        keywords: {
            type: [String],
            default: [],
        },
        relatedConcepts: [{
            type: Schema.Types.ObjectId,
            ref: "Concept",
        }],
        pageReferences: {
            type: [Number],
            default: [],
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

conceptSchema.index({ user: 1, chapter: 1 });
conceptSchema.index({ document: 1, title: 1 });

const Concept: Model<IConcept> =
    mongoose.models.Concept ||
    mongoose.model<IConcept>("Concept", conceptSchema);

export default Concept;

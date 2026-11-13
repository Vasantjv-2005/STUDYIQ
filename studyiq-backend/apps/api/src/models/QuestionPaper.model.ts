
import mongoose, {
    Schema,
    type Document,
    type Model,
    type Types,
} from "mongoose";

export type QuestionPaperStatus =
    | "uploaded"
    | "processing"
    | "completed"
    | "failed";

export interface IExtractedQuestion {
    questionNumber: number;
    questionText: string;
    marks?: number;
    topic?: string;
    chapter?: Types.ObjectId;
    pageNumber?: number;
}

export interface IQuestionPaper extends Document {
    user: Types.ObjectId;
    document?: Types.ObjectId;
    title: string;
    subject: string;
    university?: string;
    course?: string;
    semester?: number;
    examYear?: number;
    examType?: string;
    totalMarks?: number;
    durationMinutes?: number;
    questions: IExtractedQuestion[];
    status: QuestionPaperStatus;
    processingError?: string;
    createdAt: Date;
    updatedAt: Date;
}

const extractedQuestionSchema = new Schema<IExtractedQuestion>(
    {
        questionNumber: {
            type: Number,
            required: true,
            min: 1,
        },
        questionText: {
            type: String,
            required: true,
            maxlength: 10000,
        },
        marks: {
            type: Number,
            min: 0,
        },
        topic: {
            type: String,
            trim: true,
            maxlength: 200,
        },
        chapter: {
            type: Schema.Types.ObjectId,
            ref: "Chapter",
        },
        pageNumber: {
            type: Number,
            min: 1,
        },
    },
    { _id: false }
);

const questionPaperSchema = new Schema<IQuestionPaper>(
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
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },
        university: {
            type: String,
            trim: true,
            maxlength: 200,
        },
        course: {
            type: String,
            trim: true,
            maxlength: 150,
        },
        semester: {
            type: Number,
            min: 1,
            max: 20,
        },
        examYear: {
            type: Number,
            min: 1900,
            max: 2100,
        },
        examType: {
            type: String,
            trim: true,
            maxlength: 100,
        },
        totalMarks: {
            type: Number,
            min: 0,
        },
        durationMinutes: {
            type: Number,
            min: 1,
        },
        questions: {
            type: [extractedQuestionSchema],
            default: [],
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
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

questionPaperSchema.index({ user: 1, subject: 1, examYear: -1 });
questionPaperSchema.index({ user: 1, createdAt: -1 });

const QuestionPaper: Model<IQuestionPaper> =
    mongoose.models.QuestionPaper ||
    mongoose.model<IQuestionPaper>("QuestionPaper", questionPaperSchema);

export default QuestionPaper;

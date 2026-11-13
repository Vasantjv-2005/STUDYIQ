
import mongoose, { Schema, type Document, type Model } from "mongoose";

export type UserRole = "student" | "admin";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    avatar?: string;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: 2,
            maxlength: 80,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: 254,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            select: false,
        },
        role: {
            type: String,
            enum: ["student", "admin"],
            default: "student",
        },
        avatar: {
            type: String,
            default: null,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

userSchema.index({ email: 1 }, { unique: true });

const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;

import User, { type IUser } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signAccessToken } from "../utils/jwt.js";
import type { RegisterInput, LoginInput } from "../validators/auth.validator.js";
import type { AuthSuccessResponse, UserResponse } from "../types/user.types.js";

export const formatUserResponse = (user: IUser): UserResponse => {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};

export const register = async (input: RegisterInput): Promise<AuthSuccessResponse> => {
    const existingUser = await User.findOne({ email: input.email.toLowerCase() }).lean().exec();

    if (existingUser) {
        throw ApiError.conflict("An account with this email already exists.");
    }

    const hashedPassword = await hashPassword(input.password);

    const user = new User({
        name: input.name,
        email: input.email.toLowerCase(),
        password: hashedPassword,
        avatar: input.avatar ?? undefined,
        role: "student",
        isEmailVerified: false,
    });

    await user.save();

    const token = signAccessToken({
        sub: user._id.toString(),
        role: user.role,
    });

    return {
        user: formatUserResponse(user),
        token,
    };
};

export const login = async (input: LoginInput): Promise<AuthSuccessResponse> => {
    const user = await User.findOne({ email: input.email.toLowerCase() })
        .select("+password")
        .exec();

    if (!user) {
        throw ApiError.unauthorized("Invalid email or password.");
    }

    const isPasswordValid = await comparePassword(input.password, user.password);

    if (!isPasswordValid) {
        throw ApiError.unauthorized("Invalid email or password.");
    }

    const token = signAccessToken({
        sub: user._id.toString(),
        role: user.role,
    });

    return {
        user: formatUserResponse(user),
        token,
    };
};

export const getMe = async (userId: string): Promise<UserResponse> => {
    const user = await User.findById(userId).lean<IUser>().exec();

    if (!user) {
        throw ApiError.notFound("Student account not found.");
    }

    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};

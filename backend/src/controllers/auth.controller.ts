import { Request, Response } from "express";
import bcrypt from 'bcrypt';
import User from "../models/user.model.ts";
import { generateToken } from "../lib/utils.ts";
import cloudinary from "../lib/cloudinary.ts";

export const signupController = async (req: Request, res: Response) => {
    const { fullName, email, password }: {
        fullName: string, email: string, password: string
    } = req.body;
    try {

        if (!fullName || !email || !password)
            return res.status(400).json({
                message: "All fields are required",
            });

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters",
            });
        }

        const user = await User.findOne({ email });

        if (user) return res.status(400).json({
            message: "Email already exists",
        });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        });

        if (User) {
            generateToken(newUser._id, res);
            await newUser.save()

            return res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });
        } else {
            return res.status(400).json({
                message: "Invalid user data",
            });
        }

    } catch (e: any) {
        console.log("Error in signup controller:", e.message);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

export const loginController = async (req: Request, res: Response) => {
    const { email, password }: {
        email: string, password: string,
    } = req.body;

    try {
        if (!email || !password)
            return res.status(400).json({
                message: "All fields are required",
            });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({
            message: "Invalid credentials",
        });

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect)
            return res.status(400).json({
                message: "Invalid credentials",
            });

        generateToken(user._id, res);
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (e: any) {
        console.log("Error in login controller:", e.message);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

export const logoutController = async (req: Request, res: Response) => {
    try {
        res.cookie("jwt", '', { maxAge: 0 });
        res.status(200).json({
            message: "Logged out successfully",
        });
    } catch (e: any) {
        console.log("Error in logout controller:", e.message);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

// tested in frontend
export const updateProfileController = async (req: Request, res: Response) => {
    try {
        const { profilePic } = req.body;
        //@ts-ignore
        const userId = req.user?._id;
        if (!profilePic) return res.status(400).json({
            message: "Profile pic is required",
        });

        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        const updatedUser = await User.findByIdAndUpdate(userId, {
            profilePic: uploadResponse.secure_url,
        }, {
            new: true
        });

        return res.status(200).json(updatedUser);
    } catch (e: any) {
        console.log("Error in update profile controller:", e);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const chechAuth = async (req: Request, res: Response) => {
    try {
        //@ts-ignore
        return res.status(200).json(req.user);
    } catch (e: any) {
        console.log("Error in chechAuth controller", e.message);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};
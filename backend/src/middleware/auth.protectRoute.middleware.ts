import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.ts';

export const protectRoute = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.jwt;
        if (!token) return res.status(401).json({
            message: "Unauthorized - No Token Provided",
        });

        const decoded = jwt.verify(token, process.env.JWT_SECRET!);

        if (!decoded) return res.status(401).json({
            message: "Unauthorized - Invalid Token",
        });

        //@ts-ignore
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) return res.status(404).json({
            message: "User not found",
        });

        //@ts-ignore
        req.user = user;
        next();
    } catch (e: any) {
        console.log("Error in protectRoute middleware:", e.message);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};
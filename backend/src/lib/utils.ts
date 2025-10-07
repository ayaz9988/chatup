import { Response, Request } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';


export const generateToken = (userId: any, res: Response) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
        expiresIn: "7d",
    });

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // MS
        httpOnly: true, // prevent xss attackss
        sameSite: "strict", // CSRF attacks cross-site request forgery attacks
        secure: process.env.NODE_ENV !== "development", // in production true
    });

    return token;
};

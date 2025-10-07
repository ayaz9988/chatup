import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI as string);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (e) {
        console.log("MongoDB connnection error:", e);
    }
};
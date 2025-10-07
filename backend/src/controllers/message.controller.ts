import { Request, Response } from "express";
import User from "../models/user.model.ts";
import Message from "../models/message.model.ts";
import { userInfo } from "os";
import cloudinary from "../lib/cloudinary.ts";
import { getReceiverSocketId, io } from "../lib/socket.ts";

export const getUsersForSidebar = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: {
        $ne: loggedInUserId,
      },
    }).select("-password");

    return res.status(200).json(filteredUsers);
  } catch (e: any) {
    console.log("Error in getUsersForSidebar controller:", e.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { id: userToChatId } = req.params;
    //@ts-expect-error it exist don't worry
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error: any) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { id: receiverId } = req.params;
    const { text, image } = req.body;

    //@ts-ignore
    const myId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId: myId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return res.status(201).json(newMessage);
  } catch (e: any) {
    console.log("Error in sendMessages controller:", e.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

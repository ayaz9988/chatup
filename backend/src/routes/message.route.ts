import express from 'express';
import { protectRoute } from '../middleware/auth.protectRoute.middleware.ts';
import { getMessages, getUsersForSidebar, sendMessage } from '../controllers/message.controller.ts';
const router = express.Router();

router.get('/users', protectRoute, getUsersForSidebar);

router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);

export default router;
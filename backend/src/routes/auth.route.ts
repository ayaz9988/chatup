import express from "express"
import { chechAuth, loginController, logoutController, signupController, updateProfileController } from "../controllers/auth.controller.ts";
import { protectRoute } from "../middleware/auth.protectRoute.middleware.ts";

const router = express.Router();

router.post('/signup', signupController);

router.post('/login', loginController);

router.post('/logout', logoutController);

router.put('/update-profile', protectRoute, updateProfileController);

router.get('/check', protectRoute, chechAuth);


export default router;
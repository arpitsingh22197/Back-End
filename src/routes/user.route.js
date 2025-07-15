import { Router } from "express";
import { logoutUser, registerUser } from "../controllers/usercontroller.js";
import { uploads } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { loginUser } from "../controllers/usercontroller.js";

import { changeCurrentPassword } from "../controllers/usercontroller.js";
import { getCurrentUser } from "../controllers/usercontroller.js";
import { getUserChannelProfile } from "../controllers/usercontroller.js";
import { getWatchHistory } from "../controllers/usercontroller.js";


const router = Router();

router.route("/register").post(
  uploads.fields([
    { name: 'avtar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  registerUser
);



router.route("/login").post(loginUser);
router.route("/reresh-token").post(verifyJWT,logoutUser)

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/change-passwoed").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/channel/:username").get(verifyJWT, getUserChannelProfile);
router.route("/watch-history").get(verifyJWT, getWatchHistory);


export default router;

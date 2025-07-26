import { Router  } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { saveOnServer } from "../middleWares/multer.middleware.js";
import { authenticate } from "../middleWares/auth.middleware.js";

const router = Router();

router.route('/register').post(
    saveOnServer.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]),
    registerUser
)
router.route('/login').post(loginUser)

router.route('/refresh-token').post(
    refreshAccessToken
)

/* Secured routes */
router.route('/logout').post(
    authenticate,
    logoutUser
)

export { router }
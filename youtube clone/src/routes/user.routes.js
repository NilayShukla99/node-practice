import { Router  } from "express";
import {
    loginUser, logoutUser, refreshAccessToken, registerUser, getCurrentUser, getAccountDetails,
    passwordChange, updateAvatar, updateCoverImage,
    updateAccountDetails
} from "../controllers/user.controller.js";
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
router.route('/logout').get(
    authenticate,
    logoutUser
)
router.route('/current-user').get(
    authenticate,
    getCurrentUser
)
router.route('/account-details').get(
    authenticate,
    getAccountDetails
).patch(
    authenticate,
    updateAccountDetails
)
router.route('/password-change').patch(
    authenticate,
    passwordChange
)
router.route('/avatar-change').patch(
    authenticate,
    saveOnServer.single('avatar'),
    updateAvatar
)
router.route('/cover-change').patch(
    authenticate,
    saveOnServer.single('coverImage'),
    updateCoverImage
)

export { router }
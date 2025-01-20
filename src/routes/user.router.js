import { Router } from 'express';
import {registerUser,loginUser,logOutUser,refreshAceesToken} from '../controllers/user.controller.js'  // Ensure this path is correct
import { upload } from "../middleware/multer.middleware.js"
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

// Register the /register route
router.route('/register').post(
    upload.fields([
        {
        name: "avtar",
        maxCount: 1
    }, {
        name: "coverImage",
        maxCount: 1
    }]
)
 ,
    registerUser)

    // login

router.route("/login").post(loginUser)


// Secured Routes
router.route("/logout").post(verifyJWT,logOutUser)
router.route("/refresh-token").post(refreshAceesToken)

export default router;

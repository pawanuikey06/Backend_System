import { Router } from 'express';
import registerUser from '../controllers/user.controller.js'  // Ensure this path is correct

import { upload } from "../middleware/multer.middleware.js"
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

export default router;

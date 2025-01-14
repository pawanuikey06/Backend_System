import { Router } from "express";
import registerUser from "./"
const router =Router();

router.route("/register").post(registerUser)


export default router;
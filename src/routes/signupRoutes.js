import { postSignIn, postSignUp } from "../controllers/signupController.js"
import { Router } from "express"
import { validateSignUp } from "../middlewares/validateSignUpMiddleware.js"
import { validateSignIn } from "../middlewares/validateSignInMiddleware.js"
const router = Router()

router.post("/sign-up",validateSignUp, postSignUp)
router.post("/sign-in",validateSignIn, postSignIn)

export default router
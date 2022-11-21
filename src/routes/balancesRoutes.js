import { postBalances, getBalances } from "../controllers/balancesController.js"
import { Router } from "express"
import { validateToken } from "../middlewares/validateTokenMiddleware.js"
import { validateNewBalance } from "../middlewares/validateNewBalanceMiddleware.js"

const router = Router()

router.use(validateToken)

router.get("/balances", getBalances)
router.post("/balances", validateNewBalance, postBalances)

export default router
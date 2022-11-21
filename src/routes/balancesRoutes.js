import { postBalances, getBalances } from "../controllers/balancesController.js"
import { Router } from "express"

const router = Router()

router.get("/balances", getBalances)
router.post("/balances", postBalances)

export default router
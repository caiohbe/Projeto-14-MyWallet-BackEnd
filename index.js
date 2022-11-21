import express from "express"
import cors from "cors"
import signUpsRouters from "./src/routes/signupRoutes.js"
import balancesRouters from "./src/routes/balancesRoutes.js"

// Configs
const app = express()
app.use(cors())
app.use(express.json())
app.use(signUpsRouters)
app.use(balancesRouters)

app.listen(5000, () => {
    console.log('Running at port 5000')
})
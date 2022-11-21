import express from "express"
import cors from "cors"
import joi from "joi"
import signUpsRouters from "./src/routes/signupRoutes.js"
import balancesRouters from "./src/routes/balancesRoutes.js"

// Configs
const app = express()
app.use(cors())
app.use(express.json())
app.use(signUpsRouters)
app.use(balancesRouters)


const signUpSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().required(),
    password: joi.string().required(),
    repeatPassword: joi.string().required()
})

const signInSchema = joi.object({
    email: joi.string().required(),
    password: joi.string().required()
})

const newBalanceSchema = joi.object({
    description: joi.string().required(),
    value: joi.number().required(),
    type: joi.string().required().valid("outcome", "income")
})

export {
    signInSchema,
    signUpSchema,
    newBalanceSchema
}

app.listen(5000, () => {
    console.log('Running at port 5000')
})
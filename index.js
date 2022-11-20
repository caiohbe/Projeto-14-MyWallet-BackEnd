import express from "express"
import cors from "cors"
import joi from "joi"
import bcrypt from "bcrypt"
import dayjs from "dayjs"
import { MongoClient } from "mongodb"
import { v4 as uuid } from "uuid"

// Configs
const app = express()
app.use(cors())
app.use(express.json())
const mongoClient = new MongoClient("mongodb://localhost:27017")
let db

try {
    await mongoClient.connect()
    db = mongoClient.db("")
} catch(err) {
    console.log(err)
}

const signUpSchema = joi.object({
    name: joi.string().alphanum().required(),
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

app.post("/sign-up", async (req, res) => {
    const body = req.body

    const password = bcrypt.hashSync(body.password, 10)

    const user = {
        name: body.name,
        email: body.email,
        password
    }

    const validation = signUpSchema.validate(body, { abortEarly: false })

    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message)
        res.status(422).send(errors)
        return
    }

    if (body.password !== body.repeatPassword) {
        res.status(409).send("As senhas precisam ser iguais.")
        return
    }

    try {
        const signUps = await db.collection("signUps").find().toArray()

        if (signUps.find(s => s.email === user.email)) {
            res.status(409).send("Usuário já cadastrado.")
            return
        }

        await db.collection("signUps").insertOne(user)
        res.sendStatus(201)

    } catch (err) {
        res.status(500).send(err.message)
    }
})

app.post("/sign-in", async (req, res) => {
    const { email, password } = req.body

    const validation = signInSchema.validate(req.body, { abortEarly: false })

    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message)
        res.status(422).send(errors)
        return
    }

    const user = await db.collection("signUps").findOne({ email })
    console.log(user)
    
    if (user && bcrypt.compareSync(password, user.password)) {
        const token = uuid()

        await db.collection("sessions").insertOne({
            userId: user._id,
            token
        })

        const resObj = {
            token,
            name: user.name
        }

        res.status(200).send(resObj)
    } else {
        res.status(401).send("Senha incorreta.")
    }
})

app.get("/balances", async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")

    if (!token) {
        res.status(404).send("Token indisponível.")
    }

    try {
        const session = await db.collection("sessions").findOne({ token })

        if (!session) {
            res.status(401).send("Token inválido.")
        }
        // console.log(session.userId)
        
        const user = await db.collection("signUps").findOne(session.userId)
        console.log(user.email)

        const balances = await db.collection("balances").find().toArray()
        const userBalances = balances.filter(b => b.from === user.email)

        res.send(userBalances)
    } catch (err) {
        res.status(500).send(err.message)
    }

    
})

app.post("/balances", async (req, res) => {
    const validation = newBalanceSchema.validate(req.body, { abortEarly: false })

    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message)
        res.status(422).send(errors)
        return
    }

    if (!req.headers.user) {
        res.status(404).send("Usuário indisponível")
        return
    }

    try {
        const user = await db.collection("signUps").find().toArray()

        if (!user.find((u) => u.email === req.headers.user)) {
            res.status(404).send("Usuário inválido")
            return
        }
    
        const newBalance = {
            ...req.body,
            from: req.headers.user,
            date: dayjs(Date.now()).format("DD/MM")
        }
    
        await db.collection("balances").insertOne(newBalance)
        res.sendStatus(200)

    } catch (err) {
        res.status(500).send(err.message)
    }
})

app.listen(5000, () => {
    console.log('Running at port 5000')
})
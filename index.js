import express from "express"
import cors from "cors"
import joi from "joi"
import bcrypt from "bcrypt"
import { MongoClient } from "mongodb"

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
    
    if (user && bcrypt.compareSync(password, user.password)) {
        res.status(200).send("Deu certo")
    } else {
        res.status(401).send("Senha incorreta.")
    }
})

app.listen(5000, () => {
    console.log('Running at port 5000')
})
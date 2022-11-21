import bcrypt from "bcrypt"
import { v4 as uuid } from "uuid"
import { signInSchema, signUpSchema } from "../../index.js"
import db from "../database/db.js"

export async function postSignUp (req, res) {
    const body = req.body

    const validation = signUpSchema.validate(body, { abortEarly: false })

    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message)
        res.status(422).send(errors)
        return
    }

    const password = bcrypt.hashSync(body.password, 10)

    const user = {
        name: body.name,
        email: body.email,
        password
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
}

export async function postSignIn (req, res) {
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
}
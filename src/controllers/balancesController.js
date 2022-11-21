import dayjs from "dayjs"
import { newBalanceSchema } from "../../index.js"
import db from "../database/db.js"

export async function getBalances (req, res) {
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
        
        const user = await db.collection("signUps").findOne(session.userId)

        const balances = await db.collection("balances").find().toArray()
        const userBalances = balances.filter(b => b.from === user.email)

        res.send(userBalances)
    } catch (err) {
        res.status(500).send(err.message)
    }
}

export async function postBalances (req, res) {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")
    const validation = newBalanceSchema.validate(req.body, { abortEarly: false })

    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message)
        res.status(422).send(errors)
        return
    }

    if (!token) {
        res.status(404).send("Token indisponível.")
    }

    try {
        const session = await db.collection("sessions").findOne({ token })

        if (!session) {
            res.status(401).send("Token inválido.")
        }
        
        const user = await db.collection("signUps").findOne(session.userId)

        const newBalance = {
            ...req.body,
            from: user.email,
            date: dayjs(Date.now()).format("DD/MM")
        }
    
        await db.collection("balances").insertOne(newBalance)
        res.sendStatus(200)

    } catch (err) {
        res.status(500).send(err.message)
    }
}
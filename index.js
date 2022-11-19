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

app.listen(5000, () => {
    console.log('Running at port 5000')
})
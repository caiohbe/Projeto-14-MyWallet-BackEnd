import { MongoClient } from "mongodb"

const mongoClient = new MongoClient("mongodb://localhost:27017")
let db

try {
    await mongoClient.connect()
    db = mongoClient.db("")
} catch(err) {
    console.log(err)
}

export default db
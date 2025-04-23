const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGO_URL = 'mongodb+srv://naftifine:MultidisciplinaryProject@cluster0.awng8.mongodb.net/SmartFarm?retryWrites=true&w=majority&appName=cluster0' ;

let client;
let db;

async function connectDB(dbName) {
    try {
        if (!client) {
            client = new MongoClient(MONGO_URL);
            await client.connect();
            console.log('Connected to MongoDB');
        }
        db = client.db(dbName);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

function getDB() {
    if (!db) {
        throw new Error('Database not initialized. Call connectDB first.');
    }
    return db;
}

module.exports = { connectDB, getDB };

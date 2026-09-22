/*
 * db.js — one MongoClient for the whole process.
 *
 * The exam manual is explicit about this: "Reuse the same MongoClient instead of
 * creating a new connection for every request." The driver keeps an internal
 * connection pool, so opening a client per request is both slower and a leak.
 * Reference: https://www.mongodb.com/docs/drivers/node/current/connect/mongoclient/
 */

const { MongoClient } = require("mongodb");

// Connection details come straight from the exam paper's "MongoDB Information"
// section. Overridable by environment variable so the examiner can point the app
// at a different server without editing code.
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017";
const DB_NAME = process.env.DB_NAME || "notes_lab";
const COLLECTION_NAME = process.env.COLLECTION_NAME || "notes";

const client = new MongoClient(MONGO_URL);

let database = null;
let notesCollection = null;

async function connectDB() {
    await client.connect();

    // Fail fast and loudly if the server is not actually reachable — `connect()`
    // alone can resolve optimistically, a ping cannot.
    await client.db(DB_NAME).command({ ping: 1 });

    database = client.db(DB_NAME);
    notesCollection = database.collection(COLLECTION_NAME);

    // Indexes that match how the app actually queries: newest-first listing, and
    // the category filter. Creating them is idempotent.
    await notesCollection.createIndex({ createdAt: -1 });
    await notesCollection.createIndex({ category: 1 });

    console.log(`Connected to MongoDB at ${MONGO_URL}`);
    console.log(`Using database "${DB_NAME}", collection "${COLLECTION_NAME}"`);

    return notesCollection;
}

function getCollection() {
    if (!notesCollection) {
        throw new Error("Database not connected yet — call connectDB() first.");
    }
    return notesCollection;
}

function getDatabase() {
    if (!database) {
        throw new Error("Database not connected yet — call connectDB() first.");
    }
    return database;
}

async function closeDB() {
    await client.close();
}

module.exports = {
    client,
    connectDB,
    getCollection,
    getDatabase,
    closeDB,
    MONGO_URL,
    DB_NAME,
    COLLECTION_NAME,
};

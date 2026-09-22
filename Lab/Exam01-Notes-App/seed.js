/*
 * seed.js — optional helper, not part of the exam requirements.
 *
 *   npm run seed     insert a few sample notes so the list page is not empty
 *   npm run clear    empty the collection again
 *
 * Useful for a demo, and for leaving the database clean afterwards.
 */

const { connectDB, getCollection, closeDB, DB_NAME, COLLECTION_NAME } = require("./db");

const SAMPLES = [
    {
        title: "Backend Lab",
        content: "Complete the Notes application.",
        category: "Study",
    },
    {
        title: "MongoDB CRUD operations",
        content:
            "insertOne, find, updateOne, deleteOne.\nThe driver returns a cursor from find() — call toArray() to get documents.",
        category: "Study",
    },
    {
        title: "Server-side rendering",
        content:
            "EJS builds the HTML on the server and sends finished markup to the browser. No client-side framework is involved.",
        category: "Ideas",
    },
    {
        title: "Submit the exam folder",
        content: "Source code, templates, CSS, screenshot and README.",
        category: "Urgent",
    },
];

async function main() {
    const clear = process.argv.includes("--clear");

    await connectDB();
    const notes = getCollection();

    if (clear) {
        const result = await notes.deleteMany({});
        console.log(`Deleted ${result.deletedCount} note(s) from ${DB_NAME}.${COLLECTION_NAME}`);
    } else {
        const now = Date.now();
        const documents = SAMPLES.map((note, i) => ({
            ...note,
            // Spread the timestamps a few minutes apart so the newest-first sort
            // has something meaningful to order by.
            createdAt: new Date(now - (SAMPLES.length - i) * 7 * 60 * 1000),
        }));

        const result = await notes.insertMany(documents);
        console.log(`Inserted ${result.insertedCount} note(s) into ${DB_NAME}.${COLLECTION_NAME}`);
    }

    await closeDB();
}

main().catch((err) => {
    console.error(err.message);
    process.exit(1);
});

/*
 * My Notes — Backend Development Lab Examination 01
 * Stack: Option A — Node.js + Express.js + EJS + MongoDB Node.js Driver
 *
 * Compulsory requirements covered:
 *   1. Display all notes (title, content, category, creation date, delete button)
 *   2. Add a note via an HTML form, with server-side validation
 *   3. Delete a note
 *   4. Server-side rendering with EJS
 *
 * Bonus requirements — all four implemented:
 *   - Edit an existing note      (GET /notes/:id/edit, POST /notes/:id)
 *   - Search notes by title      (GET /notes?q=...)
 *   - Filter notes by category   (GET /notes?category=...)
 *   - Improved interface with hand-written CSS (public/css/style.css, no CDN)
 *
 * Extra, for the viva: GET /db renders a live inspector of the MongoDB server,
 * and GET /api/notes returns the raw documents as JSON.
 */

const path = require("path");
const express = require("express");
const { ObjectId } = require("mongodb");

const {
    connectDB,
    getCollection,
    getDatabase,
    client,
    MONGO_URL,
    DB_NAME,
    COLLECTION_NAME,
} = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

/* ------------------------------------------------------------------ *
 * Express configuration
 * ------------------------------------------------------------------ */

// EJS as the server-side template engine.
// Reference: https://expressjs.com/en/guide/using-template-engines/
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Parse HTML form submissions (application/x-www-form-urlencoded).
app.use(express.urlencoded({ extended: true }));

// Serve the stylesheet from public/.
app.use(express.static(path.join(__dirname, "public")));

// Values every template needs, set once instead of in each render call.
app.use((req, res, next) => {
    res.locals.currentPath = req.path;
    res.locals.dbName = DB_NAME;
    res.locals.collectionName = COLLECTION_NAME;
    next();
});

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

const CATEGORIES = ["General", "Study", "Work", "Personal", "Ideas", "Urgent"];

const MAX_TITLE = 120;
const MAX_CONTENT = 2000;
const MAX_CATEGORY = 40;

/**
 * Server-side validation of the note form.
 * Returns { values, errors } — errors is an object keyed by field name, so the
 * template can show the message next to the field that caused it.
 */
function validateNote(body) {
    const values = {
        title: (body.title || "").trim(),
        content: (body.content || "").trim(),
        category: (body.category || "").trim() || "General",
    };

    const errors = {};

    if (!values.title) {
        errors.title = "Title is required.";
    } else if (values.title.length > MAX_TITLE) {
        errors.title = `Title must be ${MAX_TITLE} characters or fewer.`;
    }

    if (!values.content) {
        errors.content = "Content is required.";
    } else if (values.content.length > MAX_CONTENT) {
        errors.content = `Content must be ${MAX_CONTENT} characters or fewer.`;
    }

    if (values.category.length > MAX_CATEGORY) {
        errors.category = `Category must be ${MAX_CATEGORY} characters or fewer.`;
    }

    return { values, errors };
}

/**
 * A 24-character hex string is the only thing `new ObjectId()` accepts. Anything
 * else (a truncated id, a hand-typed URL) would throw deep inside the driver, so
 * it is rejected here and turned into a clean 404 instead of a 500.
 */
function toObjectId(id) {
    return ObjectId.isValid(id) && String(new ObjectId(id)) === id
        ? new ObjectId(id)
        : null;
}

/** Escape a user string so it can be used literally inside a RegExp. */
function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Wrap an async route handler so a rejected promise reaches the error handler. */
function wrap(handler) {
    return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

/* ------------------------------------------------------------------ *
 * Routes — notes
 * ------------------------------------------------------------------ */

// Home page redirects to the notes list, so both "/" and "/notes" work.
app.get("/", (req, res) => res.redirect("/notes"));

/**
 * GET /notes — display all notes.
 * Optional query parameters power the two search/filter bonus requirements:
 *   ?q=text        search by title (case-insensitive, substring)
 *   ?category=name filter by exact category
 */
app.get(
    "/notes",
    wrap(async (req, res) => {
        const notes = getCollection();

        const search = (req.query.q || "").trim();
        const category = (req.query.category || "").trim();

        const filter = {};
        if (search) {
            filter.title = { $regex: escapeRegex(search), $options: "i" };
        }
        if (category) {
            filter.category = category;
        }

        // Newest note first.
        const results = await notes.find(filter).sort({ createdAt: -1 }).toArray();

        // Category list for the filter dropdown, built from what is actually in
        // the database plus the suggested defaults.
        const used = await notes.distinct("category");
        const allCategories = [...new Set([...CATEGORIES, ...used.filter(Boolean)])].sort();

        const totalCount = await notes.countDocuments();

        res.render("notes", {
            title: "All notes",
            notes: results,
            search,
            category,
            allCategories,
            totalCount,
            filtered: Boolean(search || category),
        });
    })
);

// GET /notes/new — the add-note form.
app.get("/notes/new", (req, res) => {
    res.render("form", {
        title: "Add a Note",
        mode: "create",
        action: "/notes",
        values: { title: "", content: "", category: "General" },
        errors: {},
        categories: CATEGORIES,
    });
});

/**
 * POST /notes — validate, insert, then redirect to the list.
 * Redirect-after-POST, so a browser refresh does not insert the note twice.
 */
app.post(
    "/notes",
    wrap(async (req, res) => {
        const { values, errors } = validateNote(req.body);

        if (Object.keys(errors).length > 0) {
            // Re-render the form with the submitted values kept, so nothing the
            // user typed is lost. 422 = the request was well-formed but invalid.
            return res.status(422).render("form", {
                title: "Add a Note",
                mode: "create",
                action: "/notes",
                values,
                errors,
                categories: CATEGORIES,
            });
        }

        await getCollection().insertOne({
            title: values.title,
            content: values.content,
            category: values.category,
            createdAt: new Date(),
        });

        res.redirect("/notes");
    })
);

// GET /notes/:id/edit — the edit form (bonus requirement).
app.get(
    "/notes/:id/edit",
    wrap(async (req, res, next) => {
        const _id = toObjectId(req.params.id);
        if (!_id) return next();

        const note = await getCollection().findOne({ _id });
        if (!note) return next();

        res.render("form", {
            title: "Edit Note",
            mode: "edit",
            action: `/notes/${note._id}`,
            values: {
                title: note.title,
                content: note.content,
                category: note.category,
            },
            errors: {},
            categories: CATEGORIES,
            note,
        });
    })
);

// POST /notes/:id — save an edit (bonus requirement).
app.post(
    "/notes/:id",
    wrap(async (req, res, next) => {
        const _id = toObjectId(req.params.id);
        if (!_id) return next();

        const { values, errors } = validateNote(req.body);

        if (Object.keys(errors).length > 0) {
            return res.status(422).render("form", {
                title: "Edit Note",
                mode: "edit",
                action: `/notes/${req.params.id}`,
                values,
                errors,
                categories: CATEGORIES,
                note: { _id },
            });
        }

        const result = await getCollection().updateOne(
            { _id },
            {
                $set: {
                    title: values.title,
                    content: values.content,
                    category: values.category,
                    updatedAt: new Date(),
                },
            }
        );

        if (result.matchedCount === 0) return next();

        res.redirect("/notes");
    })
);

/**
 * POST /notes/:id/delete — delete a note.
 * A POST, not a GET: deleting is not a safe method, and a GET link would be
 * followed by browser prefetchers and crawlers.
 */
app.post(
    "/notes/:id/delete",
    wrap(async (req, res, next) => {
        const _id = toObjectId(req.params.id);
        if (!_id) return next();

        const result = await getCollection().deleteOne({ _id });
        if (result.deletedCount === 0) return next();

        res.redirect("/notes");
    })
);

/* ------------------------------------------------------------------ *
 * Routes — inspection (not required by the exam; useful during the viva)
 * ------------------------------------------------------------------ */

// GET /api/notes — the raw documents, exactly as MongoDB returns them.
app.get(
    "/api/notes",
    wrap(async (req, res) => {
        const notes = await getCollection().find().sort({ createdAt: -1 }).toArray();
        res.json({ database: DB_NAME, collection: COLLECTION_NAME, count: notes.length, notes });
    })
);

// GET /db — a live view of the MongoDB server this app is talking to.
app.get(
    "/db",
    wrap(async (req, res) => {
        const collection = getCollection();
        const database = getDatabase();

        const [documents, indexes, collections, admin] = await Promise.all([
            collection.find().sort({ createdAt: -1 }).toArray(),
            collection.indexes(),
            database.listCollections().toArray(),
            client
                .db()
                .admin()
                .listDatabases()
                .catch(() => ({ databases: [] })),
        ]);

        const stats = await database
            .command({ collStats: COLLECTION_NAME })
            .catch(() => null);

        const buildInfo = await client
            .db()
            .admin()
            .command({ buildInfo: 1 })
            .catch(() => null);

        res.render("db", {
            title: "Database Inspector",
            mongoUrl: MONGO_URL,
            documents,
            indexes,
            collections,
            databases: admin.databases || [],
            stats,
            serverVersion: buildInfo ? buildInfo.version : "unknown",
            driverVersion: require("mongodb/package.json").version,
            nodeVersion: process.version,
            expressVersion: require("express/package.json").version,
            ejsVersion: require("ejs/package.json").version,
        });
    })
);

/* ------------------------------------------------------------------ *
 * Error handling
 * ------------------------------------------------------------------ */

// Anything that fell through the routes above, plus every next() used for a
// missing or malformed note id.
app.use((req, res) => {
    res.status(404).render("error", {
        title: "Not Found",
        status: 404,
        message: "That page or note does not exist.",
        detail: `No route matched ${req.method} ${req.originalUrl}`,
    });
});

// Four arguments: Express identifies the error handler by its arity.
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).render("error", {
        title: "Server Error",
        status: 500,
        message: "Something went wrong on the server.",
        detail: err.message,
    });
});

/* ------------------------------------------------------------------ *
 * Startup — connect to MongoDB first, then start listening
 * ------------------------------------------------------------------ */

connectDB()
    .then(() => {
        const server = app.listen(PORT, () => {
            console.log(`My Notes running at http://localhost:${PORT}`);
        });

        // Another process on the port is the most likely startup failure on a
        // lab machine — say so plainly instead of throwing a stack trace.
        server.on("error", (err) => {
            if (err.code === "EADDRINUSE") {
                console.error(`Port ${PORT} is already in use.`);
                console.error(`Start on a different port, e.g.  PORT=3001 npm start`);
                process.exit(1);
            }
            throw err;
        });
    })
    .catch((err) => {
        console.error("Could not connect to MongoDB — is the server running?");
        console.error(`Tried: ${MONGO_URL}`);
        console.error(err.message);
        process.exit(1);
    });

# Exam 01 — My Notes

**Backend Development Lab Examination** · CSFS3008P · B.Tech Full Stack, Semester 5 · UPES
Student: Suryansh Mishra (`smirk-dev`) · Instructor: Dr. Prateek Raj Gautam

A **Notes Management Application** — add, view, edit and delete notes stored in MongoDB,
rendered entirely on the server with EJS.

**Stack: Option A** — Node.js + Express.js + EJS + the official MongoDB Node.js driver.

---

## Run it

MongoDB must be running on `127.0.0.1:27017`. On this machine it already is, as the Windows
service named `MongoDB` (`Get-Service MongoDB` → `Running`), so there is nothing to install
or start.

```bash
cd Exam01-Notes-App
npm install            # express, ejs, mongodb
npm start              # → http://localhost:3000
```

Then open <http://localhost:3000>.

Optional helpers:

```bash
npm run seed           # insert four sample notes, so the list page is not empty
npm run clear          # empty the collection again
PORT=3021 npm start    # run on another port if 3000 is taken
```

The port, connection URL, database and collection can all be overridden by environment
variable (`PORT`, `MONGO_URL`, `DB_NAME`, `COLLECTION_NAME`); the defaults are exactly the
values given in the exam paper.

---

## Where everything is

```
Exam01-Notes-App/
├── app.js                      # routes, validation, error handling, startup
├── db.js                       # the single shared MongoClient
├── seed.js                     # optional sample data / cleanup helper
├── package.json
├── views/                      # EJS server-side templates
│   ├── notes.ejs               # list, search box, category filter, delete buttons
│   ├── form.ejs                # add + edit form (one template, two modes)
│   ├── db.ejs                  # live database inspector
│   ├── error.ejs               # 404 / 500 page
│   └── partials/
│       ├── header.ejs          # doctype, nav — included by every page
│       └── footer.ejs
├── public/css/style.css        # hand-written CSS, no framework, no CDN
└── screenshots/                # the running application
```

## Routes

| Method | Route               | Purpose                                             |
| ------ | ------------------- | --------------------------------------------------- |
| `GET`  | `/`                 | Redirect to `/notes`                                 |
| `GET`  | `/notes`            | Display all notes · `?q=` search · `?category=` filter |
| `GET`  | `/notes/new`        | Add-note form                                        |
| `POST` | `/notes`            | Validate and insert a note, then redirect            |
| `GET`  | `/notes/:id/edit`   | Edit form *(bonus)*                                  |
| `POST` | `/notes/:id`        | Update a note *(bonus)*                              |
| `POST` | `/notes/:id/delete` | Delete a note                                        |
| `GET`  | `/api/notes`        | The raw documents as JSON *(extra)*                  |
| `GET`  | `/db`               | Live database inspector *(extra)*                    |

The four suggested routes in the exam paper are all present with exactly the suggested
method and path.

## Document shape

```json
{
  "_id":       "ObjectId",
  "title":     "Backend Lab",
  "content":   "Complete the Notes application.",
  "category":  "Study",
  "createdAt": "2026-09-22T08:47:51.767Z",
  "updatedAt": "2026-09-22T09:15:15.995Z"
}
```

`updatedAt` is written only when a note is edited, so an untouched note keeps exactly the
shape the exam paper suggests.

---

## Requirements checklist

### Compulsory

| # | Requirement | Where |
| - | ----------- | ----- |
| 1 | Display all notes with title, content, category, creation date, delete button | [`views/notes.ejs`](views/notes.ejs), `GET /notes` in [`app.js`](app.js) |
| 1 | Suitable message when no notes exist | `.empty` block in [`views/notes.ejs`](views/notes.ejs) — separate wording for "no notes at all" and "nothing matched the search" |
| 2 | Form with title, content, category | [`views/form.ejs`](views/form.ejs), `GET /notes/new` |
| 2 | Validate title and content are not empty | `validateNote()` in [`app.js`](app.js) — server-side, trims whitespace |
| 2 | Insert into MongoDB, then redirect | `POST /notes` → `insertOne()` → `res.redirect("/notes")` |
| 3 | Delete button removes the note from MongoDB | `POST /notes/:id/delete` → `deleteOne()` |
| 4 | Pages rendered with EJS | every response uses `res.render()`; there is no client-side JavaScript except one `confirm()` on the delete button |

### Bonus — all four implemented

| Bonus | Where |
| ----- | ----- |
| Edit an existing note | `GET /notes/:id/edit` + `POST /notes/:id`, reusing `form.ejs` in `edit` mode |
| Search notes by title | `GET /notes?q=` — case-insensitive substring, regex metacharacters escaped |
| Filter notes by category | `GET /notes?category=` — dropdown built from `distinct("category")`, so it always matches what is actually in the database |
| Improve the interface using CSS | [`public/css/style.css`](public/css/style.css) — hand-written, ~330 lines, responsive, no Bootstrap and no CDN |

---

## Design decisions worth explaining

**One `MongoClient` for the process, not one per request.** The exam paper says so explicitly,
and it is what the driver documentation recommends — the client maintains an internal
connection pool, so a new client per request both leaks sockets and adds a handshake to every
page load. It lives in [`db.js`](db.js) and is shared by every route.

**`connectDB()` finishes before `app.listen()`.** If Mongo is unreachable the process prints a
clear message and exits, rather than starting a server whose every route would throw.

**Validation is server-side.** The form carries `novalidate`, so the browser does not hide the
real check — the server trims and rejects, re-renders the form with a 422, and keeps what the
user typed so nothing is lost. Length caps (120 / 2000 / 40) stop an oversized document being
written.

**Delete is a `POST`, not a `GET` link.** `GET` is meant to be safe; a delete link would be
followed by browser prefetchers, crawlers and the back button.

**Redirect after POST.** Every successful write ends in `res.redirect()`, so a refresh does
not re-submit the form.

**Bad `_id`s produce a 404, not a 500.** `new ObjectId("abc")` throws inside the driver, so
ids are checked with `ObjectId.isValid()` first and anything else falls through to the 404
handler.

**Search input is escaped before it reaches the regex.** Without `escapeRegex()`, a search for
`.*` would match everything and a malformed pattern would crash the query.

**Output is escaped by EJS.** Every value uses `<%= %>` (escaping), never `<%- %>` (raw), so a
note titled `<script>alert(1)</script>` is displayed as text — verified below.

**Indexes match the queries.** `{ createdAt: -1 }` for the newest-first listing and
`{ category: 1 }` for the filter, created idempotently on startup.

---

## Seeing the backend and the database

Three ways, all live:

1. **`/db` in the browser** — the connection URL, every database on the server, the
   collections in `notes_lab`, the indexes, collection storage stats, the raw documents as
   JSON, and a table of every route this server exposes.
2. **`/api/notes`** — the documents exactly as the driver returns them.
3. **`mongosh` or MongoDB Compass**, against the same `mongodb://127.0.0.1:27017`:

```bash
mongosh
use notes_lab
db.notes.find().pretty()
db.notes.countDocuments()
db.notes.getIndexes()
```

The server also logs its connection to the terminal on startup:

```
Connected to MongoDB at mongodb://127.0.0.1:27017
Using database "notes_lab", collection "notes"
My Notes running at http://localhost:3000
```

Note that `/db` lists every database on the local server, including unrelated ones from other
projects on this machine. That is deliberate for the viva — it proves the app is talking to a
real MongoDB instance and not a mock — but it is a debugging page, not something that belongs
on a server anyone else can reach.

---

## Screenshots

| File | What it shows |
| ---- | ------------- |
| [`screenshots/01-notes-list.png`](screenshots/01-notes-list.png) | The notes list — title, content, category, creation date and a delete button on each note |
| [`screenshots/02-add-note-form.png`](screenshots/02-add-note-form.png) | The add-note form |
| [`screenshots/03-database-inspector.png`](screenshots/03-database-inspector.png) | `/db` — the live MongoDB connection, databases, indexes and raw documents |
| [`screenshots/04-search-and-filter.png`](screenshots/04-search-and-filter.png) | Search by title combined with a category filter |
| [`screenshots/05-validation-error.png`](screenshots/05-validation-error.png) | Submitting an empty form — the validation messages |

---

## Checks run

Every route was exercised against a live server (`PORT=3021`) and a real local MongoDB
instance — not mocked. Real request/response pairs:

```
GET /                                 302 → Location: /notes
GET /notes            (empty db)      200, body contains "No notes yet."
POST /notes  title=Backend Lab …      302 → /notes
GET /notes                            200, renders "Backend Lab" / tag "Study" / <time datetime="2026-09-22T09:14:36.246Z">
POST /notes  title="   "              422, body contains "Title is required." and keeps the submitted content
POST /notes  content=""               422, body contains "Content is required." and value="Only a title"
POST /notes  category=""              inserted with category "General"
GET /notes?q=groceries                200, 1 of 4 notes → "Buy groceries"
GET /notes?q=GROCER                   200, same note (case-insensitive)
GET /notes?q=.*                       200, "No notes match this search"  (regex escaped, not interpreted)
GET /notes?category=Study             200, "Backend Lab"
GET /notes?q=lab&category=Study       200, "Backend Lab"  (search + filter combined)
GET /notes?q=zzzznothing              200, "No notes match this search"
GET /notes/<id>/edit                  200, form pre-filled with the stored title/content/category
POST /notes/<id>                      302 → /notes; list then shows the new title and "· edited"
                                      createdAt unchanged 09:14:36.246Z, updatedAt added 09:15:15.995Z
POST /notes/<id>  title=""            422 (edit path validates too)
POST /notes/<id>/delete               302 → /notes; count drops from 4 to 3
POST /notes/<id>/delete  (again)      404
GET /notes/not-an-objectid/edit       404  (malformed id, not a 500)
POST /notes/12345/delete              404
GET /nope                             404, "That page or note does not exist."
GET /css/style.css                    200, text/css, 9668 bytes
POST /notes title=<script>alert(1)</script>
GET /notes                            renders &lt;script&gt;alert(1)&lt;/script&gt; as text — not executed
GET /db                               200, shows mongodb://127.0.0.1:27017, notes_lab, indexes createdAt_-1 and category_1
GET /api/notes                        200, application/json
```

Independently confirmed in `mongosh` afterwards — that is, not merely trusting the HTTP
responses:

```
collections: notes
count: 4
indexes: [ '_id_', 'createdAt_-1', 'category_1' ]
```

Rendering was checked in headless Chrome over the DevTools protocol on all five pages:
stylesheet applied (`background-color: rgb(250, 247, 242)`), no horizontal overflow, no broken
images, four `.note` elements on the list page and one on the filtered page.

---

## Sources and references

Written from the exam paper's own hints plus the official documentation below. No third-party
starter template or tutorial repository was copied.

**The exam paper**
- Exam 01 lab manual — <https://upessocs.github.io/#dir=/Lectures/Backend%20Development/Lab/&file=Exam%2001.md>
  (raw markdown: <https://upessocs.github.io/Lectures/Backend%20Development/Lab/Exam%2001.md>,
  source repo <https://github.com/upessocs/Lectures>). The connection snippet, the suggested
  routes table and the suggested document shape are taken from it directly.

**Official documentation**
- MongoDB Node.js driver — connect with `MongoClient`: <https://www.mongodb.com/docs/drivers/node/current/connect/mongoclient/>
- MongoDB Node.js driver — CRUD: <https://www.mongodb.com/docs/drivers/node/current/crud/>
- MongoDB manual — `$regex`: <https://www.mongodb.com/docs/manual/reference/operator/query/regex/>
- MongoDB manual — `distinct`: <https://www.mongodb.com/docs/manual/reference/command/distinct/>
- Express — using template engines: <https://expressjs.com/en/guide/using-template-engines/>
- Express — routing: <https://expressjs.com/en/guide/routing.html>
- Express — error handling: <https://expressjs.com/en/guide/error-handling.html>
- Express — `express.urlencoded` and `express.static`: <https://expressjs.com/en/4x/api.html>
- EJS — tags and includes: <https://ejs.co/#docs>
- MDN — POST/Redirect/GET and safe methods: <https://developer.mozilla.org/en-US/docs/Glossary/Safe/HTTP>
- MDN — `<datalist>`: <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist>

**Prior work in this repository, reused as a pattern**
- [`../Exp12-NodeJS-Express-EJS/`](../Exp12-NodeJS-Express-EJS/) — Express routing and EJS layout conventions
- [`../Exp13A-MongoDB-Mongoose-UserAuth/`](../Exp13A-MongoDB-Mongoose-UserAuth/) — connecting to this machine's local MongoDB
- [`../Exp01-HTML5-Elements/`](../Exp01-HTML5-Elements/) — the visual register (warm paper, one accent, serif headings, no CDN assets)

---

## Not included, on purpose

The exam paper states: *"Authentication, REST APIs, user accounts, and frontend frameworks are
not required."* There is no login, no session, no React, no Bootstrap. `/api/notes` exists only
as a debugging view of the same data, not as an API surface the pages depend on — every page is
rendered on the server.

# Experiment 13 A — Express + Mongoose User Registration and Login System

Backend Development (CSFS3008P) · B.Tech Full Stack, Semester 5 · Suryansh

## What it is

The manual's tutorial, end to end: a MongoDB-backed user management system built with
Express and Mongoose — schema, model, signup, login, and a page listing every registered
user, run against a real local MongoDB instance.

- a **schema** (`userSchema`) is the blueprint for what a user document looks like;
- a **model** (`User = mongoose.model('User', userSchema)`) is the interface Express uses
  to create, find, and list those documents;
- Mongoose turns the model name `User` into the collection `users`, inside the `userdb`
  database — exactly what shows up in MongoDB Compass once you connect it to
  `mongodb://localhost:27017`.

## Running it

Requires a MongoDB server reachable at `mongodb://localhost:27017` — on this machine that
is the local **MongoDB** Windows service (the same one MongoDB Compass connects to), which
was confirmed running on port 27017 before this was built.

```bash
cd Exp13A-MongoDB-Mongoose-UserAuth
npm install
npm start   # -> http://localhost:3000
```

Then open <http://localhost:3000>, or open MongoDB Compass and connect to
`mongodb://localhost:27017` to watch the `userdb.users` collection fill up as you use the
forms.

## Files

| Path | What is in it |
|------|----------------|
| `server.js` | The manual's complete code: connection, schema, model, and all four routes. |
| `package.json` | `start` runs `node server.js`; dependencies: `express`, `mongoose`. |

The only deviation from the manual's code is `process.env.PORT || 3000` (so it can be run
on an alternate port during testing without colliding with other experiments' servers);
the connection string, schema, model, and every route are otherwise verbatim.

## Routes

| Route | Behaviour |
|-------|-----------|
| `GET /` | Home page: signup form, login form, and a "show all users" button. |
| `POST /signup` | Creates a `User` document and saves it. Duplicate `username`/`email` is caught via Mongo's unique-index error (code `11000`) and reported without crashing the process. |
| `POST /login` | `User.findOne({ username })`, then a plain `===` check against the stored password. Distinguishes "user not found" from "incorrect password" (a real deployment would not — see Security notes below). |
| `GET /users` | `User.find()` and lists everyone registered, with their join date. |

## Key Mongoose pieces in `server.js`

- **Connect**: `mongoose.connect(DB_URL)` against `mongodb://localhost:27017/userdb` —
  Option A (local) from the manual, active; Option B (Atlas) left commented out as the
  manual has it.
- **Schema**: `username` and `email` are `required` and `unique`; `createdAt` defaults to
  `Date.now`.
- **Model**: `mongoose.model('User', userSchema)` — the name `User` becomes the
  collection `users` (lowercased, pluralized) inside `userdb`.
- **Write**: `new User({...}); await newUser.save()`.
- **Read**: `User.findOne({ username })` for login, `User.find()` for the listing.
- **Duplicate-key handling**: `error.code === 11000` catches the unique-index violation
  from `username`/`email` and turns it into a friendly message instead of a 500.

## Checks run

MongoDB confirmed running locally first (`Get-Service MongoDB` → `Running`, port 27017
accepting connections). The server was then started on an alternate port
(`PORT=3013 node server.js`, to avoid colliding with other experiments' dev servers) and
every route was exercised with `curl` against the live server and real database —
actual responses:

```
GET  /                                          -> HTTP 200 (home page with both forms)
GET  /users               (before any signup)   -> "No users registered yet"

POST /signup  suryansh / suryansh@inboxkit.com   -> "User registered successfully! Username: suryansh ..."
POST /signup  suryansh again (dup username)      -> "Error: Username or email already exists"
POST /signup  riya / riya@example.com            -> "User registered successfully! Username: riya ..."

POST /login   suryansh / secret123 (correct)     -> "Login successful! Welcome back, suryansh! ... Account created: Tue Sep 15 2026"
POST /login   suryansh / wrongpass                -> "Incorrect password"
POST /login   nobody / whatever                   -> "User not found"

GET  /users                (after signups)        -> lists suryansh and riya, each with email and join date
```

`mongosh` against the same database, confirming Compass would show exactly this:

```
Database: userdb
Collections: ["users"]

users.find():
[
  { username: 'suryansh', email: 'suryansh@inboxkit.com', password: 'secret123', createdAt: 2026-09-15T09:49:40.120Z, ... },
  { username: 'riya',     email: 'riya@example.com',      password: 'pass456',   createdAt: 2026-09-15T09:49:40.408Z, ... }
]

users.getIndexes():
[
  { key: { _id: 1 },      name: '_id_' },
  { key: { username: 1 }, name: 'username_1', unique: true },
  { key: { email: 1 },    name: 'email_1',    unique: true }
]
```

The unique indexes are what actually rejects the duplicate-username signup above — the
schema's `unique: true` creates them, and Mongoose surfaces the resulting Mongo error as
code `11000`.

Test data (`suryansh`, `riya`) was deleted from `userdb.users` afterwards via `mongosh`, so
the database is empty and ready for fresh use. The server was stopped cleanly; nothing is
left listening on port 3013 or 3000.

## Security notes (as the manual flags them)

This is the tutorial's code, unmodified in substance, so its known limitations carry over
deliberately:

- **Passwords are stored in plain text** and compared with `===`. The manual calls this
  out explicitly as a "learning example" and lists bcrypt as a next step, not a
  requirement — see [[Exp12B-State-Management]]'s `README.md` for that pattern (bcryptjs
  hash-on-register, `compare`-on-login) already done in this repo.
- **Login leaks which usernames exist** ("User not found" vs "Incorrect password") — again
  matching the manual as written.
- No session/cookie is issued on login; each request is independent, so "login" here only
  proves the credentials matched once. `Exp12B-State-Management` is the experiment that
  adds sessions on top of a login flow like this one.

These were left as the manual specifies rather than "fixed," since Experiment 13 B (the
optional follow-on, not part of this task) is where the manual itself extends this into a
fuller registration + to-do app.

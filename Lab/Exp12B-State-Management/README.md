# Experiment 12 B (Optional) — State Management: Sessions and Cookies

Backend Development (CSFS3008P) · B.Tech Full Stack, Semester 5 · Suryansh

## What it is

The whole of the manual's optional Experiment 12 B, end to end: the three walkthrough
demos exactly as written, plus both lab assignments and both of their optional
challenges.

HTTP is stateless — nothing in a request says who sent it. The two ways round that are
demonstrated side by side throughout:

- a **cookie** holds its value in the browser and ships it on every request, so it suits
  preferences and nothing else;
- a **session** keeps the value on the server and gives the browser only a signed session
  ID (`connect.sid`), so it is where anything that matters goes.

## Running it

```bash
cd Exp12B-State-Management
npm install

npm start              # the lab assignment app  ->  http://localhost:3000

npm run session-demo   # manual Part 1  ->  http://localhost:3000
npm run cookie-demo    # manual Part 2  ->  http://localhost:3000
npm run combined-demo  # manual §5      ->  http://localhost:3000
```

All four default to port 3000, as the manual does, so run one at a time — or set `PORT`
to run several together:

```bash
PORT=3001 npm run session-demo
```

## Files

| Path | What is in it |
|------|---------------|
| `Source/session-example.js` | Part 1 — session visit counter and `/destroy`. The manual's code. |
| `Source/cookie-example.js` | Part 2 — `/set-cookie`, `/get-cookie`, `/delete-cookie`. The manual's code. |
| `Source/server.js` | §5 — the walkthrough that uses a session and a cookie together. The manual's code. |
| `app.js` | The lab assignment: both exercises and both optional challenges. |
| `views/` | EJS templates for the assignment app, plus a shared header/footer partial. |
| `public/styles.css` | Two palettes selected by `data-theme`, which the server sets from the cookie. |
| `data/users.json` | The registered users. Created on first registration; git-ignored. |

The only deviation from the manual's code is `process.env.PORT || 3000` in the three
`Source/` demos, so that more than one can be up at once while testing.

## Part 1, 2 and §5 — the walkthrough demos

| Route | File | Behaviour |
|-------|------|-----------|
| `GET /` | `session-example.js` | First hit greets you; every refresh increments `req.session.views`. |
| `GET /destroy` | `session-example.js` | Destroys the session — the counter restarts at 1. |
| `GET /set-cookie` | `cookie-example.js` | `username=JohnDoe`, `maxAge` 15 minutes. |
| `GET /get-cookie` | `cookie-example.js` | Reads it back off `req.cookies`. |
| `GET /delete-cookie` | `cookie-example.js` | `res.clearCookie`, so the value is gone. |
| `GET /`, `POST /login`, `GET /logout` | `server.js` | Username in the session, `theme` in a cookie, logout clears both. |

## Exercise 1 — Simple User Login System

Register, log in, reach a dashboard nobody else can reach, log out.

| Route | Behaviour |
|-------|-----------|
| `GET /register` | Registration form. |
| `POST /register` | Validates, rejects duplicates, hashes the password, appends to `data/users.json`. |
| `GET /login` | Login form. |
| `POST /login` | On success sets `req.session.user = { username }` and redirects to the dashboard. |
| `GET /dashboard` | Behind `authMiddleware`; shows the session ID, login time and to-do count. |
| `POST /logout` | `req.session.destroy()`, clears `connect.sid`, back to `/login`. |

The guard is the one from the manual:

```js
function authMiddleware(req, res, next) {
  if (req.session.user) next();
  else res.redirect('/login?error=' + encodeURIComponent('Please log in first.'));
}
```

**Optional challenge — hashed passwords: done.** `bcryptjs` hashes at 10 salt rounds on
registration and `bcrypt.compare` checks on login, so the plain password is never written
anywhere. `bcryptjs` rather than `bcrypt` because it is pure JavaScript — the API is
identical and there is no native build step to fail on a lab machine.

Login failures say only "Invalid username or password", whether the user exists or not, so
the form does not leak which usernames are registered.

## Exercise 2 — To-Do List Manager (session-based)

| Route | Behaviour |
|-------|-----------|
| `GET /todos` | Initialises `req.session.todos` if absent, then lists it. |
| `POST /todos` | Pushes a trimmed, non-empty item. |
| `POST /todos/:id/delete` | `filter((item, index) => index !== id)`, with a range check. |
| `POST /todos/clear` | Empties the list. |

The list lives in the session, so a second browser (or a private window) gets its own, and
it disappears when the session does. This page is deliberately *not* behind
`authMiddleware` — the exercise is about per-session data, which applies to anonymous
visitors just as much as to logged-in ones.

**Optional challenge — theme cookie: done.** `POST /theme` flips a `theme` cookie between
`light` and `dark` for 30 days; middleware reads it into `res.locals.theme`, the header
partial writes it onto `<html data-theme="…">`, and the stylesheet has a palette for each.
No client-side JavaScript is involved. Because it is a cookie and not session data, the
choice survives logout — which is the whole point of the comparison.

The toggle posts the current path in a hidden `from` field so it returns you to the page
you were on; `safePath()` accepts only same-site paths, so the field cannot be used as an
open redirect.

## Security choices

- `httpOnly: true` on both cookies — page JavaScript cannot read either.
- `saveUninitialized: false` — no session cookie until something is actually stored.
- Passwords are bcrypt-hashed; nothing sensitive is ever put in a cookie.
- Session lifetime 30 minutes; the theme preference 30 days.
- The secret reads from `SESSION_SECRET` when set, with a development fallback.
- Two things this deliberately does *not* do, being a lab exercise: the default
  `MemoryStore` is used rather than Redis/Mongo (sessions are lost on restart, and it does
  not scale past one process), and cookies are not `secure: true` because it runs on plain
  HTTP. Both would change in production.

## Checks run

Every route was exercised with `curl` against the running servers. The demos ran on ports
3001–3003 and the assignment app on 3010, because port 3000 was occupied by an unrelated
project's dev server.

**Part 1 — `session-example.js`**

```
GET /            -> Welcome to the session demo. Refresh to count visits.
GET /  (refresh) -> Welcome back! You visited 2 times.
GET /  (refresh) -> Welcome back! You visited 3 times.
GET /destroy     -> Session destroyed
GET /            -> Welcome to the session demo. Refresh to count visits.   (counter reset)
```

**Part 2 — `cookie-example.js`**

```
GET /get-cookie                 -> Cookie Retrieved: undefined
GET /set-cookie                 -> Set-Cookie: username=JohnDoe; Max-Age=900; Path=/
GET /get-cookie                 -> Cookie Retrieved: JohnDoe
GET /delete-cookie              -> Set-Cookie: username=; Expires=Thu, 01 Jan 1970 00:00:00 GMT
GET /get-cookie                 -> Cookie Retrieved: undefined
```

**§5 — `server.js`**

```
GET  /                -> login form
POST /login           -> HTTP 302, Set-Cookie: theme=dark (HttpOnly)
                                   Set-Cookie: connect.sid=s%3AFP8EUOz... (HttpOnly)
GET  /                -> Welcome back, Suryansh! <a href="/logout">Logout</a>
GET  /logout          -> HTTP 302, Set-Cookie: connect.sid=; Expires=1970
GET  /                -> login form again
```

**Exercise 1 — registration and login**

```
GET  /login                                    -> HTTP 200
GET  /register                                 -> HTTP 200
POST /register  password "abc"                 -> /register?error=Password must be at least 6 characters.
POST /register  passwords differ               -> /register?error=The two passwords do not match.
POST /register  username empty                 -> /register?error=Username and password are both required.
POST /register  suryansh / secret123           -> HTTP 302 -> /login?notice=Account created. Please log in.
POST /register  SURYANSH (again)               -> /register?error=Username "SURYANSH" is already taken.

GET  /dashboard  (logged out)                  -> HTTP 302 -> /login?error=Please log in first.
POST /login      wrong password                -> /login?error=Invalid username or password.
POST /login      unknown user                  -> /login?error=Invalid username or password.
POST /login      correct                       -> HTTP 302 -> /dashboard, Set-Cookie: connect.sid=... HttpOnly
GET  /dashboard                                -> "Welcome back, suryansh." + session ID rendered
GET  /                                         -> HTTP 302 -> /dashboard
GET  /no-such-page                             -> HTTP 404
```

`data/users.json` after registering — the password is a hash, not the text typed:

```json
[
  {
    "username": "suryansh",
    "passwordHash": "$2a$10$kEr/SGMw4K4Qj5pJ1T/WpuIwj/V5Ih3AOn/P4MQ6Jsrv4LxrcwYZW",
    "registeredAt": "2026-08-25T10:50:57.397Z"
  }
]
```

**Exercise 2 — to-do list**

```
GET  /todos                    -> "Nothing here yet - add the first item above."
POST /todos  x3                -> Read the session docs / Finish Exp 12 B / Push to GitHub
POST /todos  item is blank     -> /todos?error=Type something first.
POST /todos/1/delete           -> Read the session docs / Push to GitHub
POST /todos/99/delete          -> /todos?error=No such to-do item.
POST /todos/abc/delete         -> /todos?error=No such to-do item.

second cookie jar, GET /todos  -> "Nothing here yet" (its own empty list)
first cookie jar,  GET /todos  -> still 2 items          (sessions do not leak into each other)
```

**Optional challenge — theme cookie, and the open-redirect guard**

```
GET  /todos                          -> <html data-theme="light">
POST /theme  from=/todos             -> Set-Cookie: theme=dark; Max-Age=2592000; HttpOnly; SameSite=Lax
                                        Location: /todos
GET  /todos                          -> <html data-theme="dark">
POST /theme  from=/login             -> Location: /login

POST /theme  from=//evil.example.com       -> Location: /
POST /theme  from=https://evil.example.com -> Location: /
POST /theme  from=\\evil.example.com       -> Location: /
POST /theme  from=javascript:alert(1)      -> Location: /
POST /theme  from=evil.com                 -> Location: /
```

**The full journey, one session end to end**

```
1. POST /login              -> dashboard shows "Welcome back, suryansh."
2. POST /theme              -> dashboard renders data-theme="dark"
3. two items added          -> dashboard reports "2" items
4. cookies held             -> connect.sid=s%3Ad8xQxBh9yP..., theme=dark
5. POST /logout
6. GET /dashboard           -> 302 -> /login?error=Please log in first.   (session gone)
7. GET /todos               -> "Nothing here yet"                        (todos gone with it)
8. GET /todos               -> data-theme="dark"                         (cookie survived)
```

That last pair is the lesson of the experiment in two lines: the session data died with the
session, and the cookie did not.

Nothing was logged to `stderr` on any route across the whole run. All four servers were
stopped afterwards; nothing is left listening on ports 3001–3003 or 3010.

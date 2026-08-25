# Experiment 12, Parts A–C — Node.js, Express, and EJS Templating

Backend Development (CSFS3008P) · B.Tech Full Stack, Semester 5 · Suryansh

## What it is

Parts A, B and C of the manual, end to end, in one Express app: plain Node.js, every
Express response method, route/query params, POST bodies, a complete calculator (all six
operations), and EJS templating. Part D (Nodemon) and the separate Lab Tasks section are
not included — this folder is exactly Steps 1 through 13 of the manual.

## Running it

```bash
cd Exp12-NodeJS-Express-EJS
npm install
node script.js   # Step 3 — plain Node.js, no Express
npm start         # the Express server (node app.js)
```

Then open <http://localhost:3000>.

## Files

| Path | What is in it |
|------|---------------|
| `script.js` | Step 3 — a plain Node.js script (`console.log`, template strings, `reduce`). No Express. |
| `app.js` | Steps 4–13 — the whole server: Part A response methods, Part B params/query/POST, Part C EJS routes. |
| `views/home.ejs`, `users.ejs`, `profile.ejs` | Part C's three templates, unchanged from the manual. |
| `package.json` | `start`/`dev` both run `node app.js`; dependencies: `express`, `ejs`. |

## Endpoint coverage

**Part A — response methods**
`GET /`, `/text`, `/html`, `/json`, `/status` (custom 201).

**Part B — params, query, POST, calculator**
`GET /user/:id`, `/product/:category/:id`, `/search?q=&page=&limit=`.
`GET /calculate?num1=&num2=&operation=` — the finished, complete calculator: `add`,
`subtract`, `multiply`, `divide` (from the manual) plus `modulus` and `power` added on top,
with a division/modulus-by-zero guard.
`POST /register`, `POST /login` (200 on valid credentials, 401 on invalid).

**Part C — EJS**
`GET /home`, `/users`, `/profile/:id` — server-rendered HTML via `res.render()`.

## Checks run

`node script.js`:

```
Hello from Node.js!
Welcome Student to Backend Development
Sum of numbers: 15
```

Server started with `node app.js`:

```
Server running on http://localhost:3000
Available endpoints:
  GET  / - Welcome message
  GET  /text - Plain text
  GET  /html - HTML response
  GET  /json - JSON response
  GET  /status - Custom status code
  GET  /user/:id - User by ID
  GET  /product/:category/:id - Route params, two segments
  GET  /search?q=term - Search
  GET  /calculate?num1=10&num2=5&operation=add|subtract|multiply|divide|modulus|power
  POST /register - Register user
  POST /login - Login user
  GET  /home - EJS home page
  GET  /users - Users list
  GET  /profile/:id - User profile
```

Every route hit with `curl` against the live server — actual responses:

```
GET /                 -> Welcome to Express!
GET /text              -> This is plain text response
GET /html                -> <h1>HTML Response</h1><p>This is HTML content</p>
GET /json                 -> {"message":"This is JSON response","status":"success","data":{"name":"Student","course":"Backend Development"}}
GET /status                -> HTTP 201, {"message":"Created successfully"}

GET /user/123                            -> {"message":"User details","userId":"123"}
GET /product/electronics/456              -> {"category":"electronics","productId":"456"}
GET /search?q=nodejs&page=2&limit=20       -> {"searchQuery":"nodejs","page":"2","limit":"20"}

GET /calculate?num1=10&num2=5&operation=add       -> {"num1":10,"num2":5,"operation":"add","result":15}
GET /calculate?num1=10&num2=5&operation=subtract   -> {"num1":10,"num2":5,"operation":"subtract","result":5}
GET /calculate?num1=10&num2=5&operation=multiply    -> {"num1":10,"num2":5,"operation":"multiply","result":50}
GET /calculate?num1=10&num2=3&operation=divide       -> {"num1":10,"num2":3,"operation":"divide","result":3.3333333333333335}
GET /calculate?num1=10&num2=3&operation=modulus       -> {"num1":10,"num2":3,"operation":"modulus","result":1}
GET /calculate?num1=2&num2=10&operation=power           -> {"num1":2,"num2":10,"operation":"power","result":1024}
GET /calculate?num1=5&num2=0&operation=divide            -> {"num1":5,"num2":0,"operation":"divide","result":"Error: Division by zero"}

POST /register {username,email,password}     -> {"message":"Registration successful","user":{"username":"john","email":"john@example.com"}}
POST /login (correct creds)                    -> {"success":true,"message":"Login successful","token":"sample-jwt-token"}
POST /login (wrong creds)                        -> HTTP 401, {"success":false,"message":"Invalid credentials"}

GET /home, /users, /profile/7                      -> full HTML pages rendered via EJS, all HTTP 200
```

No console errors on any route. Server stopped cleanly after testing; nothing is left
listening on port 3000.

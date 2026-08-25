// Experiment 12 B - Lab Assignment
//
// Both exercises from the manual in one Express app:
//
//   1. Simple User Login System - register, login, a dashboard that only a
//      logged-in user can reach, and logout. Users live in data/users.json and
//      passwords are hashed (the optional bcrypt challenge).
//   2. To-Do List Manager - add / view / delete items held in req.session.todos,
//      so every browser session gets its own list and it vanishes with the
//      session. The optional challenge, a theme cookie, drives the UI colours.
//
//   npm start        ->  http://localhost:3000

const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const SALT_ROUNDS = 10;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'exp12b-state-management-secret',
  resave: false,
  saveUninitialized: false,      // no cookie until something is actually stored
  cookie: {
    httpOnly: true,              // JavaScript in the page cannot read it
    maxAge: 1000 * 60 * 30       // 30 minutes
  }
}));

// ---------------------------------------------------------------------------
// The user "database" - a JSON file, as the manual allows instead of a DB
// ---------------------------------------------------------------------------

function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch (err) {
    return [];                   // file missing or empty on a fresh checkout
  }
}

function writeUsers(users) {
  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function findUser(username) {
  return readUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

// Everything a template needs on every render: who is logged in, and which
// theme the `theme` cookie asks for.
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.theme = req.cookies.theme === 'dark' ? 'dark' : 'light';
  res.locals.error = req.query.error || null;
  res.locals.notice = req.query.notice || null;
  res.locals.currentPath = req.path;   // so the theme toggle returns here
  next();
});

// Route guard: the dashboard is off limits unless a session says otherwise.
function authMiddleware(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login?error=' + encodeURIComponent('Please log in first.'));
  }
}

// Only ever redirect back to a path on this site, never to another host.
function safePath(candidate, fallback) {
  if (typeof candidate === 'string' && /^\/[^/\\]/.test(candidate)) {
    return candidate;
  }
  return fallback;
}

// ---------------------------------------------------------------------------
// Exercise 1: registration, login, protected dashboard, logout
// ---------------------------------------------------------------------------

app.get('/', (req, res) => {
  res.redirect(req.session.user ? '/dashboard' : '/login');
});

app.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

app.post('/register', async (req, res) => {
  const username = (req.body.username || '').trim();
  const password = req.body.password || '';
  const confirm = req.body.confirm || '';

  const fail = message => res.redirect('/register?error=' + encodeURIComponent(message));

  if (!username || !password) {
    return fail('Username and password are both required.');
  }
  if (password.length < 6) {
    return fail('Password must be at least 6 characters.');
  }
  if (password !== confirm) {
    return fail('The two passwords do not match.');
  }
  if (findUser(username)) {
    return fail('Username "' + username + '" is already taken.');
  }

  // Optional challenge: hash the password instead of storing it in the clear.
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const users = readUsers();
  users.push({ username, passwordHash, registeredAt: new Date().toISOString() });
  writeUsers(users);

  res.redirect('/login?notice=' + encodeURIComponent('Account created. Please log in.'));
});

app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('login', { title: 'Login' });
});

app.post('/login', async (req, res) => {
  const username = (req.body.username || '').trim();
  const password = req.body.password || '';
  const user = findUser(username);

  // One message for both "no such user" and "wrong password", so the form
  // does not tell an attacker which usernames exist.
  const ok = user && await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.redirect('/login?error=' + encodeURIComponent('Invalid username or password.'));
  }

  // This one line is the whole point of the exercise: the server now
  // remembers this browser, and the browser only ever holds the session ID.
  req.session.user = { username: user.username, loginAt: new Date().toISOString() };
  res.redirect('/dashboard');
});

app.get('/dashboard', authMiddleware, (req, res) => {
  res.render('dashboard', {
    title: 'Dashboard',
    sessionId: req.sessionID,
    todoCount: (req.session.todos || []).length
  });
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');   // drop the session cookie as well
    res.redirect('/login?notice=' + encodeURIComponent('You have been logged out.'));
  });
});

// ---------------------------------------------------------------------------
// Exercise 2: to-do list held in the session
// ---------------------------------------------------------------------------

// Deliberately not behind authMiddleware - the exercise is about per-session
// data, which works for anonymous visitors too. Open the page in a second
// browser (or a private window) and you get a completely separate list.
app.get('/todos', (req, res) => {
  if (!req.session.todos) {
    req.session.todos = [];
  }
  res.render('todos', { title: 'To-Do List', todos: req.session.todos });
});

app.post('/todos', (req, res) => {
  const item = (req.body.todoItem || '').trim();

  if (!req.session.todos) {
    req.session.todos = [];
  }
  if (!item) {
    return res.redirect('/todos?error=' + encodeURIComponent('Type something first.'));
  }

  req.session.todos.push(item);
  res.redirect('/todos');
});

app.post('/todos/:id/delete', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const todos = req.session.todos || [];

  if (Number.isNaN(id) || id < 0 || id >= todos.length) {
    return res.redirect('/todos?error=' + encodeURIComponent('No such to-do item.'));
  }

  req.session.todos = todos.filter((item, index) => index !== id);
  res.redirect('/todos');
});

app.post('/todos/clear', (req, res) => {
  req.session.todos = [];
  res.redirect('/todos?notice=' + encodeURIComponent('List cleared.'));
});

// ---------------------------------------------------------------------------
// Optional challenge: theme preference in a cookie
// ---------------------------------------------------------------------------

// A preference, not a secret - exactly the sort of thing a cookie is for, and
// it outlives the session because it lives in the browser for 30 days.
app.post('/theme', (req, res) => {
  const nextTheme = req.cookies.theme === 'dark' ? 'light' : 'dark';

  res.cookie('theme', nextTheme, {
    maxAge: 1000 * 60 * 60 * 24 * 30,
    httpOnly: true,
    sameSite: 'lax'
  });

  res.redirect(safePath(req.body.from, '/'));
});

// ---------------------------------------------------------------------------

app.use((req, res) => {
  res.status(404).render('404', { title: 'Not Found' });
});

app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
  console.log('Exercise 1 - login system');
  console.log('  GET  /register         - registration form');
  console.log('  POST /register         - hashes the password, saves to data/users.json');
  console.log('  GET  /login            - login form');
  console.log('  POST /login            - sets req.session.user');
  console.log('  GET  /dashboard        - protected by authMiddleware');
  console.log('  POST /logout           - destroys the session, clears connect.sid');
  console.log('Exercise 2 - session to-do list');
  console.log('  GET  /todos            - the list for this session only');
  console.log('  POST /todos            - add an item');
  console.log('  POST /todos/:id/delete - remove an item');
  console.log('  POST /todos/clear      - empty the list');
  console.log('Optional challenge');
  console.log('  POST /theme            - flips the theme cookie (light <-> dark)');
});

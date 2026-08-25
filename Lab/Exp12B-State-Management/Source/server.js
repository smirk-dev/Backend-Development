// Experiment 12 B - Section 5: sessions and cookies together
//
// The walkthrough app from the manual. A username is kept server-side in the
// session; a `theme` preference is kept client-side in a cookie. Logging out
// destroys one and clears the other.
//
//   node Source/server.js                 (or: npm run combined-demo)

const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // to handle form data

// Session middleware
app.use(session({
  secret: 'mysecretkey',          // used to sign the session ID cookie
  resave: false,                  // do not save session if unmodified
  saveUninitialized: true,        // save new sessions
  cookie: { maxAge: 60000 }       // cookie expiration in ms (here: 1 minute)
}));

// Home route
app.get('/', (req, res) => {
  if (req.session.username) {
    res.send(`Welcome back, ${req.session.username}! <a href="/logout">Logout</a>`);
  } else {
    res.send(`
      <form action="/login" method="post">
        <input type="text" name="username" placeholder="Enter username"/>
        <button type="submit">Login</button>
      </form>
    `);
  }
});

// Login route
app.post('/login', (req, res) => {
  const { username } = req.body;
  req.session.username = username; // store username in session
  res.cookie('theme', 'dark', { maxAge: 900000, httpOnly: true }); // sample cookie
  res.redirect('/');
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid'); // remove session cookie
    res.redirect('/');
  });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

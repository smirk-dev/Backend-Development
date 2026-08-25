// Experiment 12 B - Part 1: Session Management using Node.js
//
// Maintains a user session across requests and destroys it on demand.
// HTTP is stateless, so the only thing tying these requests together is the
// session ID that express-session stores in the `connect.sid` cookie.
//
//   node Source/session-example.js        (or: npm run session-demo)

const express = require('express');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: true
}));

app.get('/', (req, res) => {
    if (req.session.views) {
        req.session.views++;
        res.send(`Welcome back! You visited ${req.session.views} times.`);
    } else {
        req.session.views = 1;
        res.send('Welcome to the session demo. Refresh to count visits.');
    }
});

app.get('/destroy', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.send('Error destroying session');
        }
        res.send('Session destroyed');
    });
});

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
    console.log('  GET /        - counts visits in req.session.views');
    console.log('  GET /destroy - wipes the session, counter restarts at 1');
});

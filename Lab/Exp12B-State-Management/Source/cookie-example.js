// Experiment 12 B - Part 2: Cookie Management using Node.js
//
// Sets, reads and deletes a cookie. Unlike a session, the value itself lives
// in the browser and travels on every request - so nothing sensitive goes here.
//
//   node Source/cookie-example.js         (or: npm run cookie-demo)

const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());

app.get('/set-cookie', (req, res) => {
    res.cookie('username', 'JohnDoe', { maxAge: 900000 });
    res.send('Cookie has been set');
});

app.get('/get-cookie', (req, res) => {
    const user = req.cookies['username'];
    res.send(`Cookie Retrieved: ${user}`);
});

app.get('/delete-cookie', (req, res) => {
    res.clearCookie('username');
    res.send('Cookie deleted');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('  GET /set-cookie    - sets username=JohnDoe for 15 minutes');
    console.log('  GET /get-cookie    - reads it back off the request');
    console.log('  GET /delete-cookie - clears it');
});

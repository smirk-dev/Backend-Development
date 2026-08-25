const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', './views');

// ---------------------------------------------------------------------------
// PART A: Node.js and Express Basics (Steps 5-7)
// ---------------------------------------------------------------------------

app.get('/', (req, res) => {
  res.send('Welcome to Express!');
});

app.get('/text', (req, res) => {
  res.send('This is plain text response');
});

app.get('/html', (req, res) => {
  res.send('<h1>HTML Response</h1><p>This is HTML content</p>');
});

app.get('/json', (req, res) => {
  res.json({
    message: 'This is JSON response',
    status: 'success',
    data: {
      name: 'Student',
      course: 'Backend Development'
    }
  });
});

app.get('/status', (req, res) => {
  res.status(201).json({ message: 'Created successfully' });
});

// ---------------------------------------------------------------------------
// PART B: URL Parameters and POST Data (Steps 8-10)
// ---------------------------------------------------------------------------

app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  res.json({
    message: 'User details',
    userId: userId
  });
});

app.get('/product/:category/:id', (req, res) => {
  const { category, id } = req.params;
  res.json({
    category: category,
    productId: id
  });
});

app.get('/search', (req, res) => {
  const { q, page, limit } = req.query;
  res.json({
    searchQuery: q,
    page: page || 1,
    limit: limit || 10
  });
});

// The complete calculator: the manual's Part B example (add/subtract/multiply/
// divide) plus modulus and power, so it covers every operation asked for.
app.get('/calculate', (req, res) => {
  const { num1, num2, operation } = req.query;
  const n1 = parseFloat(num1);
  const n2 = parseFloat(num2);

  let result;
  switch (operation) {
    case 'add':
      result = n1 + n2;
      break;
    case 'subtract':
      result = n1 - n2;
      break;
    case 'multiply':
      result = n1 * n2;
      break;
    case 'divide':
      result = n2 !== 0 ? n1 / n2 : 'Error: Division by zero';
      break;
    case 'modulus':
      result = n2 !== 0 ? n1 % n2 : 'Error: Division by zero';
      break;
    case 'power':
      result = Math.pow(n1, n2);
      break;
    default:
      result = 'Invalid operation';
  }

  res.json({ num1: n1, num2: n2, operation, result });
});

app.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  res.json({
    message: 'Registration successful',
    user: {
      username,
      email
    }
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email === 'test@example.com' && password === 'password123') {
    res.json({
      success: true,
      message: 'Login successful',
      token: 'sample-jwt-token'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// ---------------------------------------------------------------------------
// PART C: EJS Templating (Steps 11-13)
// ---------------------------------------------------------------------------

app.get('/home', (req, res) => {
  res.render('home', {
    title: 'Home Page',
    heading: 'Welcome to EJS Templating',
    message: 'EJS makes it easy to generate dynamic HTML'
  });
});

app.get('/users', (req, res) => {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com' }
  ];

  res.render('users', { users });
});

app.get('/profile/:id', (req, res) => {
  const userId = req.params.id;

  const user = {
    id: userId,
    name: 'John Doe',
    email: 'john@example.com',
    age: 25,
    city: 'New York'
  };

  res.render('profile', { user });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET  / - Welcome message');
  console.log('  GET  /text - Plain text');
  console.log('  GET  /html - HTML response');
  console.log('  GET  /json - JSON response');
  console.log('  GET  /status - Custom status code');
  console.log('  GET  /user/:id - User by ID');
  console.log('  GET  /product/:category/:id - Route params, two segments');
  console.log('  GET  /search?q=term - Search');
  console.log('  GET  /calculate?num1=10&num2=5&operation=add|subtract|multiply|divide|modulus|power');
  console.log('  POST /register - Register user');
  console.log('  POST /login - Login user');
  console.log('  GET  /home - EJS home page');
  console.log('  GET  /users - Users list');
  console.log('  GET  /profile/:id - User profile');
});

// server.js
const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// STEP 1: CONNECT TO MONGODB
// ============================================

// Choose one of these connection strings:

// Option A: Local MongoDB (must have MongoDB installed) — this is the one in use,
// against the local MongoDB Compass / mongod instance on this machine.
const DB_URL = 'mongodb://localhost:27017/userdb';

// Option B: MongoDB Atlas (replace with your connection string)
// const DB_URL = 'mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/userdb?retryWrites=true&w=majority';

mongoose.connect(DB_URL)
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// ============================================
// STEP 2: DEFINE THE USER SCHEMA
// ============================================

// Schema defines the structure of documents in the collection
const userSchema = new mongoose.Schema({
  username: {
    type: String,        // Field must be text
    required: true,      // Field is mandatory
    unique: true          // No two users can have same username
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now    // Automatically set to current date/time
  }
});

// ============================================
// STEP 3: CREATE THE MODEL
// ============================================

// Model is the interface to interact with the database
const User = mongoose.model('User', userSchema);

// ============================================
// STEP 4: CREATE ROUTES
// ============================================

// HOME ROUTE
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>User Management System</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .container { background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px; }
        h2 { color: #333; }
        input { width: 100%; padding: 10px; margin: 5px 0; box-sizing: border-box; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; cursor: pointer; margin: 5px; }
        button:hover { background: #0056b3; }
        .success { color: green; }
        .error { color: red; }
      </style>
    </head>
    <body>
      <h1>User Management System</h1>

      <div class="container">
        <h2>Register New User</h2>
        <form action="/signup" method="POST">
          <input type="text" name="username" placeholder="Username" required>
          <input type="email" name="email" placeholder="Email" required>
          <input type="password" name="password" placeholder="Password" required>
          <button type="submit">Sign Up</button>
        </form>
      </div>

      <div class="container">
        <h2>Login</h2>
        <form action="/login" method="POST">
          <input type="text" name="username" placeholder="Username" required>
          <input type="password" name="password" placeholder="Password" required>
          <button type="submit">Login</button>
        </form>
      </div>

      <div class="container">
        <h2>View All Users</h2>
        <form action="/users" method="GET">
          <button type="submit">Show All Registered Users</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

// SIGNUP ROUTE - Register a new user
app.post('/signup', async (req, res) => {
  try {
    // Get data from the form submission
    const { username, email, password } = req.body;

    // Create a new user document
    const newUser = new User({
      username: username,
      email: email,
      password: password
    });

    // Save the document to MongoDB
    await newUser.save();

    res.send(`
      <h2 class="success">User registered successfully!</h2>
      <p>Username: ${username}</p>
      <p>Email: ${email}</p>
      <a href="/">Go back to home</a>
    `);

  } catch (error) {
    // Handle errors (like duplicate username or email)
    if (error.code === 11000) {
      res.send(`
        <h2 class="error">Error: Username or email already exists</h2>
        <a href="/">Go back and try again</a>
      `);
    } else {
      res.send(`
        <h2 class="error">Error: ${error.message}</h2>
        <a href="/">Go back and try again</a>
      `);
    }
  }
});

// LOGIN ROUTE - Check user credentials
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user in database
    const user = await User.findOne({ username: username });

    // Check if user exists
    if (!user) {
      return res.send(`
        <h2 class="error">User not found</h2>
        <a href="/">Go back and try again</a>
      `);
    }

    // Check if password matches
    if (user.password !== password) {
      return res.send(`
        <h2 class="error">Incorrect password</h2>
        <a href="/">Go back and try again</a>
      `);
    }

    // Login successful
    res.send(`
      <h2 class="success">Login successful!</h2>
      <p>Welcome back, ${user.username}!</p>
      <p>Email: ${user.email}</p>
      <p>Account created: ${user.createdAt.toDateString()}</p>
      <a href="/">Go back to home</a>
    `);

  } catch (error) {
    res.send(`
      <h2 class="error">Error: ${error.message}</h2>
      <a href="/">Go back and try again</a>
    `);
  }
});

// GET ALL USERS ROUTE - Display all registered users
app.get('/users', async (req, res) => {
  try {
    // Find all users in the database
    const allUsers = await User.find();

    // Check if there are any users
    if (allUsers.length === 0) {
      return res.send(`
        <h2>No users registered yet</h2>
        <a href="/">Go back to home</a>
      `);
    }

    // Create HTML to display users
    let userList = '<h2>Registered Users</h2><ul>';

    allUsers.forEach(user => {
      userList += `
        <li>
          <strong>Username:</strong> ${user.username} |
          <strong>Email:</strong> ${user.email} |
          <strong>Joined:</strong> ${user.createdAt.toDateString()}
        </li>
      `;
    });

    userList += '</ul><a href="/">Go back to home</a>';
    res.send(userList);

  } catch (error) {
    res.send(`
      <h2 class="error">Error: ${error.message}</h2>
      <a href="/">Go back and try again</a>
    `);
  }
});

// ============================================
// START THE SERVER
// ============================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

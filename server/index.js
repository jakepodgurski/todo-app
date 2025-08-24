const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const User = require('./models/User'); 

const app = express();
const port = process.env.PORT || 3001;

const JWT_SECRET = '***REMOVED***';

// Replace with your MongoDB Atlas connection string
const DB_URI = 'mongodb+srv://jdpodgurski:***REMOVED***@cluster0.a0e5blr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB
mongoose.connect(DB_URI)
    .then(() => console.log('Connected to MongoDB!'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

// Middleware
app.use(cors());
app.use(express.json());

app.post('/api/register', [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { username, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create and save new user
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find the user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Create a JWT
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        if (process.env.NODE_ENV === 'development') {
            console.log("Generated Token for User:", user.username, token);
        }
        
        res.json({ token, username });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// For now, let's keep the API endpoints but connect them to a dummy model
// We will replace this with real functionality in the next step
const TodoSchema = new mongoose.Schema({
    text: String,
    completed: Boolean,
    dueDate: String,
    priority: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

const Todo = mongoose.model('Todo', TodoSchema);

// --- API Endpoints ---

// Middleware to protect routes
const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authentication failed: No token provided' });
        }
        const decodedToken = jwt.verify(token, JWT_SECRET);

        if (process.env.NODE_ENV === 'development') {
            console.log("Received a request with userId:", decodedToken.userId);
        }

        req.user = { id: decodedToken.userId };
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Authentication failed: Invalid token' });
    }
};

// --- Protected Todo Endpoints ---

// GET all todos for a logged-in user
app.get('/todos', auth, async (req, res) => {
    try {
        const todos = await Todo.find({ userId: req.user.id }).sort({ completed: 1 });
        res.json(todos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new todo for a logged-in user
app.post('/todos', auth, async (req, res) => {
    try {
        const newTodo = new Todo({ ...req.body, userId: req.user.id });
        const savedTodo = await newTodo.save();
        res.status(201).json(savedTodo);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT (update) a todo by ID for a logged-in user
app.put('/todos/:id', auth, async (req, res) => {
    try {
        const updatedTodo = await Todo.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );
        if (!updatedTodo) {
            return res.status(404).json({ message: 'Todo not found or not authorized' });
        }
        res.json(updatedTodo);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a todo by ID for a logged-in user
app.delete('/todos/:id', auth, async (req, res) => {
    try {
        const deletedTodo = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!deletedTodo) {
            return res.status(404).json({ message: 'Todo not found or not authorized' });
        }
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Start the server
app.listen(port, () => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`Server is running at http://localhost:${port}`);
    }
});

module.exports.handler = serverless(app);
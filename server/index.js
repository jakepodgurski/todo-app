const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;  // Use a different port than React (which is 3000)

// Middleware
app.use(cors()); // Enable CORS to allow requests from the React app
app.use(express.json()); // Parse JSON bodies from requests

// Simple in-memory data store for our todos
let todos = [
    { id: 1, text: 'Learn React', completed: false, dueDate: '', priority: 'Medium' },
    { id: 2, text: 'Build a to-do app', completed: false, dueDate: '', priority: 'High' },
    { id: 3, text: 'Deploy to Netlify', completed: false, dueDate: '', priority: 'Low' },
];

// --- API Endpoints ---

// GET all todos
app.get('/todos', (req, res) => {
    res.json(todos);
});

// POST a new todo
app.post('/todos', (req, res) => {
    const newTodo = {
        id: Date.now(),
        ...req.body
    };
    todos.push(newTodo);
    res.status(201).json(newTodo);
});

// PUT (update) a todo by ID
app.put('/todos/:id', (req, res) => {
    const todoId = parseInt(req.params.id);
    const updatedTodo = req.body;
    todos = todos.map(todo => (todo.id === todoId ? updatedTodo : todo));
    res.json(updatedTodo);
});

// DELETE a todo by ID
app.delete('/todos/:id', (req, res) => {
    const todoId = parseInt(req.params.id);
    todos = todos.filter(todo => todo.id !== todoId);
    res.status(204).end();
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
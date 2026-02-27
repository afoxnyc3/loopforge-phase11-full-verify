/**
 * server.js — Express REST API server for the Todo List application
 * Endpoints:
 *   GET    /api/todos        — list all todos
 *   POST   /api/todos        — create a new todo
 *   PATCH  /api/todos/:id    — update a todo (toggle completed, edit title)
 *   DELETE /api/todos/:id    — delete a todo
 */

'use strict';

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// ─── Prepared Statements ──────────────────────────────────────────────────────

const stmts = {
  getAllTodos:   db.prepare('SELECT id, title, completed, created_at FROM todos ORDER BY created_at ASC'),
  getTodoById:  db.prepare('SELECT id, title, completed, created_at FROM todos WHERE id = ?'),
  insertTodo:   db.prepare('INSERT INTO todos (id, title, completed, created_at) VALUES (@id, @title, @completed, @created_at)'),
  updateTodo:   db.prepare('UPDATE todos SET title = @title, completed = @completed WHERE id = @id'),
  deleteTodo:   db.prepare('DELETE FROM todos WHERE id = ?')
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Serialize a raw DB row to the API response shape.
 * SQLite stores booleans as integers (0/1); convert to JS boolean.
 */
function serializeTodo(row) {
  return {
    id:         row.id,
    title:      row.title,
    completed:  row.completed === 1 || row.completed === true,
    created_at: row.created_at
  };
}

/**
 * Centralized error handler — logs and returns a JSON error response.
 */
function handleError(res, err, message = 'Internal server error', status = 500) {
  console.error(`[ERROR] ${message}:`, err.message || err);
  return res.status(status).json({ error: message });
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET /api/todos
 * Returns all todos ordered by creation date (ascending).
 */
app.get('/api/todos', (req, res) => {
  try {
    const rows = stmts.getAllTodos.all();
    return res.status(200).json(rows.map(serializeTodo));
  } catch (err) {
    return handleError(res, err, 'Failed to retrieve todos');
  }
});

/**
 * POST /api/todos
 * Body: { title: string }
 * Creates a new todo with a UUID, returns the created todo (201).
 */
app.post('/api/todos', (req, res) => {
  try {
    const { title } = req.body;

    // Input validation
    if (typeof title !== 'string') {
      return res.status(400).json({ error: 'Field "title" is required and must be a string.' });
    }
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      return res.status(400).json({ error: 'Field "title" must not be empty.' });
    }
    if (trimmedTitle.length > 500) {
      return res.status(400).json({ error: 'Field "title" must not exceed 500 characters.' });
    }

    const newTodo = {
      id:         uuidv4(),
      title:      trimmedTitle,
      completed:  0,
      created_at: new Date().toISOString()
    };

    stmts.insertTodo.run(newTodo);

    return res.status(201).json(serializeTodo(newTodo));
  } catch (err) {
    return handleError(res, err, 'Failed to create todo');
  }
});

/**
 * PATCH /api/todos/:id
 * Body: { title?: string, completed?: boolean }
 * Updates one or both fields; returns the updated todo.
 */
app.patch('/api/todos/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = stmts.getTodoById.get(id);

    if (!existing) {
      return res.status(404).json({ error: `Todo with id "${id}" not found.` });
    }

    const { title, completed } = req.body;
    let updatedTitle     = existing.title;
    let updatedCompleted = existing.completed;

    // Validate and apply title update
    if (title !== undefined) {
      if (typeof title !== 'string') {
        return res.status(400).json({ error: 'Field "title" must be a string.' });
      }
      const trimmedTitle = title.trim();
      if (trimmedTitle.length === 0) {
        return res.status(400).json({ error: 'Field "title" must not be empty.' });
      }
      if (trimmedTitle.length > 500) {
        return res.status(400).json({ error: 'Field "title" must not exceed 500 characters.' });
      }
      updatedTitle = trimmedTitle;
    }

    // Validate and apply completed update
    if (completed !== undefined) {
      if (typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'Field "completed" must be a boolean.' });
      }
      updatedCompleted = completed ? 1 : 0;
    }

    stmts.updateTodo.run({ id, title: updatedTitle, completed: updatedCompleted });

    return res.status(200).json(serializeTodo({
      id,
      title:      updatedTitle,
      completed:  updatedCompleted,
      created_at: existing.created_at
    }));
  } catch (err) {
    return handleError(res, err, 'Failed to update todo');
  }
});

/**
 * DELETE /api/todos/:id
 * Deletes the specified todo; returns 204 No Content on success.
 */
app.delete('/api/todos/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = stmts.getTodoById.get(id);

    if (!existing) {
      return res.status(404).json({ error: `Todo with id "${id}" not found.` });
    }

    stmts.deleteTodo.run(id);
    return res.status(204).send();
  } catch (err) {
    return handleError(res, err, 'Failed to delete todo');
  }
});

// ─── 404 catch-all ────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ─── Global error handler ────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[UNHANDLED ERROR]', err);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[server] Todo API running on http://localhost:${PORT}`);
});

module.exports = app; // export for testing

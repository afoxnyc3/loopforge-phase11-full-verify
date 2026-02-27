import React, { useState, useEffect, useCallback } from 'react';
import TodoInput from './components/TodoInput';
import TodoList from './components/TodoList';
import { fetchTodos, createTodo, updateTodo, deleteTodo } from './api';
import './App.css';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTodos();
      setTodos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const handleAdd = useCallback(async (title) => {
    try {
      setError(null);
      const newTodo = await createTodo(title);
      setTodos((prev) => [newTodo, ...prev]);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const handleToggle = useCallback(async (id, completed) => {
    try {
      setError(null);
      const updated = await updateTodo(id, completed);
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? updated : t))
      );
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const handleDelete = useCallback(async (id) => {
    try {
      setError(null);
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const remaining = todos.filter((t) => !t.completed).length;

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">📝 Todo List</h1>
        {!loading && (
          <p className="app-subtitle">
            {remaining === 0
              ? 'All done! 🎉'
              : `${remaining} task${remaining !== 1 ? 's' : ''} remaining`}
          </p>
        )}
      </header>

      <main className="app-main">
        <TodoInput onAdd={handleAdd} />

        {error && (
          <div className="error-banner" role="alert">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="error-dismiss">✕</button>
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <div className="spinner" aria-label="Loading todos" />
            <p>Loading todos…</p>
          </div>
        ) : (
          <TodoList
            todos={todos}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  );
}

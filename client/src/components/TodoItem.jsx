import React, { useState } from 'react';
import './TodoItem.css';

export default function TodoItem({ todo, onToggle, onDelete }) {
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    try {
      await onToggle(todo.id, !todo.completed);
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(todo.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <li className={`todo-item${todo.completed ? ' todo-item--completed' : ''}${deleting ? ' todo-item--deleting' : ''}`}>
      <label className="todo-item-label">
        <input
          type="checkbox"
          className="todo-item-checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          disabled={toggling || deleting}
          aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
        />
        <span className="todo-item-title">{todo.title}</span>
      </label>
      <button
        className="todo-item-delete"
        onClick={handleDelete}
        disabled={deleting || toggling}
        aria-label={`Delete "${todo.title}"`}
      >
        {deleting ? '…' : '✕'}
      </button>
    </li>
  );
}

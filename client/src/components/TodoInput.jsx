import React, { useState } from 'react';
import './TodoInput.css';

export default function TodoInput({ onAdd }) {
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await onAdd(trimmed);
      setValue('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="todo-input-form" onSubmit={handleSubmit}>
      <input
        className="todo-input"
        type="text"
        placeholder="What needs to be done?"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={submitting}
        maxLength={255}
        aria-label="New todo title"
      />
      <button
        className="todo-input-btn"
        type="submit"
        disabled={submitting || !value.trim()}
        aria-label="Add todo"
      >
        {submitting ? '…' : 'Add'}
      </button>
    </form>
  );
}

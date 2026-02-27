const BASE_URL = '/api/todos';

/**
 * Fetch all todos from the API.
 * @returns {Promise<Array>}
 */
export async function fetchTodos() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error(`Failed to fetch todos: ${res.statusText}`);
  return res.json();
}

/**
 * Create a new todo.
 * @param {string} title
 * @returns {Promise<Object>}
 */
export async function createTodo(title) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });
  if (!res.ok) throw new Error(`Failed to create todo: ${res.statusText}`);
  return res.json();
}

/**
 * Toggle the completed status of a todo.
 * @param {string} id
 * @param {boolean} completed
 * @returns {Promise<Object>}
 */
export async function updateTodo(id, completed) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed })
  });
  if (!res.ok) throw new Error(`Failed to update todo: ${res.statusText}`);
  return res.json();
}

/**
 * Delete a todo by ID.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteTodo(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to delete todo: ${res.statusText}`);
}

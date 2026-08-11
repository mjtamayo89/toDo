const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export function fetchTodos() {
  return request('/todos')
}

export function createTodo(text) {
  return request('/todos', {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
}

export function toggleTodo(id) {
  return request(`/todos/${id}`, { method: 'PATCH' })
}

export function deleteTodo(id) {
  return request(`/todos/${id}`, { method: 'DELETE' })
}

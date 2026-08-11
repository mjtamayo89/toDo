import '@testing-library/jest-dom/vitest'
import { beforeEach, vi } from 'vitest'

let todoStore = []

vi.stubGlobal(
  'fetch',
  vi.fn(async (url, options = {}) => {
    const method = options.method || 'GET'
    const path = url.toString()

    if (path.endsWith('/todos') && method === 'GET') {
      return { ok: true, json: async () => [...todoStore] }
    }

    if (path.endsWith('/todos') && method === 'POST') {
      const { text } = JSON.parse(options.body)
      const todo = { id: crypto.randomUUID(), text, done: false }
      todoStore.push(todo)
      return { ok: true, json: async () => todo }
    }

    if (path.includes('/todos/') && method === 'PATCH') {
      const id = path.split('/').pop()
      const index = todoStore.findIndex((todo) => todo.id === id)
      if (index === -1) {
        return { ok: false, status: 404 }
      }
      const updated = { ...todoStore[index], done: !todoStore[index].done }
      todoStore[index] = updated
      return { ok: true, json: async () => updated }
    }

    if (path.includes('/todos/') && method === 'DELETE') {
      const id = path.split('/').pop()
      todoStore = todoStore.filter((todo) => todo.id !== id)
      return { ok: true, status: 204, json: async () => null }
    }

    return { ok: false, status: 404 }
  }),
)

beforeEach(() => {
  todoStore = []
})

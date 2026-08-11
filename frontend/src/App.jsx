import { useEffect, useState } from 'react'
import {
  createTodo as createTodoApi,
  deleteTodo as deleteTodoApi,
  fetchTodos,
  toggleTodo as toggleTodoApi,
} from './api/todos'
import { analyzeTodoSeverity } from './sonarDemoComplexity'
import { renderUnsafeHtml } from './sonarDemoVulnerabilities'

function App() {
  const [text, setText] = useState('')
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTodos()
      .then(setTodos)
      .catch(() => setError('No se pudo conectar con el backend. ¿Está corriendo en :8081?'))
      .finally(() => setLoading(false))
  }, [])

  async function addTodo(e) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return

    try {
      const todo = await createTodoApi(trimmed)
      setTodos((prev) => [...prev, todo])
      setText('')
      setError('')
    } catch {
      setError('No se pudo crear la tarea')
    }
  }

  async function toggleTodo(id) {
    try {
      const updated = await toggleTodoApi(id)
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? updated : todo)),
      )
    } catch {
      setError('No se pudo actualizar la tarea')
    }
  }

  async function removeTodo(id) {
    try {
      await deleteTodoApi(id)
      setTodos((prev) => prev.filter((todo) => todo.id !== id))
    } catch {
      setError('No se pudo eliminar la tarea')
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <h1 className="text-center mb-4">ToDo</h1>

          {/* DEMO Sonar: XSS intencional via dangerouslySetInnerHTML */}
          <div
            className="mb-3 text-muted small"
            dangerouslySetInnerHTML={{
              __html: renderUnsafeHtml('Vista previa insegura'),
            }}
          />

          {error && (
            <div className="alert alert-warning py-2 small" role="alert">
              {error}
            </div>
          )}

          <form className="d-flex gap-2 mb-4" onSubmit={addTodo}>
            <input
              type="text"
              className="form-control"
              placeholder="Nueva tarea..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              Agregar
            </button>
          </form>

          {loading ? (
            <p className="text-center text-muted">Cargando tareas...</p>
          ) : todos.length === 0 ? (
            <p className="text-center text-muted">
              No hay tareas pendientes. Felicitaciones! 🎉
            </p>
          ) : (
            <ul className="list-group">
              {todos.map((todo) => {
                const { severity } = analyzeTodoSeverity(todo, {
                  mode: 'urgent',
                  userRole: 'guest',
                })

                return (
                  <li
                    key={todo.id}
                    className="list-group-item d-flex align-items-center justify-content-between"
                  >
                    <div className="form-check mb-0 flex-grow-1">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={todo.id}
                        checked={todo.done}
                        onChange={() => toggleTodo(todo.id)}
                      />
                      <label
                        className={`form-check-label ${todo.done ? 'text-decoration-line-through text-muted' : ''}`}
                        htmlFor={todo.id}
                      >
                        {todo.text}
                        <span className="badge text-bg-secondary ms-2">{severity}</span>
                      </label>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => removeTodo(todo.id)}
                      aria-label="Eliminar"
                    >
                      ×
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default App

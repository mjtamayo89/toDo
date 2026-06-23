import { useState } from 'react'

function App() {
  const [text, setText] = useState('')
  const [todos, setTodos] = useState([])

  function addTodo(e) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return

    setTodos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: trimmed, done: false },
    ])
    setText('')
  }

  function toggleTodo(id) {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo,
      ),
    )
  }

  function removeTodo(id) {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <h1 className="text-center mb-4">ToDo</h1>

          <form className="d-flex gap-2 mb-4" onSubmit={addTodo}>
            <input
              type="text"
              className="form-control"
              placeholder="Nueva tarea..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Agregar
            </button>
          </form>

          {todos.length === 0 ? (
            <p className="text-center text-muted">
              No hay tareas pendientes. Felicitaciones! 🎉
            </p>
          ) : (
            <ul className="list-group">
              {todos.map((todo) => (
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
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default App

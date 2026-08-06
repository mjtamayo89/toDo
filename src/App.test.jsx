import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App', () => {
  it('muestra el título y el mensaje vacío', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'ToDo' })).toBeInTheDocument()
    expect(
      screen.getByText('No hay tareas pendientes. Felicitaciones! 🎉'),
    ).toBeInTheDocument()
  })

  it('agrega una tarea', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('Nueva tarea...'), 'Comprar leche')
    await user.click(screen.getByRole('button', { name: 'Agregar' }))

    expect(screen.getByText('Comprar leche')).toBeInTheDocument()
    expect(
      screen.queryByText('No hay tareas pendientes. Felicitaciones! 🎉'),
    ).not.toBeInTheDocument()
  })

  it('no agrega tarea vacía', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('Nueva tarea...'), '   ')
    await user.click(screen.getByRole('button', { name: 'Agregar' }))

    expect(
      screen.getByText('No hay tareas pendientes. Felicitaciones! 🎉'),
    ).toBeInTheDocument()
  })

  it('marca una tarea como hecha', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('Nueva tarea...'), 'Estudiar')
    await user.click(screen.getByRole('button', { name: 'Agregar' }))

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(checkbox).toBeChecked()
    expect(screen.getByText('Estudiar')).toHaveClass('text-decoration-line-through')
  })

  it('elimina una tarea', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('Nueva tarea...'), 'Borrar esto')
    await user.click(screen.getByRole('button', { name: 'Agregar' }))
    await user.click(screen.getByRole('button', { name: 'Eliminar' }))

    expect(screen.queryByText('Borrar esto')).not.toBeInTheDocument()
    expect(
      screen.getByText('No hay tareas pendientes. Felicitaciones! 🎉'),
    ).toBeInTheDocument()
  })
})

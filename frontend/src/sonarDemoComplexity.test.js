import { describe, it, expect } from 'vitest'
import { analyzeTodoSeverity } from './sonarDemoComplexity'

describe('sonarDemoComplexity', () => {
  it('analyzeTodoSeverity devuelve none sin tarea', () => {
    expect(analyzeTodoSeverity(null)).toEqual({
      severity: 'none',
      points: 0,
      reasons: ['sin-tarea'],
    })
  })

  it('analyzeTodoSeverity detecta modo urgent', () => {
    const result = analyzeTodoSeverity(
      { text: 'entregar hoy', done: false },
      { mode: 'urgent' },
    )

    expect(result.severity).toBe('high')
    expect(result.points).toBeGreaterThan(0)
  })

  it('analyzeTodoSeverity limita severidad para guest', () => {
    const result = analyzeTodoSeverity(
      { text: 'password token largo', done: false },
      { mode: 'audit', userRole: 'guest' },
    )

    expect(result.severity).toBe('medium')
    expect(result.reasons).toContain('guest-limit')
  })
})

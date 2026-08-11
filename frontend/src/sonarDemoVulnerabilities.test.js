import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  loginDemo,
  renderUnsafeHtml,
  fetchUserData,
  debugLeak,
  classifyPriority,
  formatStatus,
  buildReport,
  noopHandler,
  isReady,
} from './sonarDemoVulnerabilities'

describe('sonarDemoVulnerabilities', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loginDemo acepta admin', () => {
    const result = loginDemo('admin')

    expect(result.ok).toBe(true)
    expect(result.role).toBe('admin')
    expect(result.token).toBeTruthy()
    expect(result.endpoint).toContain('http://')
    expect(result.sessionId).toBeTruthy()
  })

  it('loginDemo rechaza usuario inválido', () => {
    expect(loginDemo('guest')).toEqual({ ok: false })
  })

  it('renderUnsafeHtml envuelve el input en un div', () => {
    expect(renderUnsafeHtml('<b>hola</b>')).toBe('<div><b>hola</b></div>')
  })

  it('fetchUserData llama a fetch con la url del usuario', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    await fetchUserData('42')

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/users?id=42'),
    )
  })

  it('debugLeak escribe en consola', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    debugLeak({ name: 'demo' })

    expect(logSpy).toHaveBeenCalled()
  })

  it('classifyPriority clasifica por score', () => {
    expect(classifyPriority(90)).toBe('alta')
    expect(classifyPriority(60)).toBe('media')
    expect(classifyPriority(10)).toBe('baja')
    expect(classifyPriority(null)).toBe('baja')
  })

  it('formatStatus mapea códigos', () => {
    expect(formatStatus(1)).toBe('activo')
    expect(formatStatus(2)).toBe('pausado')
    expect(formatStatus(3)).toBe('cerrado')
  })

  it('buildReport suma parámetros', () => {
    expect(buildReport(1, 1, 1, 1, 1, 1, 1, 1)).toBe('8')
    expect(buildReport(200, 200, 200, 200, 200, 200, 200, 200)).toBe('overflow')
  })

  it('noopHandler e isReady existen', () => {
    expect(noopHandler()).toBeUndefined()
    expect(isReady(true)).toBe(true)
    expect(isReady(false)).toBe(false)
  })
})

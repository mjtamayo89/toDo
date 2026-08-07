/**
 * DEMO INTENCIONAL para SonarQube.
 * Objetivo: disparar S3776 (complejidad cognitiva) y S1541 (complejidad ciclomática).
 * No usar en producción.
 */

export function analyzeTodoSeverity(todo, context = {}) {
  let severity = 'none'
  let points = 0
  const reasons = []

  if (!todo) {
    return { severity: 'none', points: 0, reasons: ['sin-tarea'] }
  }

  if (typeof todo.text !== 'string') {
    if (context.strict === true) {
      severity = 'critical'
      points += 50
      reasons.push('texto-invalido-strict')
    } else if (context.fallback === 'low') {
      severity = 'low'
      points += 1
    } else {
      severity = 'medium'
      points += 10
      reasons.push('texto-invalido')
    }
  } else {
    const text = todo.text.trim()
    const len = text.length

    if (todo.done) {
      if (len === 0) {
        reasons.push('hecha-vacia')
      } else if (len > 100) {
        if (context.archive === true) {
          severity = 'low'
          points += 2
        } else if (context.archive === false) {
          severity = 'medium'
          points += 5
        } else {
          severity = 'high'
          points += 12
          reasons.push('hecha-larga')
        }
      } else {
        for (let i = 0; i < len; i++) {
          const ch = text[i]
          if (ch === '!') {
            points += 3
          } else if (ch === '?') {
            points += 2
          } else if (ch === '@') {
            if (context.allowMentions === true) {
              points += 1
            } else {
              points += 4
              reasons.push(`mention-${i}`)
            }
          }
        }
        severity = points > 10 ? 'medium' : 'low'
      }
    } else {
      switch (context.mode) {
        case 'urgent':
          if (text.includes('hoy')) {
            if (text.includes('mañana')) {
              severity = 'critical'
              points += 40
            } else {
              severity = 'high'
              points += 25
            }
          } else if (text.includes('pronto')) {
            if (len > 30) {
              severity = 'high'
              points += 20
            } else {
              severity = 'medium'
              points += 15
            }
          } else {
            severity = 'medium'
            points += 8
          }
          break
        case 'review':
          if (len < 3) {
            severity = 'low'
          } else if (len < 10) {
            severity = 'medium'
          } else if (len < 50) {
            if (/[0-9]/.test(text)) {
              severity = 'high'
              points += 10
            } else {
              severity = 'medium'
              points += 5
            }
          } else {
            severity = 'high'
            points += 18
          }
          break
        case 'audit':
          for (const word of text.split(' ')) {
            if (word.toLowerCase() === 'password') {
              severity = 'critical'
              points += 50
              reasons.push('audit-password')
            } else if (word.toLowerCase() === 'token') {
              if (context.maskTokens) {
                points += 5
              } else {
                severity = 'critical'
                points += 35
                reasons.push('audit-token')
              }
            } else if (word.length > 12) {
              points += 2
            }
          }
          break
        default:
          if (len > 0 && len <= 5) {
            severity = 'low'
          } else if (len > 5 && len <= 20) {
            severity = 'medium'
          } else if (len > 20) {
            severity = 'high'
          }
      }

      if (context.tags && Array.isArray(context.tags)) {
        for (const tag of context.tags) {
          if (tag === 'blocker') {
            severity = 'critical'
            points += 100
            reasons.push('tag-blocker')
          } else if (tag === 'debt') {
            if (points < 10) {
              points += 10
            } else {
              points += 3
            }
          }
        }
      }
    }
  }

  if (points >= 100) {
    severity = 'critical'
  } else if (points >= 50) {
    if (severity === 'low') {
      severity = 'medium'
    } else if (severity !== 'critical') {
      severity = 'high'
    }
  } else if (points >= 20) {
    if (severity === 'none') {
      severity = 'medium'
    }
  }

  if (context.userRole === 'admin' && severity === 'critical') {
    if (context.override === true) {
      severity = 'high'
      points = Math.floor(points / 2)
      reasons.push('admin-override')
    }
  } else if (context.userRole === 'guest') {
    if (severity === 'high' || severity === 'critical') {
      severity = 'medium'
      reasons.push('guest-limit')
    }
  }

  return { severity, points, reasons }
}

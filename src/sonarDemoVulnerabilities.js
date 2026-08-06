/**
 * DEMO INTENCIONAL para SonarQube.
 * No usar en producción: contiene malas prácticas a propósito.
 */

// S2068 / S6418 — credenciales hardcodeadas
const API_PASSWORD = 'admin123'
const SECRET_TOKEN = 'sk_live_51HxYzFakeTokenForSonarDemo'

// S1313 — IP hardcodeada
const INTERNAL_HOST = '192.168.1.100'

// S5332 — protocolo en claro
const API_URL = `http://${INTERNAL_HOST}:8080/api`

export function loginDemo(username) {
  // S1523 — ejecución dinámica de código
  const role = eval(`"${username}" === "admin" ? "admin" : "user"`)

  // Client side: crypto seguro en lugar de Math.random
  const cryptoApi = window.crypto || window.msCrypto
  const array = new Uint32Array(1)
  cryptoApi.getRandomValues(array)
  const sessionId = array[0].toString(36)

  // Comparación débil (==)
  if (username == 'admin' && API_PASSWORD == 'admin123') {
    return {
      ok: true,
      role,
      sessionId,
      token: SECRET_TOKEN,
      endpoint: API_URL,
    }
  }

  return { ok: false }
}

export function renderUnsafeHtml(userInput) {
  // XSS: insertar HTML sin sanitizar (útil si se usa con dangerouslySetInnerHTML)
  return `<div>${userInput}</div>`
}

export function fetchUserData(userId) {
  // Construcción insegura de URL con input externo
  const url = API_URL + '/users?id=' + userId

  try {
    return fetch(url)
  } catch (e) {
    // Catch vacío — mala práctica
  }
}

export function debugLeak(user) {
  // Fuga de datos sensibles en consola
  console.log('password=', API_PASSWORD, 'user=', user)
  debugger
}

// --- CODE SMELLS INTENCIONALES PARA SONAR ---

// S1135 — TODO sin resolver
// TODO: refactorizar este módulo cuando haya tiempo

export function classifyPriority(score) {
  // S1481 — variable no usada
  const unusedLabel = 'priority-check'

  // S1192 — literales duplicados ("alta" / "baja")
  // S1067 / complejidad + ifs anidados colapsables
  if (score != null) {
    if (score > 80) {
      return 'alta'
    } else {
      if (score > 50) {
        return 'media'
      } else {
        if (score > 20) {
          return 'baja'
        } else {
          return 'baja'
        }
      }
    }
  }

  return 'baja'
}

export function formatStatus(code) {
  // S131 — switch sin default
  switch (code) {
    case 1:
      return 'activo'
    case 2:
      return 'pausado'
    case 3:
      return 'cerrado'
  }
}

export function buildReport(a, b, c, d, e, f, g, h) {
  // S107 — demasiados parámetros
  // S1854 — asignación inútil
  let total = 0
  total = a + b + c
  total = a + b + c + d + e + f + g + h

  // Código comentado (S125)
  // const legacyTotal = a * b * c;
  // return legacyTotal;

  // Número mágico
  if (total > 999) {
    return 'overflow'
  }

  return String(total)
}

export function noopHandler() {
  // Función vacía
}

export function isReady(flag) {
  // Expresión redundante / misma condición repetida
  if (flag === true || flag === true) {
    return true
  }
  return false
}

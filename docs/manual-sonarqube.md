# Manual: Instalación y configuración de SonarQube

**Proyecto:** React ToDo  
**Project Key:** `react-demo-todo`  
**Fecha:** Agosto 2026

---

## 1. Requisitos previos

Antes de empezar, necesitas tener instalado:

| Herramienta | Versión mínima | Verificar |
|-------------|----------------|-----------|
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| Git | cualquiera | `git --version` |
| Docker Desktop (recomendado) | reciente | `docker --version` |

**Nota Windows:** Si PowerShell bloquea `npm`, usa `npm.cmd` en lugar de `npm`.

---

## 2. Instalar SonarQube Server

La forma más sencilla en Windows es con **Docker**.

### 2.1 Con Docker (recomendado)

1. Abre **Docker Desktop** y espera a que esté en ejecución.
2. En una terminal, ejecuta:

```bash
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest
```

3. Espera 1–2 minutos mientras arranca.
4. Abre en el navegador: **http://localhost:9000**

### 2.2 Sin Docker (alternativa)

1. Descarga SonarQube Community desde: https://www.sonarsource.com/products/sonarqube/downloads/
2. Extrae el ZIP en una carpeta (ej. `C:\sonarqube`).
3. Ejecuta `bin\windows-x86-64\StartSonar.bat`.
4. Abre **http://localhost:9000**

### 2.3 Detener / reiniciar SonarQube (Docker)

```bash
docker stop sonarqube
docker start sonarqube
```

---

## 3. Primer acceso a SonarQube

1. Ve a **http://localhost:9000**
2. Inicia sesión con las credenciales por defecto:
   - Usuario: `admin`
   - Contraseña: `admin`
3. SonarQube te pedirá **cambiar la contraseña**. Guarda la nueva contraseña.

---

## 4. Crear el proyecto en SonarQube

1. En el menú superior, clic en **Create** → **Manually**.
2. Completa:
   - **Project key:** `react-demo-todo`
   - **Display name:** `React Demo-todo`
3. Clic en **Set Up**.
4. Elige **Locally** (análisis local con sonar-scanner).
5. En el paso del token, genera uno con nombre ej. `cursor-local`.
6. **Copia el token** (empieza por `squ_...`). No lo volverás a ver completo.

---

## 5. Configurar el proyecto React (ToDo)

### 5.1 Clonar / abrir el proyecto

```bash
cd C:\Users\cotit\OneDrive\Desktop\toDo
```

### 5.2 Instalar dependencias

```bash
npm install
```

En Windows con PowerShell restrictivo:

```powershell
npm.cmd install
```

### 5.3 Crear `sonar-project.properties`

Copia el archivo de ejemplo:

```bash
copy sonar-project.properties.example sonar-project.properties
```

Edita `sonar-project.properties` y reemplaza el token:

```properties
sonar.projectKey=react-demo-todo
sonar.projectName=React Demo-todo
sonar.host.url=http://localhost:9000
sonar.token=TU_TOKEN_AQUI
sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.test.js,**/*.test.jsx
sonar.exclusions=**/node_modules/**,**/coverage/**,**/*.test.js,**/*.test.jsx,**/test/**
sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

> **Importante:** `sonar-project.properties` está en `.gitignore`. El token no debe subirse a Git.

---

## 6. Configurar SonarLint en Cursor / VS Code

SonarLint muestra issues de Sonar **directamente en el editor** mientras codificas.

### 6.1 Instalar extensiones

1. `Ctrl + Shift + X` → busca e instala:
   - **SonarQube for IDE** (SonarLint)
   - **SonarQube** (panel de issues, si lo usas)

### 6.2 Conectar con el servidor local

1. `Ctrl + Shift + P` → **SonarQube: Connect to SonarQube / SonarCloud**
2. Crea una conexión:
   - **Connection name:** `cursor-token` (o el nombre que prefieras)
   - **Server URL:** `http://localhost:9000`
   - **Token:** el mismo `squ_...` del paso 4
3. Vincula el proyecto:
   - Project key: `react-demo-todo`

El proyecto ya incluye en `.vscode/settings.json`:

```json
{
  "sonarlint.connectedMode.project": {
    "connectionId": "cursor-token",
    "projectKey": "react-demo-todo"
  }
}
```

Ajusta `connectionId` si usaste otro nombre al crear la conexión.

---

## 7. Ejecutar análisis completo (tests + cobertura + Sonar)

Siempre en este orden:

### Paso 1 — Generar cobertura de tests

```bash
npm run test:coverage
```

Esto crea `coverage/lcov.info`, que Sonar usa para métricas de cobertura.

### Paso 2 — Enviar análisis a SonarQube

```bash
npm run sonar
```

Si todo es correcto, verás al final:

```
ANALYSIS SUCCESSFUL, you can find the results at:
http://localhost:9000/dashboard?id=react-demo-todo
```

### Paso 3 — Ver resultados en el navegador

1. Abre **http://localhost:9000**
2. Entra al proyecto **React Demo-todo**
3. Revisa:
   - **Issues** (bugs, vulnerabilidades, code smells)
   - **Measures** → Coverage
   - **Code** (código con issues marcados)

---

## 8. Ver cobertura en HTML (sin terminal)

1. Ejecuta `npm run test:coverage`
2. En el explorador de archivos del IDE, abre:
   ```
   coverage/index.html
   ```
3. Ábrelo en el navegador (doble clic o clic derecho → abrir con navegador).

Verás porcentajes por archivo y líneas cubiertas / no cubiertas.

---

## 9. Flujo de trabajo habitual

```
┌─────────────────┐
│  Codificar      │
│  (SonarLint     │
│  avisa en IDE)  │
└────────┬────────┘
         ▼
┌─────────────────┐
│ npm run         │
│ test:coverage   │
└────────┬────────┘
         ▼
┌─────────────────┐
│ npm run sonar   │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Ver dashboard   │
│ localhost:9000  │
└─────────────────┘
```

---

## 10. Jenkins (opcional)

El proyecto incluye un `Jenkinsfile` con pipeline CI que ejecuta tests, build y análisis Sonar automáticamente.

Consulta el manual completo: **`docs/manual-jenkins.md`**

Credenciales necesarias en Jenkins:

| ID | Tipo | Valor |
|----|------|-------|
| `sonar-token` | Secret text | Token `squ_...` |
| `sonar-host-url` | Secret text | `http://host.docker.internal:9000` (Jenkins en Docker) |

---

## 11. Solución de problemas

### `npm` bloqueado en PowerShell

```
ejecución de scripts está deshabilitada
```

**Solución:** Usa `npm.cmd` o ejecuta en **Git Bash**:

```bash
npm install
npm run test:coverage
npm run sonar
```

### Error de autenticación en sonar-scanner

- Verifica que SonarQube esté corriendo en `http://localhost:9000`
- Revisa que el token en `sonar-project.properties` sea válido
- Genera un token nuevo si fue revocado

### SonarQube no arranca (Docker)

```bash
docker logs sonarqube
```

Asegúrate de que Docker Desktop está activo y el puerto 9000 no está ocupado.

### SonarLint no muestra issues

1. Verifica la conexión en SonarLint (token + URL)
2. Confirma que `projectKey` coincide: `react-demo-todo`
3. `Ctrl + Shift + P` → **Developer: Reload Window**

### Cobertura 0% en Sonar

- Ejecuta **siempre** `npm run test:coverage` **antes** de `npm run sonar`
- Confirma que existe `coverage/lcov.info`

### `command not found` en extensiones de cobertura

Algunas extensiones de VS Code (ej. Coverage Gutters) no funcionan bien en Cursor. Usa `coverage/index.html` o el dashboard de SonarQube.

---

## 12. Archivos relevantes del proyecto

| Archivo | Descripción |
|---------|-------------|
| `sonar-project.properties.example` | Plantilla de configuración |
| `sonar-project.properties` | Config local con token (no se sube a Git) |
| `package.json` | Scripts `test:coverage` y `sonar` |
| `vite.config.js` | Configuración de cobertura Vitest |
| `.vscode/settings.json` | SonarLint connected mode |
| `Jenkinsfile` | Pipeline CI con Sonar |
| `coverage/lcov.info` | Reporte para Sonar |
| `coverage/index.html` | Reporte visual de cobertura |

---

## 13. Comandos de referencia rápida

```bash
# Desarrollo
npm run dev

# Tests
npm test
npm run test:coverage

# Análisis Sonar
npm run sonar

# SonarQube con Docker
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest
docker start sonarqube
docker stop sonarqube
```

---

*Manual generado para el proyecto ToDo — React + Vite + Vitest + SonarQube*

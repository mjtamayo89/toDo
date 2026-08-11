# Manual: Instalación y configuración de SonarQube

**Proyecto:** React ToDo (monorepo `frontend/` + `backend/`)  
**Project Keys:** `react-demo-todo` (frontend) · `todo-backend` (backend)  
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
cd frontend
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

*(Desde la carpeta `frontend/`)*

Edita `frontend/sonar-project.properties` y reemplaza el token:

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

## 10. Backend (Spring Boot): tests, cobertura y Sonar

El backend vive en `backend/` y usa **Maven** a través del **Maven Wrapper** (`mvnw` / `mvnw.cmd`), así que no necesitas tener Maven instalado. Tiene su propio proyecto en Sonar, separado del frontend.

### 10.1 Datos del proyecto backend

| Campo | Valor |
|-------|-------|
| **Project key** | `todo-backend` |
| **Display name** | `ToDo Backend` |

Ya están configurados en `backend/pom.xml`. No necesitas crear el proyecto a mano en la UI de Sonar: se crea solo la primera vez que le llega un análisis con ese `projectKey`.

### 10.2 Guardar el token como variable de entorno (recomendado)

En vez de pegar el token cada vez que analizas, guárdalo una sola vez como variable de entorno de tu usuario en Windows:

```powershell
setx SONAR_TOKEN "TU_TOKEN_AQUI"
```

> **Importante:** `setx` solo aplica a **procesos nuevos**. Si tu editor (Cursor/VS Code) ya estaba abierto cuando lo ejecutaste, no basta con abrir una terminal nueva: **reinicia el editor por completo**. Verifica que quedó disponible con `echo $env:SONAR_TOKEN` en una terminal nueva.

Puedes reutilizar el mismo token del frontend siempre que sea un **token de usuario** (no un "Project Analysis Token" atado únicamente a `react-demo-todo`). Si al analizar el backend te da `401 Unauthorized`, genera un token nuevo en Sonar y vuelve a intentar.

### 10.3 Ejecutar tests + cobertura (JaCoCo)

```powershell
cd backend
.\mvnw.cmd clean test
```

Corre los 12 tests (`TodoServiceTest`, `TodoControllerTest`) y genera el reporte de cobertura:

```
backend/target/site/jacoco/index.html   ← reporte visual
backend/target/site/jacoco/jacoco.xml   ← reporte que lee Sonar
```

Para abrir el reporte visual sin salir de la terminal:

```powershell
start target\site\jacoco\index.html
```

### 10.4 Enviar el análisis a SonarQube

```powershell
cd backend
.\mvnw.cmd "org.sonarsource.scanner.maven:sonar-maven-plugin:sonar" "-Dsonar.host.url=http://localhost:9000" "-Dsonar.token=$env:SONAR_TOKEN"
```

> **Nota PowerShell:** las comillas dobles alrededor de cada `-D...` son necesarias. Sin ellas, PowerShell puede interpretar mal los dos puntos de `http://localhost:9000` y el build falla con un error de resolución de plugin (`Error resolving version for plugin...`).

Si todo salió bien verás `BUILD SUCCESS`, y el proyecto **ToDo Backend** aparece (o se actualiza) en:

```
http://localhost:9000/dashboard?id=todo-backend
```

### 10.5 Nota técnica: Java 25 y Byte Buddy

Si alguna vez ves un error como:

```
Java 25 (69) is not supported by the current version of Byte Buddy
```

Es porque Mockito usa Byte Buddy para crear mocks, y esa librería todavía no soporta oficialmente las versiones más nuevas de Java. Ya está resuelto en `backend/pom.xml` con esta configuración del `maven-surefire-plugin`:

```xml
<argLine>@{argLine} -Dnet.bytebuddy.experimental=true</argLine>
```

No necesitas tocar nada, pero si el error reaparece (por ejemplo tras actualizar dependencias de Java o Mockito), confirma que esa línea siga en el `pom.xml`.

---

## 11. Jenkins (opcional)

El proyecto incluye un `Jenkinsfile` en la raíz. **Ojo:** actualmente es una versión mínima (solo checkout + `ls -la`) y no ejecuta tests, build ni Sonar automáticamente. El pipeline completo (que sí hace todo eso, para backend y frontend) quedó guardado como `Jenkinsfile_v1`.

Consulta el manual completo, incluyendo cómo reactivar el pipeline completo: **`docs/manual-jenkins.md`**

Credenciales necesarias en Jenkins (solo aplican si usas `Jenkinsfile_v1`):

| ID | Tipo | Valor |
|----|------|-------|
| `sonar-token` | Secret text | Token `squ_...` |
| `sonar-host-url` | Secret text | `http://host.docker.internal:9000` (Jenkins en Docker) |

---

## 12. Solución de problemas

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

### `401 Unauthorized` al analizar el backend

- El token puede ser un "Project Analysis Token" atado solo al proyecto frontend (`react-demo-todo`) y no sirve para `todo-backend`. Genera un token de usuario o uno nuevo específico.
- Verifica que `$env:SONAR_TOKEN` no esté vacío (`echo $env:SONAR_TOKEN`). Si acabas de correr `setx`, necesitas una terminal nueva o reiniciar el editor.

### `Error resolving version for plugin` al correr `mvnw.cmd ... sonar`

En PowerShell, envuelve cada argumento `-D...` en comillas dobles, especialmente los que tienen una URL con `:`:

```powershell
.\mvnw.cmd "org.sonarsource.scanner.maven:sonar-maven-plugin:sonar" "-Dsonar.host.url=http://localhost:9000" "-Dsonar.token=$env:SONAR_TOKEN"
```

---

## 13. Archivos relevantes del proyecto

| Archivo | Descripción |
|---------|-------------|
| `frontend/sonar-project.properties.example` | Plantilla de configuración |
| `frontend/sonar-project.properties` | Config local con token (no se sube a Git) |
| `frontend/package.json` | Scripts `test:coverage` y `sonar` |
| `frontend/vite.config.js` | Configuración de cobertura Vitest |
| `frontend/.vscode/settings.json` | SonarLint connected mode |
| `frontend/coverage/lcov.info` | Reporte de cobertura para Sonar (frontend) |
| `frontend/coverage/index.html` | Reporte visual de cobertura (frontend) |
| `backend/pom.xml` | Config Maven, JaCoCo y `sonar.projectKey` del backend |
| `backend/mvnw`, `backend/mvnw.cmd` | Maven Wrapper (no requiere Maven instalado) |
| `backend/src/test/java/com/todo/` | Tests unitarios del backend (Service + Controller) |
| `backend/target/site/jacoco/jacoco.xml` | Reporte de cobertura para Sonar (backend) |
| `Jenkinsfile` | Pipeline CI mínimo (checkout + `ls -la`) |
| `Jenkinsfile_v1` | Pipeline CI completo de respaldo (tests + build + Sonar) |

---

## 14. Comandos de referencia rápida

```bash
# Frontend — Desarrollo
npm run dev

# Frontend — Tests
npm test
npm run test:coverage

# Frontend — Análisis Sonar
npm run sonar

# Backend — Tests + cobertura (JaCoCo)
cd backend
.\mvnw.cmd clean test

# Backend — Análisis Sonar
.\mvnw.cmd "org.sonarsource.scanner.maven:sonar-maven-plugin:sonar" "-Dsonar.host.url=http://localhost:9000" "-Dsonar.token=$env:SONAR_TOKEN"

# SonarQube con Docker
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest
docker start sonarqube
docker stop sonarqube
```

---

*Manual generado para el proyecto ToDo — React + Vite + Vitest + SonarQube*

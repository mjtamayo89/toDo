# Manual: Instalación y configuración de Jenkins

**Proyecto:** React ToDo  
**Repositorio:** https://github.com/mjtamayo89/toDo  
**Fecha:** Agosto 2026

---

## 1. Requisitos previos

| Herramienta | Para qué | Verificar |
|-------------|----------|-----------|
| Docker Desktop | Ejecutar Jenkins en contenedor | `docker --version` |
| Git | Clonar el repositorio | `git --version` |
| SonarQube | Análisis de calidad (paso final del pipeline) | http://localhost:9000 |
| Cuenta GitHub | Repositorio del código | — |

**Nota:** Jenkins necesita **virtualización habilitada** en BIOS para que Docker Desktop funcione.

---

## 2. Instalar Jenkins con Docker

### 2.1 Levantar el contenedor

```bash
docker run -d -p 8080:8080 -p 50000:50000 --name jenkins jenkins/jenkins:lts
```

- **8080** → interfaz web de Jenkins  
- **50000** → agentes Jenkins (uso avanzado)

### 2.2 Verificar que está corriendo

```bash
docker ps
```

Deberías ver el contenedor `jenkins` con estado `Up`.

### 2.3 Detener / reiniciar Jenkins

```bash
docker stop jenkins
docker start jenkins
```

---

## 3. Primer acceso a Jenkins

1. Abre **http://localhost:8080**
2. Obtén la contraseña inicial:

```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

3. Pégala en la pantalla **Unlock Jenkins**
4. Elige **Install suggested plugins**
5. Crea tu usuario administrador (esta será tu contraseña de uso diario)
6. Deja la URL en `http://localhost:8080` → **Save and Finish**

> La contraseña del archivo `initialAdminPassword` solo se usa una vez. Después entras con el usuario que creaste en el wizard.

---

## 4. Instalar Node.js dentro del contenedor

La imagen `jenkins/jenkins:lts` no trae Node.js. Hay que instalarlo una vez:

```bash
docker exec -u root jenkins bash -c "apt-get update -qq && apt-get install -y -qq curl ca-certificates gnupg && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y -qq nodejs && node -v && npm -v"
```

Verifica:

```bash
docker exec jenkins node -v
docker exec jenkins npm -v
```

> Si recreas el contenedor (`docker rm jenkins`), debes repetir este paso.

---

## 4b. Configurar Maven como herramienta de Jenkins

El backend Spring Boot necesita **Maven**. En vez de instalarlo a mano en el contenedor, el `Jenkinsfile` lo pide como herramienta administrada por Jenkins:

```groovy
tools {
  maven 'Maven-3'
}
```

Para que ese nombre exista, configúralo una vez en la UI:

1. **Manage Jenkins** → **Tools** (Herramientas)
2. Busca la sección **Maven installations**
3. **Add Maven**
   - **Name:** `Maven-3` (debe coincidir exactamente con el `Jenkinsfile`)
   - Marca **Install automatically**
   - **Version:** la más reciente de Maven 3.x
4. **Save**

Jenkins descargará Maven automáticamente la primera vez que el pipeline lo necesite; no hace falta tocar el contenedor.

> El JDK que usa Jenkins internamente sirve para compilar el backend (Java 17). Si el build falla por versión de Java, añade también una **JDK installation** en la misma pantalla de Tools.

---

## 5. Crear credenciales de SonarQube

**Manage Jenkins** → **Credentials** → **System** → **Global credentials** → **Add Credentials**

### 5.1 Token de Sonar

| Campo | Valor |
|-------|-------|
| Kind | Secret text |
| Secret | Token `squ_...` (generado en SonarQube) |
| ID | `sonar-token` |

### 5.2 URL de Sonar

| Campo | Valor |
|-------|-------|
| Kind | Secret text |
| Secret | `http://host.docker.internal:9000` |
| ID | `sonar-host-url` |

> **¿Por qué `host.docker.internal`?** Jenkins corre dentro de Docker. `localhost` dentro del contenedor apunta al propio contenedor, no a tu PC. `host.docker.internal` es la forma de llegar a SonarQube instalado en Windows.

Si SonarQube también estuviera en Docker en la misma red, usarías el nombre del contenedor (ej. `http://sonarqube:9000`).

---

## 6. Crear el pipeline del proyecto

1. **New Item** → nombre `toDo` → **Pipeline** → OK
2. En **Pipeline**:
   - **Definition:** Pipeline script from SCM
   - **SCM:** Git
   - **Repository URL:** `https://github.com/mjtamayo89/toDo.git`
   - **Branch:** `*/main`
   - **Script Path:** `Jenkinsfile`
3. **Credentials:** `- none -` (si el repo es público)
4. **Save**

---

## 7. El Jenkinsfile — etapas del pipeline

> **Actualizado:** el `Jenkinsfile` actual en la raíz del repo es una versión **mínima**, pensada para probar rápido que Jenkins puede clonar el repo y ejecutar pasos. Todavía no corre tests, build ni Sonar automáticamente.

| Stage | Qué hace |
|-------|----------|
| **Checkout** | Descarga el código desde GitHub (`git 'https://github.com/mjtamayo89/toDo.git'`) |
| **Mostrar archivos** | `ls -la` — solo lista los archivos del workspace, para confirmar que el checkout funcionó |

```groovy
pipeline {

    agent any

    stages {

        stage('Checkout') {
            steps {
                git 'https://github.com/mjtamayo89/toDo.git'
            }
        }

        stage('Mostrar archivos') {
            steps {
                sh 'ls -la'
            }
        }

    }
}
```

### 7.1 La versión completa (backend + frontend + Sonar) sigue disponible

El pipeline completo que sí ejecuta tests, build y SonarQube para backend y frontend **no se perdió**: quedó guardado como `Jenkinsfile_v1` en la raíz del repo, listo para reactivar cuando quieras.

| Stage (en `Jenkinsfile_v1`) | Carpeta | Qué hace |
|-------|---------|----------|
| **Checkout** | raíz | Descarga el código desde GitHub |
| **Backend: Test** | `backend/` | `mvn -B test` — tests de Spring Boot |
| **Backend: Build** | `backend/` | `mvn -B package -DskipTests` — genera el `.jar` |
| **Install** | `frontend/` | `npm ci` — instala dependencias |
| **Test + Coverage** | `frontend/` | `npm run test:coverage` — tests y cobertura |
| **Build** | `frontend/` | `npm run build` — compila React |
| **SonarQube** | `frontend/` | `npx sonar-scanner` — envía análisis a Sonar |

**Para volver a usarla**, tienes dos opciones:

1. **Reemplazar el contenido:** copia el contenido de `Jenkinsfile_v1` dentro de `Jenkinsfile` y haz commit.
2. **Apuntar Jenkins a ese archivo:** en la configuración del job (`Configure` → `Pipeline`), cambia **Script Path** de `Jenkinsfile` a `Jenkinsfile_v1`.

> Con la versión completa activa, sí necesitas las credenciales `sonar-token` y `sonar-host-url` del paso 5, y la herramienta Maven del paso 4b. Con la versión mínima actual, ninguna de las dos es obligatoria.

---

## 8. Ejecutar el pipeline

1. En el job `toDo`, clic en **Build Now**
2. Revisa el progreso en **Console Output**

Con el `Jenkinsfile` mínimo actual, un build verde solo confirma que Jenkins pudo clonar el repo y listar archivos. Si activaste `Jenkinsfile_v1` (sección 7.1), además necesitas que **SonarQube** esté corriendo en `http://localhost:9000` antes de darle a Build Now.

---

## 9. Flujo de trabajo habitual

**Con el Jenkinsfile mínimo actual:**

```
┌──────────────────┐
│ Codificar        │
│ (cambios locales)│
└────────┬─────────┘
         ▼
┌──────────────────┐
│ git add / commit │
│ git push         │
└────────┬─────────┘
         ▼
┌──────────────────┐
│ Jenkins          │
│ Build Now        │
└────────┬─────────┘
         ▼
┌──────────────────┐
│ Checkout → ls -la│
└──────────────────┘
```

**Con `Jenkinsfile_v1` (pipeline completo):**

```
┌──────────────────┐
│ Codificar        │
│ (cambios locales)│
└────────┬─────────┘
         ▼
┌──────────────────┐
│ git add / commit │
│ git push         │
└────────┬─────────┘
         ▼
┌──────────────────┐
│ Jenkins          │
│ Build Now        │
└────────┬─────────┘
         ▼
┌────────────────────┐
│ Checkout           │
│ → Backend: Test    │
│ → Backend: Build   │
│ → Install (front)  │
│ → Test + Coverage  │
│ → Build (front)    │
│ → SonarQube        │
└────────┬───────────┘
         ▼
┌──────────────────┐
│ Ver resultados   │
│ en SonarQube     │
└──────────────────┘
```

**Importante:** Jenkins solo analiza el código que está en **GitHub**, no tu carpeta local. Siempre haz `git push` antes de **Build Now**.

---

## 10. Repositorio privado (opcional)

Si el repo es privado, Jenkins necesita credenciales de GitHub:

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens**
2. Genera un token con scope **`repo`**
3. En Jenkins → **Credentials** → **Add**:
   - Kind: Username with password
   - Username: tu usuario GitHub
   - Password: el token `ghp_...`
4. En el job, selecciona esa credencial en la sección Git

---

## 11. Solución de problemas

### Docker: "Virtualization support not detected"

Activa virtualización en BIOS (Intel VT-x / AMD-V) o instala Jenkins sin Docker (instalador `.msi` desde jenkins.io).

### Error al conectar con GitHub

```
Invalid username or token. Password authentication is not supported
```

El repo es privado y Jenkins no tiene credenciales. Haz el repo público o añade un token de GitHub (sección 10).

### `npm: not found` en el build

Node.js no está instalado en el contenedor. Repite el paso 4.

### `mvn: not found` o `Tool type "maven" does not have an install of "Maven-3"`

Falta configurar la herramienta Maven en Jenkins, o el nombre no coincide. Revisa el paso 4b: **Manage Jenkins → Tools → Maven installations**, y confirma que el nombre sea exactamente `Maven-3`.

### SonarQube: connection refused

- Verifica que Sonar está corriendo en tu PC
- Usa `http://host.docker.internal:9000` en la credencial `sonar-host-url` (no `localhost`)

### SonarQube se cierra solo al reiniciar

Quedó un proceso Java colgado. Cierra instancias anteriores antes de volver a abrir `StartSonar.bat`. Error típico en logs:

```
Lock held by another program: node.lock
```

### Advertencia: insecure interpolation of sensitive variables

Es una advertencia de seguridad de Jenkins (no detiene el build). El `Jenkinsfile` actual pasa los secretos por línea de comandos en lugar de escribirlos en un archivo.

### Build verde pero sin análisis en Sonar

- Revisa que SonarQube estaba encendido durante el build
- Verifica el token en credenciales Jenkins
- Lee **Console Output** del stage SonarQube

---

## 12. Archivos relevantes del proyecto

| Archivo | Descripción |
|---------|-------------|
| `Jenkinsfile` | Pipeline mínimo actual (checkout + `ls -la`) |
| `Jenkinsfile_v1` | Pipeline completo de respaldo (backend + frontend + Sonar) |
| `backend/pom.xml` | Dependencias, JaCoCo y build de Spring Boot |
| `backend/mvnw`, `backend/mvnw.cmd` | Maven Wrapper (no requiere Maven instalado) |
| `backend/src/test/java/com/todo/` | Tests unitarios del backend (Service + Controller) |
| `frontend/package.json` | Scripts `test:coverage`, `build` |
| `frontend/sonar-project.properties.example` | Plantilla Sonar (referencia) |
| `docs/manual-sonarqube.md` | Manual de SonarQube |
| `docs/manual-jenkins.md` | Este manual |

---

## 13. Comandos de referencia rápida

```bash
# Jenkins con Docker
docker run -d -p 8080:8080 -p 50000:50000 --name jenkins jenkins/jenkins:lts
docker start jenkins
docker stop jenkins
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword

# Node en el contenedor (una vez)
docker exec -u root jenkins bash -c "curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs"

# Maven: no se instala por comando, se configura en
# Manage Jenkins → Tools → Maven installations → "Maven-3" (Install automatically)

# Flujo local antes de push
git add .
git commit -m "mensaje"
git push
# Luego: Build Now en Jenkins
```

---

*Manual generado para el proyecto ToDo — React + Vite + Jenkins + SonarQube*

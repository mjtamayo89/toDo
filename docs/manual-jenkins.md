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

## 4b. Instalar Java 17 y Maven dentro del contenedor

El backend Spring Boot necesita **JDK 17** y **Maven**. La imagen `jenkins/jenkins:lts` ya trae un JDK (el que usa Jenkins), pero Maven no viene instalado. Instálalo una vez:

```bash
docker exec -u root jenkins bash -c "apt-get update -qq && apt-get install -y -qq maven && mvn -v"
```

Verifica:

```bash
docker exec jenkins mvn -v
docker exec jenkins java -version
```

> Si recreas el contenedor, repite este paso igual que con Node.js.

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

Jenkins lee el archivo `Jenkinsfile` del repositorio. Cada paso se define en un bloque `stage`:

| Stage | Carpeta | Qué hace |
|-------|---------|----------|
| **Checkout** | raíz | Descarga el código desde GitHub |
| **Backend: Test** | `backend/` | `mvn -B test` — tests de Spring Boot |
| **Backend: Build** | `backend/` | `mvn -B package -DskipTests` — genera el `.jar` |
| **Install** | `frontend/` | `npm ci` — instala dependencias |
| **Test + Coverage** | `frontend/` | `npm run test:coverage` — tests y cobertura |
| **Build** | `frontend/` | `npm run build` — compila React |
| **SonarQube** | `frontend/` | `npx sonar-scanner` — envía análisis a Sonar |

> El pipeline es **un solo `Jenkinsfile` en la raíz** del repo que usa `dir('backend')` y `dir('frontend')` para ejecutar cada bloque de comandos en la carpeta correcta. No existe un `Jenkinsfile` separado dentro de `backend/`.

### Estructura simplificada

```groovy
pipeline {
  agent any
  stages {
    stage('Checkout') { ... }
    stage('Backend: Test') { dir('backend') { ... } }
    stage('Backend: Build') { dir('backend') { ... } }
    stage('Install') { dir('frontend') { ... } }
    stage('Test + Coverage') { dir('frontend') { ... } }
    stage('Build') { dir('frontend') { ... } }
    stage('SonarQube') { dir('frontend') { ... } }
  }
}
```

---

## 8. Ejecutar el pipeline

1. Asegúrate de que **SonarQube** está corriendo (`http://localhost:9000`)
2. En el job `toDo`, clic en **Build Now**
3. Revisa el progreso en **Console Output**

Si todo va bien, el build queda **verde** y SonarQube muestra un análisis nuevo.

---

## 9. Flujo de trabajo habitual

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
│ Checkout → Install│
│ → Tests → Build  │
│ → SonarQube      │
└────────┬─────────┘
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

### `mvn: not found` en el build

Maven no está instalado en el contenedor. Repite el paso 4b.

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
| `Jenkinsfile` | Definición del pipeline CI (en la raíz, pipelinea backend y frontend) |
| `backend/pom.xml` | Dependencias y build de Spring Boot |
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

# Maven en el contenedor (una vez)
docker exec -u root jenkins bash -c "apt-get update -qq && apt-get install -y maven"

# Flujo local antes de push
git add .
git commit -m "mensaje"
git push
# Luego: Build Now en Jenkins
```

---

*Manual generado para el proyecto ToDo — React + Vite + Jenkins + SonarQube*

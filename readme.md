# ToDo

Monorepo con frontend React y backend Spring Boot.

## Estructura

```
toDo/
├── frontend/     React + Vite (UI)
├── backend/      Spring Boot (API REST)
└── docs/         Manuales
```

## Cómo ejecutar

### Backend (puerto 8081)

```bash
cd backend
mvn spring-boot:run
```

### Frontend (puerto 5173)

```bash
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173. El frontend llama al API en `http://localhost:8081/api` (proxy Vite).

## Funciones

- Agregar, completar y eliminar tareas
- Datos persistidos en el backend (memoria hasta reiniciar Spring)

## Tests y Sonar (frontend)

```bash
cd frontend
npm run test:coverage
npm run sonar
```

Ver `docs/manual-sonarqube.md` y `docs/manual-jenkins.md`.

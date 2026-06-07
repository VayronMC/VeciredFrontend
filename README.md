# VeciRed Frontend

Cliente web de **VeciRed**, plataforma comunitaria para conectar vecinos y facilitar servicios, favores y préstamos en el entorno local.

Repositorio relacionado: [VeciredBackend](https://github.com/VayronMC/VeciredBackend)

---

## Descripción del proyecto

Aplicación **SPA** (Single Page Application) que permite a los vecinos:

- Registrarse e iniciar sesión
- Explorar el tablón comunitario con búsqueda y filtros
- Crear, editar y cerrar publicaciones de ayuda
- Gestionar su perfil y solicitudes activas
- Calificar a otros vecinos mediante reseñas

El frontend consume la API REST del backend; no accede directamente a Supabase.

---

## Tecnologías utilizadas

| Capa | Tecnología |
| :--- | :--- |
| Framework UI | React 19 |
| Bundler | Vite 8 |
| Estilos | Tailwind CSS 3 |
| Iconos | Lucide React |
| Pruebas E2E | Playwright |
| Lint | ESLint 10 |
| CI/CD | GitHub Actions |
| Contenedores | Docker, Docker Compose |
| Despliegue | Vercel (recomendado) |

---

## Arquitectura general

```
┌─────────────────────┐         HTTP/JSON          ┌─────────────────────┐
│  VeciredFrontend    │  ───────────────────────>  │  VeciredBackend     │
│  React + Vite       │                            │  Express + Supabase │
│  (Vercel)           │                            │  (Render)           │
└─────────────────────┘                            └─────────────────────┘
```

### Componentes principales

| Componente | Responsabilidad |
| :--- | :--- |
| `Login.jsx` / `Registro.jsx` | Autenticación de vecinos |
| `Home.jsx` | Tablón comunitario, búsqueda y notificaciones |
| `NuevaPublicacion.jsx` | Formulario de publicación de ayuda |
| `Perfil.jsx` | Perfil, publicaciones propias, solicitudes y reseñas |

Diagramas de arquitectura del sistema completo: [Backend - C4 Model](https://github.com/VayronMC/VeciredBackend#arquitectura-general).

---

## Guía de instalación

### Requisitos previos

- [Node.js](https://nodejs.org/) 20 o superior
- [npm](https://www.npmjs.com/) 10+
- Backend de VeciRed en ejecución (local o desplegado)
- (Opcional) [Docker](https://www.docker.com/)

### Pasos

1. Clonar el repositorio:

```bash
git clone https://github.com/VayronMC/VeciredFrontend.git
cd VeciredFrontend
```

2. Instalar dependencias:

```bash
npm ci
```

3. Configurar variables de entorno:

```bash
cp .env.example .env
```

Edita `VITE_API_URL` con la URL del backend (ej. `http://localhost:3000`).

4. Instalar navegadores de Playwright (solo si ejecutarás E2E):

```bash
npx playwright install chromium
```

---

## Ejecución local

### Modo desarrollo

Asegúrate de que el backend esté corriendo, luego:

```bash
npm run dev
```

Abre `http://localhost:5173`.

### Build de producción local

```bash
npm run build
npm run preview
```

### Con Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

La app estará en `http://localhost:8080`.

---

## Variables de entorno

| Variable | Descripción |
| :--- | :--- |
| `VITE_API_URL` | URL base del backend (sin barra final) |

Consulta `.env.example`. Las variables `VITE_SUPABASE_*` no son necesarias en la arquitectura actual.

---

## Pruebas

```bash
npm run lint          # Análisis estático
npm run build         # Verificar compilación
npm run test:e2e      # Pruebas end-to-end (Playwright)
```

Evidencias E2E generadas en `e2e-evidence/`.

---

## CI/CD

GitHub Actions (`.github/workflows/ci-cd.yml`) ejecuta en cada Pull Request:

- Lint
- Build del proyecto

Despliegue continuo configurado para la rama `main`.

---

## Despliegue en producción (Vercel)

1. Importar el repositorio en [Vercel](https://vercel.com)
2. **Framework preset:** Vite
3. Variable de entorno: `VITE_API_URL` = URL del backend en Render
4. Desplegar desde la rama `main`

---

## Documentación de API

La documentación Swagger de todos los endpoints está en el backend:

`https://tu-backend.onrender.com/api-docs`

---

## Wiki del repositorio

Información ampliada en la [Wiki de GitHub](https://github.com/VayronMC/VeciredFrontend/wiki).

Páginas fuente en `docs/wiki/`. Ver [docs/wiki/README.md](./docs/wiki/README.md).

---

## Licencia

Privado — Proyecto académico VeciRed.
